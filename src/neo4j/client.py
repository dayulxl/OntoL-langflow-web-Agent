"""Memgraph / Neo4j 图数据库连接客户端

基于 neo4j Python driver，兼容 Memgraph（零认证、无 database 概念）。

环境变量:
    MEMGRAPH_URL       bolt://连接地址 (默认 bolt://localhost:7687)
    MEMGRAPH_USERNAME  用户名 (Memgraph 默认空，Neo4j 默认 neo4j)
    MEMGRAPH_PASSWORD  密码   (Memgraph 默认空，Neo4j 默认 neo4j)
"""
from __future__ import annotations

import os
from typing import Any

from lfx.log.logger import logger
from neo4j import AsyncGraphDatabase, GraphDatabase


class GraphDatabaseClient:
    """Memgraph / Neo4j 图数据库客户端

    用法:
        db = GraphDatabaseClient()
        nodes = await db.query_async("MATCH (n) RETURN n LIMIT 10")
        schema = await db.fetch_schema_async()
        await db.run_async(\"CREATE (n:Person {name: 'Alice'})\")
    """

    def __init__(
        self,
        url: str | None = None,
        username: str | None = None,
        password: str | None = None,
    ):
        self.url = url or os.getenv("MEMGRAPH_URL", "bolt://localhost:7687")
        self.username = username if username is not None else os.getenv("MEMGRAPH_USERNAME", "")
        self.password = password if password is not None else os.getenv("MEMGRAPH_PASSWORD", "")

        if self.username or self.password:
            self._driver = AsyncGraphDatabase.driver(self.url, auth=(self.username, self.password))
            self._sync_driver = GraphDatabase.driver(self.url, auth=(self.username, self.password))
        else:
            self._driver = AsyncGraphDatabase.driver(self.url)
            self._sync_driver = GraphDatabase.driver(self.url)

        logger.info(f"图数据库驱动已创建: {self.url}")

    def _verify(self):
        self._sync_driver.verify_connectivity()

    @property
    def connected(self) -> bool:
        try:
            self._verify()
            return True
        except Exception:
            return False

    # ── 异步查询（供 FastAPI async 端点使用）────────────

    async def query_async(self, cypher: str, params: dict | None = None) -> list[dict[str, Any]]:
        """执行 Cypher（异步）"""
        async with self._driver.session() as session:
            result = await session.run(cypher, params or {})
            records = await result.data()
            return records

    # ── 同步查询（供脚本/非 async 场景使用）──────────────

    def query(self, cypher: str, params: dict | None = None) -> list[dict[str, Any]]:
        """执行 Cypher（同步，仅用于脚本）"""
        with self._sync_driver.session() as session:
            result = session.run(cypher, params or {})
            return [r.data() for r in result]

    def query_one(self, cypher: str, params: dict | None = None) -> dict[str, Any] | None:
        records = self.query(cypher, params)
        return records[0] if records else None

    def run(self, cypher: str, params: dict | None = None) -> list[dict[str, Any]]:
        return self.query(cypher, params)

    # ── Schema ────────────────────────────────────────

    async def fetch_schema_async(self) -> dict[str, list[str]]:
        node_labels = set()
        relationships = set()
        try:
            nodes = await self.query_async("CALL mg.get_label_stats() YIELD label RETURN label")
            node_labels = {r["label"] for r in nodes}
        except Exception:
            try:
                nodes = await self.query_async("MATCH (n) RETURN DISTINCT labels(n) AS labels")
                for r in nodes:
                    node_labels.update(r.get("labels", []))
            except Exception:
                pass
        try:
            rels = await self.query_async("CALL mg.get_edge_types() YIELD edge_type RETURN edge_type")
            relationships = {r["edge_type"] for r in rels}
        except Exception:
            try:
                rels = await self.query_async("MATCH ()-[r]->() RETURN DISTINCT type(r) AS rel_type")
                relationships = {r["rel_type"] for r in rels}
            except Exception:
                pass
        return {"labels": sorted(node_labels), "relationships": sorted(relationships)}

    def fetch_schema(self) -> dict[str, list[str]]:
        import asyncio
        return asyncio.run(self.fetch_schema_async())

    def fetch_node_count(self) -> int:
        try:
            r = self.query_one("MATCH (n) RETURN count(n) AS cnt")
            return r["cnt"] if r else 0
        except Exception:
            return 0

    # ── 导入 ──────────────────────────────────────────

    def import_model(self, model: dict) -> list[dict[str, Any]]:
        props = {k: v for k, v in model.items() if v is not None}
        code = model.get("ontol_code", model["id"])
        return self.run(
            f"CREATE (n:Model:`{code}` {{id: $id}}) SET n = $props RETURN n",
            {"id": model["id"], "props": props},
        )

    def import_attrs(self, attrs: list[dict]) -> list[dict[str, Any]]:
        results = []
        for a in attrs:
            r = self.run(
                """MATCH (m:Model {id: $model_id})
                   CREATE (m)-[:HAS_ATTR]->(a:Attr {id: $id})
                   SET a = $props RETURN a""",
                {"model_id": a["ontol_model_id"], "id": a["id"], "props": a},
            )
            results.extend(r)
        return results

    # ── 清理 ──────────────────────────────────────────

    async def close(self):
        await self._driver.close()
        self._sync_driver.close()


# ── 全局单例 ──────────────────────────────────────────

_graph_db: GraphDatabaseClient | None = None


def get_graph_db() -> GraphDatabaseClient:
    global _graph_db
    if _graph_db is None:
        _graph_db = GraphDatabaseClient()
    return _graph_db
