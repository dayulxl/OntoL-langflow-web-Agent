"""Memgraph 图数据库 API — 全部 async，直接使用 AsyncGraphDatabase"""
from __future__ import annotations

import os, threading
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query
from neo4j import GraphDatabase

router = APIRouter(tags=["Memgraph"], prefix="/memgraph")

# ── 配置 ─────────────────────────────────────────────
_URL = os.getenv("MEMGRAPH_URL", "bolt://localhost:7687")
_USER = os.getenv("MEMGRAPH_USERNAME", "")
_PASS = os.getenv("MEMGRAPH_PASSWORD", "")

# ── 同步驱动（仅用于 verify_connectivity）────────────
_lock = threading.Lock()
_sync_driver = None


def _get_sync():
    global _sync_driver
    if _sync_driver is None:
        with _lock:
            if _sync_driver is None:
                _sync_driver = GraphDatabase.driver(_URL, auth=(_USER, _PASS)) if _USER else GraphDatabase.driver(_URL)
    return _sync_driver


# ── Cypher 执行（Windows 子进程隔离，Linux 原生）───

_CYPHER_SCRIPT = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..", "neo4j", "_query_runner.py"))

def _cypher(cypher: str, params: dict | None = None):
    """执行 Cypher——Windows 用子进程隔离，Linux 用原生驱动"""
    if os.name == "nt":
        import json, subprocess, sys, tempfile
        # 将 URL/User/Pass 写入 JSON 以避免 shell 传递环境变量
        payload = {"cypher": cypher, "params": params or {},
                   "url": _URL, "user": _USER, "password": _PASS}
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False, encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False)
            tmp = f.name
        env = {**os.environ, "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8"}
        try:
            result = subprocess.run([sys.executable, "-X", "utf8", _CYPHER_SCRIPT, tmp],
                capture_output=True, text=True, timeout=30, env=env, encoding="utf-8")
        finally:
            try: os.unlink(tmp)
            except OSError: pass
        combined = (result.stdout + result.stderr).strip()
        if not combined and result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Cypher 执行失败 (rc={result.returncode})")
        try:
            data = json.loads(combined)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail=f"JSON 解析失败 (rc={result.returncode}): {combined[:300]}")
        if isinstance(data, dict) and "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])
        return data if isinstance(data, list) else [data]
    else:
        with _get_sync().session() as s:
            result = s.run(cypher, params or {})
            return [r.data() for r in result]


# ── 状态 ────────────────────────────────────────────

@router.get("/status")
def status():
    try:
        _get_sync().verify_connectivity()
        return {
            "connected": True,
            "url": _URL,
            "node_count": _fetch_node_count(),
            "schema": _fetch_schema_sync(),
        }
    except Exception as e:
        return {"connected": False, "url": _URL, "error": str(e)}


def _fetch_node_count() -> int:
    try:
        with _get_sync().session() as s:
            r = s.run("MATCH (n) RETURN count(n) AS c")
            return r.single()["c"]
    except Exception:
        return 0


def _fetch_schema_sync() -> dict:
    labels = set()
    rels = set()
    with _get_sync().session() as s:
        try:
            for r in s.run("CALL mg.get_label_stats() YIELD label RETURN label"):
                labels.add(r["label"])
        except Exception:
            try:
                for r in s.run("MATCH (n) RETURN DISTINCT labels(n) AS labels"):
                    labels.update(r.get("labels", []))
            except Exception:
                pass
        try:
            for r in s.run("CALL mg.get_edge_types() YIELD edge_type RETURN edge_type"):
                rels.add(r["edge_type"])
        except Exception:
            try:
                for r in s.run("MATCH ()-[r]->() RETURN DISTINCT type(r) AS rel_type"):
                    rels.add(r["rel_type"])
            except Exception:
                pass
    return {"labels": sorted(labels), "relationships": sorted(rels)}


# ── 图数据 ──────────────────────────────────────────

@router.get("/graph")
def get_graph(limit: int = Query(default=500)):
    nodes = _cypher(f"MATCH (n) RETURN n, labels(n) AS _labels, id(n) AS _id LIMIT {limit}")
    edges = _cypher(f"MATCH (a)-[r]->(b) RETURN id(a) AS source, id(b) AS target, type(r) AS label, id(r) AS id LIMIT {limit}")
    result = {"nodes": [], "edges": [dict(e) for e in edges]}
    for n in nodes:
        node_props = n.get("n", {}) or {}
        result["nodes"].append({"id": n["_id"], "labels": n["_labels"], **node_props})
    return result


# ── 节点 CRUD ───────────────────────────────────────

@router.post("/nodes", status_code=201)
def create_node(body: dict):
    labels = ":".join(body.get("labels", ["Node"]))
    props = body.get("props", {})
    if not props:
        raise HTTPException(status_code=400, detail="props 必填")
    sets = ", ".join(f"{k}: ${k}" for k in props)
    cypher = f"CREATE (n:{labels} {{{sets}}}) RETURN n, id(n) AS id, labels(n) AS labels"
    rows = _cypher(cypher, props)
    return {"id": rows[0]["id"], "labels": rows[0].get("labels", [])}


@router.put("/nodes/{node_id}")
def update_node(node_id: int, body: dict):
    props = body.get("props", {})
    if props:
        sets = ", ".join(f"n.{k}=${k}" for k in props)
        _cypher(f"MATCH (n) WHERE id(n)=$id SET {sets}", {"id": node_id, **props})
    if body.get("labels"):
        lbls = ":".join(body["labels"])
        _cypher(f"MATCH (n) WHERE id(n)=$id SET n:{lbls}", {"id": node_id})
    return {"message": "更新成功"}


@router.delete("/nodes/{node_id}")
def delete_node(node_id: int):
    _cypher("MATCH (n) WHERE id(n)=$id DETACH DELETE n", {"id": node_id})
    return {"message": "删除成功"}


# ── 关系 ────────────────────────────────────────────

@router.post("/edges", status_code=201)
def create_edge(body: dict):
    src, tgt, label = body.get("source"), body.get("target"), body.get("label", "RELATES_TO")
    if src is None or tgt is None:
        raise HTTPException(status_code=400, detail="source/target 必填")
    rows = _cypher(
        f"MATCH (a),(b) WHERE id(a)=$src AND id(b)=$tgt CREATE (a)-[r:{label}]->(b) RETURN id(r) AS id, type(r) AS label",
        {"src": src, "tgt": tgt})
    return rows[0] if rows else {"error": "failed"}


@router.delete("/edges/{edge_id}")
def delete_edge(edge_id: int):
    _cypher("MATCH ()-[r]->() WHERE id(r)=$id DELETE r", {"id": edge_id})
    return {"message": "删除成功"}


# ── Cypher 执行 ─────────────────────────────────────

@router.post("/query")
def run_cypher(body: dict):
    cypher = body.get("cypher", "")
    if not cypher:
        raise HTTPException(status_code=400, detail="cypher 必填")
    rows = _cypher(cypher)
    return {"rows": rows, "count": len(rows)}
