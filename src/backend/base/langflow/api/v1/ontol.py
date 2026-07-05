"""本体语义 API — 表不在 Alembic 管理中，直连 SQLite"""
from __future__ import annotations

import sqlite3
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Query

from langflow.services.database.service import get_sqlite_database_file_path
from langflow.services.deps import get_db_service

router = APIRouter(tags=["Ontology"], prefix="/ontology-models")


def _db() -> sqlite3.Connection:
    svc = get_db_service()
    path: Path | None = get_sqlite_database_file_path(str(svc.database_url))
    if path is None:
        raise HTTPException(status_code=500, detail="仅支持 SQLite")
    c = sqlite3.connect(str(path))
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys = ON")
    return c


@router.get("")
def list_models():
    c = _db()
    try:
        rows = c.execute("SELECT * FROM ontol_model WHERE delete_flag='0' ORDER BY ontol_model_type, ontol_name").fetchall()
        id_map = {r["id"]: dict(r) for r in rows}

        def depth(nid):
            d = 0
            cur = id_map.get(nid, {})
            while cur.get("ontol_parent_id") and cur["ontol_parent_id"] in id_map:
                d += 1
                cur = id_map[cur["ontol_parent_id"]]
            return d

        out = []
        for r in rows:
            d = dict(r)
            d["depth"] = depth(d["id"])
            attrs = c.execute(
                "SELECT * FROM ontol_model_attr WHERE ontol_model_id=? AND delete_flag='0' ORDER BY attr_code", [d["id"]]
            ).fetchall()
            d["attributes"] = [dict(a) for a in attrs]
            out.append(d)
        return out
    finally:
        c.close()


@router.get("/tree")
def get_tree():
    c = _db()
    try:
        rows = c.execute("SELECT * FROM ontol_model WHERE delete_flag='0' ORDER BY ontol_model_type, ontol_name").fetchall()
        models = [dict(r) for r in rows]
        for m in models:
            m["attributes"] = [dict(a) for a in c.execute(
                "SELECT * FROM ontol_model_attr WHERE ontol_model_id=? AND delete_flag='0'", [m["id"]]
            ).fetchall()]

        def build(pid):
            children = [x for x in models if x.get("ontol_parent_id") == pid]
            for x in children:
                x["children"] = build(x["id"])
            return children
        return build(None) or [{**x, "children": []} for x in models]
    finally:
        c.close()


@router.get("/search")
def search_models(keyword: str = Query(default=""), limit: int = Query(default=50)):
    c = _db()
    try:
        kw = f"%{keyword}%"
        return [dict(r) for r in c.execute(
            """SELECT * FROM ontol_model WHERE delete_flag='0'
               AND (ontol_name LIKE ? OR ontol_code LIKE ? OR ontol_model_desc LIKE ? OR ontol_model_type LIKE ?)
               ORDER BY ontol_model_type, ontol_name LIMIT ?""",
            [kw, kw, kw, kw, limit],
        ).fetchall()]
    finally:
        c.close()


@router.get("/{model_id}")
def get_model(model_id: str, with_attrs: bool = Query(default=False)):
    c = _db()
    try:
        r = c.execute("SELECT * FROM ontol_model WHERE id=? AND delete_flag='0'", [model_id]).fetchone()
        if not r:
            raise HTTPException(status_code=404, detail="模板不存在")
        d = dict(r)
        if with_attrs:
            d["attributes"] = [dict(a) for a in c.execute(
                "SELECT * FROM ontol_model_attr WHERE ontol_model_id=? AND delete_flag='0' ORDER BY attr_code", [model_id]
            ).fetchall()]
        return d
    finally:
        c.close()


@router.post("", status_code=201)
def create_model(body: dict):
    mid = body.get("id") or str(uuid4()).replace("-", "_")[:20]
    if mid == "placeholder":
        mid = str(uuid4()).replace("-", "_")[:20]
    c = _db()
    try:
        c.execute(
            """INSERT INTO ontol_model (id, ontol_parent_id, ontol_name, ontol_model_type,
               ontol_model_status, ontol_model_desc, ontol_code, create_id, delete_flag)
               VALUES (?,?,?,?,?,?,?,?,'0')""",
            [mid, body.get("ontol_parent_id"), body["ontol_name"], body["ontol_model_type"],
             body.get("ontol_model_status", "0"), body.get("ontol_model_desc", ""),
             body.get("ontol_code", ""), body.get("create_id", "admin")],
        )
        c.commit()
        return {"id": mid, "message": "创建成功"}
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"数据冲突: {e}")
    finally:
        c.close()


@router.put("/{model_id}")
def update_model(model_id: str, body: dict):
    c = _db()
    try:
        if not c.execute("SELECT id FROM ontol_model WHERE id=? AND delete_flag='0'", [model_id]).fetchone():
            raise HTTPException(status_code=404, detail="模板不存在")
        fields = ["ontol_parent_id", "ontol_name", "ontol_model_type", "ontol_model_status", "ontol_model_desc", "ontol_code"]
        sets = [f"{f}=?" for f in fields if f in body]
        if sets:
            vals = [body[f] for f in fields if f in body] + [body.get("update_id", "admin"), model_id]
            c.execute(f"UPDATE ontol_model SET {', '.join(sets)}, update_id=?, update_time=datetime('now') WHERE id=?", vals)
            c.commit()
        return {"message": "更新成功"}
    finally:
        c.close()


@router.delete("/{model_id}")
def delete_model(model_id: str, soft: bool = Query(default=True)):
    c = _db()
    try:

        def _soft(mid):
            c.execute("UPDATE ontol_model SET delete_flag='1' WHERE id=? AND delete_flag='0'", [mid])
            for ch in c.execute("SELECT id FROM ontol_model WHERE ontol_parent_id=? AND delete_flag='0'", [mid]).fetchall():
                _soft(ch["id"])

        if soft:
            _soft(model_id)
        else:
            c.execute("DELETE FROM ontol_model WHERE id=?", [model_id])
        c.commit()
        return {"message": "删除成功"}
    finally:
        c.close()


@router.post("/{model_id}/attrs", status_code=201)
def create_attr(model_id: str, body: dict):
    c = _db()
    try:
        if not c.execute("SELECT id FROM ontol_model WHERE id=? AND delete_flag='0'", [model_id]).fetchone():
            raise HTTPException(status_code=404, detail="模板不存在")
        if body.get("attr_name") and c.execute(
            "SELECT id FROM ontol_model_attr WHERE ontol_model_id=? AND attr_name=? AND delete_flag='0'",
            [model_id, body["attr_name"]],
        ).fetchone():
            raise HTTPException(status_code=409, detail=f"字段「{body['attr_name']}」已存在")
        aid = body.get("id") or str(uuid4()).replace("-", "_")[:20]
        if aid == "placeholder":
            aid = str(uuid4()).replace("-", "_")[:20]
        c.execute(
            "INSERT INTO ontol_model_attr (id, ontol_model_id, attr_name, attr_code, attr_data_type, attr_length, attr_digit, attr_is_only, attr_required, attr_default_value, attr_is_system, attr_desc, create_id, delete_flag) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [aid, model_id, body.get("attr_name", ""), body.get("attr_code", ""), body.get("attr_data_type", "0"),
             body.get("attr_length"), body.get("attr_digit"), body.get("attr_is_only", "0"),
             body.get("attr_required", "0"), body.get("attr_default_value"), body.get("attr_is_system", "0"),
             body.get("attr_desc"), body.get("create_id", "admin"), "0"],
        )
        c.commit()
        return {"id": aid, "message": "创建成功"}
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"数据冲突: {e}")
    finally:
        c.close()


@router.put("/{model_id}/attrs/{attr_id}")
def update_attr(model_id: str, attr_id: str, body: dict):
    c = _db()
    try:
        if not c.execute("SELECT id FROM ontol_model_attr WHERE id=? AND delete_flag='0'", [attr_id]).fetchone():
            raise HTTPException(status_code=404, detail="属性不存在")
        fields = ["ontol_model_id", "attr_name", "attr_code", "attr_data_type", "attr_length", "attr_digit",
                   "attr_is_only", "attr_required", "attr_default_value", "attr_is_system", "attr_desc"]
        sets = [f"{f}=?" for f in fields if f in body]
        if sets:
            c.execute(f"UPDATE ontol_model_attr SET {', '.join(sets)} WHERE id=?", [body[f] for f in fields if f in body] + [attr_id])
            c.commit()
        return {"message": "更新成功"}
    finally:
        c.close()


@router.delete("/{model_id}/attrs/{attr_id}")
def delete_attr(model_id: str, attr_id: str):
    c = _db()
    try:
        c.execute("UPDATE ontol_model_attr SET delete_flag='1' WHERE id=?", [attr_id])
        c.commit()
        return {"message": "删除成功"}
    finally:
        c.close()


# ── ontol_model_scene CRUD ──────────────────────────────

scene_router = APIRouter(tags=["Ontology"], prefix="/ontology-scenes")


@scene_router.get("")
def list_scenes():
    c = _db()
    try:
        rows = c.execute(
            "SELECT * FROM ontol_model_scene WHERE delete_flag='0' ORDER BY scene_name"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        c.close()


@scene_router.get("/{scene_id}")
def get_scene(scene_id: str):
    c = _db()
    try:
        r = c.execute(
            "SELECT * FROM ontol_model_scene WHERE id=? AND delete_flag='0'", [scene_id]
        ).fetchone()
        if not r:
            raise HTTPException(status_code=404, detail="场景不存在")
        return dict(r)
    finally:
        c.close()


@scene_router.post("", status_code=201)
def create_scene(body: dict):
    sid = body.get("id") or str(uuid4()).replace("-", "_")[:20]
    if sid == "placeholder":
        sid = str(uuid4()).replace("-", "_")[:20]
    c = _db()
    try:
        c.execute(
            "INSERT INTO ontol_model_scene (id, scene_name, scene_desc, scene_is_system, create_id, delete_flag) VALUES (?,?,?,?,?,?)",
            [sid, body["scene_name"], body.get("scene_desc", ""),
             body.get("scene_is_system", "0"), body.get("create_id", "admin"), "0"],
        )
        c.commit()
        return {"id": sid, "message": "创建成功"}
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"数据冲突: {e}")
    finally:
        c.close()


@scene_router.put("/{scene_id}")
def update_scene(scene_id: str, body: dict):
    c = _db()
    try:
        if not c.execute(
            "SELECT id FROM ontol_model_scene WHERE id=? AND delete_flag='0'", [scene_id]
        ).fetchone():
            raise HTTPException(status_code=404, detail="场景不存在")
        sets, vals = [], []
        for f in ["scene_name", "scene_desc", "scene_is_system"]:
            if f in body:
                sets.append(f"{f}=?")
                vals.append(body[f])
        if sets:
            vals.append(scene_id)
            c.execute(f"UPDATE ontol_model_scene SET {', '.join(sets)} WHERE id=?", vals)
            c.commit()
        return {"message": "更新成功"}
    finally:
        c.close()


@scene_router.delete("/{scene_id}")
def delete_scene(scene_id: str):
    c = _db()
    try:
        c.execute("UPDATE ontol_model_scene SET delete_flag='1' WHERE id=?", [scene_id])
        c.commit()
        return {"message": "删除成功"}
    finally:
        c.close()


# ── ontol_node_scene_relation CRUD ──────────────────────

node_scene_router = APIRouter(tags=["Ontology"], prefix="/ontology-node-scene-relations")


@node_scene_router.get("")
def list_node_scenes():
    c = _db()
    try:
        return [dict(r) for r in c.execute(
            "SELECT * FROM ontol_node_scene_relation WHERE delete_flag='0' ORDER BY scene_id"
        ).fetchall()]
    finally:
        c.close()


@node_scene_router.post("", status_code=201)
def create_node_scene(body: dict):
    sid = body.get("id") or str(uuid4()).replace("-", "_")[:20]
    if sid == "placeholder":
        sid = str(uuid4()).replace("-", "_")[:20]
    c = _db()
    try:
        c.execute(
            "INSERT INTO ontol_node_scene_relation (id, scene_id, scene_desc, create_id, delete_flag) VALUES (?,?,?,?,?)",
            [sid, body["scene_id"], body.get("scene_desc", ""), body.get("create_id", "admin"), "0"],
        )
        c.commit()
        return {"id": sid, "message": "创建成功"}
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"数据冲突: {e}")
    finally:
        c.close()


@node_scene_router.put("/{relation_id}")
def update_node_scene(relation_id: str, body: dict):
    c = _db()
    try:
        if not c.execute(
            "SELECT id FROM ontol_node_scene_relation WHERE id=? AND delete_flag='0'", [relation_id]
        ).fetchone():
            raise HTTPException(status_code=404, detail="关系不存在")
        sets, vals = [], []
        for f in ["scene_id", "scene_desc"]:
            if f in body:
                sets.append(f"{f}=?")
                vals.append(body[f])
        if sets:
            vals.append(relation_id)
            c.execute(f"UPDATE ontol_node_scene_relation SET {', '.join(sets)} WHERE id=?", vals)
            c.commit()
        return {"message": "更新成功"}
    finally:
        c.close()


@node_scene_router.delete("/{relation_id}")
def delete_node_scene(relation_id: str):
    c = _db()
    try:
        c.execute("UPDATE ontol_node_scene_relation SET delete_flag='1' WHERE id=?", [relation_id])
        c.commit()
        return {"message": "删除成功"}
    finally:
        c.close()


# ── ontol_char_scene_relation CRUD ──────────────────────

char_scene_router = APIRouter(tags=["Ontology"], prefix="/ontology-char-scene-relations")


@char_scene_router.get("")
def list_char_scenes():
    c = _db()
    try:
        return [dict(r) for r in c.execute(
            "SELECT * FROM ontol_char_scene_relation WHERE delete_flag='0' ORDER BY chart_id"
        ).fetchall()]
    finally:
        c.close()


@char_scene_router.post("", status_code=201)
def create_char_scene(body: dict):
    sid = body.get("id") or str(uuid4()).replace("-", "_")[:20]
    if sid == "placeholder":
        sid = str(uuid4()).replace("-", "_")[:20]
    c = _db()
    try:
        c.execute(
            "INSERT INTO ontol_char_scene_relation (id, chart_id, scene_id, create_id, delete_flag) VALUES (?,?,?,?,?)",
            [sid, body["chart_id"], body.get("scene_id"), body.get("create_id", "admin"), "0"],
        )
        c.commit()
        return {"id": sid, "message": "创建成功"}
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"数据冲突: {e}")
    finally:
        c.close()


@char_scene_router.put("/{relation_id}")
def update_char_scene(relation_id: str, body: dict):
    c = _db()
    try:
        if not c.execute(
            "SELECT id FROM ontol_char_scene_relation WHERE id=? AND delete_flag='0'", [relation_id]
        ).fetchone():
            raise HTTPException(status_code=404, detail="关系不存在")
        sets, vals = [], []
        for f in ["chart_id", "scene_id"]:
            if f in body:
                sets.append(f"{f}=?")
                vals.append(body[f])
        if sets:
            vals.append(relation_id)
            c.execute(f"UPDATE ontol_char_scene_relation SET {', '.join(sets)} WHERE id=?", vals)
            c.commit()
        return {"message": "更新成功"}
    finally:
        c.close()


@char_scene_router.delete("/{relation_id}")
def delete_char_scene(relation_id: str):
    c = _db()
    try:
        c.execute("UPDATE ontol_char_scene_relation SET delete_flag='1' WHERE id=?", [relation_id])
        c.commit()
        return {"message": "删除成功"}
    finally:
        c.close()


# ── ontol_data_his CRUD ─────────────────────────────────

data_his_router = APIRouter(tags=["Ontology"], prefix="/ontology-data-his")


@data_his_router.get("")
def list_data_his():
    c = _db()
    try:
        return [dict(r) for r in c.execute(
            "SELECT * FROM ontol_data_his WHERE delete_flag='0' ORDER BY create_time DESC"
        ).fetchall()]
    finally:
        c.close()


@data_his_router.post("", status_code=201)
def create_data_his(body: dict):
    sid = body.get("id") or str(uuid4()).replace("-", "_")[:20]
    if sid == "placeholder":
        sid = str(uuid4()).replace("-", "_")[:20]
    c = _db()
    try:
        c.execute(
            "INSERT INTO ontol_data_his (id, node_id, context, create_id, delete_flag) VALUES (?,?,?,?,?)",
            [sid, body["node_id"], body["context"], body.get("create_id", "admin"), "0"],
        )
        c.commit()
        return {"id": sid, "message": "创建成功"}
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=f"数据冲突: {e}")
    finally:
        c.close()


@data_his_router.put("/{history_id}")
def update_data_his(history_id: str, body: dict):
    c = _db()
    try:
        if not c.execute(
            "SELECT id FROM ontol_data_his WHERE id=? AND delete_flag='0'", [history_id]
        ).fetchone():
            raise HTTPException(status_code=404, detail="历史记录不存在")
        sets, vals = [], []
        for f in ["node_id", "context"]:
            if f in body:
                sets.append(f"{f}=?")
                vals.append(body[f])
        if sets:
            vals.append(history_id)
            c.execute(f"UPDATE ontol_data_his SET {', '.join(sets)} WHERE id=?", vals)
            c.commit()
        return {"message": "更新成功"}
    finally:
        c.close()


@data_his_router.delete("/{history_id}")
def delete_data_his(history_id: str):
    c = _db()
    try:
        c.execute("UPDATE ontol_data_his SET delete_flag='1' WHERE id=?", [history_id])
        c.commit()
        return {"message": "删除成功"}
    finally:
        c.close()
