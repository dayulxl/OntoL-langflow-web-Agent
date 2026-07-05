"""MemgraphCypherComponent — 图数据库 Cypher 查询组件

支持 Memgraph（零认证）和 Neo4j（用户名/密码认证）。
默认从环境变量 MEMGRAPH_URL / MEMGRAPH_USERNAME / MEMGRAPH_PASSWORD 读取连接信息。
"""
from __future__ import annotations

import os

from lfx.custom.custom_component.component import Component
from lfx.inputs.inputs import MessageTextInput, SecretStrInput, StrInput
from lfx.log.logger import logger
from lfx.schema.data import Data
from lfx.schema.dataframe import DataFrame
from lfx.template.field.base import Output


class MemgraphCypherComponent(Component):
    """执行 Cypher 查询并返回图数据库结果。

    输入:
        cypher_query — 要执行的 Cypher 语句
        bolt_url     — Memgraph/Neo4j Bolt 地址（可选，默认读环境变量）
        username     — 用户名（Memgraph 留空即可）
        password     — 密码（Memgraph 留空即可）

    输出:
        DataFrame — 查询结果表格
    """

    display_name = "Memgraph Cypher"
    description = "Connect to a Memgraph or Neo4j graph database and execute Cypher queries."
    icon = "Database"
    name = "MemgraphCypher"

    inputs = [
        MessageTextInput(
            name="cypher_query",
            display_name="Cypher Query",
            required=True,
            info="The Cypher query to execute against the graph database.",
            tool_mode=True,
        ),
        StrInput(
            name="bolt_url",
            display_name="Bolt URL",
            required=False,
            value=os.getenv("MEMGRAPH_URL", "bolt://localhost:7687"),
            info="Memgraph/Neo4j Bolt connection URL. Default: bolt://localhost:7687",
            advanced=True,
        ),
        StrInput(
            name="username",
            display_name="Username",
            required=False,
            value=os.getenv("MEMGRAPH_USERNAME", ""),
            info="Username for authentication. Leave empty for Memgraph (no auth).",
            advanced=True,
        ),
        SecretStrInput(
            name="password",
            display_name="Password",
            required=False,
            value=os.getenv("MEMGRAPH_PASSWORD", ""),
            info="Password for authentication. Leave empty for Memgraph (no auth).",
            advanced=True,
        ),
    ]

    outputs = [
        Output(display_name="DataFrame", name="table", method="fetch_results_table"),
        Output(display_name="Data", name="raw", method="fetch_results_raw"),
    ]

    def _get_driver(self):
        """创建 neo4j Driver 实例。

        优先尝试 langchain_community.graphs.MemgraphGraph（兼容性最好），
        回退到 neo4j.GraphDatabase.driver（原生驱动）。
        """
        from neo4j import GraphDatabase

        if self.username and self.username.strip():
            return GraphDatabase.driver(self.bolt_url, auth=(self.username, self.password))
        return GraphDatabase.driver(self.bolt_url)

    def _run_cypher(self):
        """执行 Cypher 并返回 records 列表。"""
        driver = self._get_driver()
        try:
            records, summary, keys = driver.execute_query(self.cypher_query)
            logger.info(f"Cypher 执行成功: {len(records)} 行, {summary.counters}")
            return [
                dict(zip(keys, record.values())) if keys else record.data()
                for record in records
            ]
        finally:
            driver.close()

    def fetch_results_table(self) -> DataFrame:
        """执行查询并返回 DataFrame"""
        rows = self._run_cypher()
        if not rows:
            return DataFrame(data=[{"result": "no data"}])
        return DataFrame(data=rows)

    def fetch_results_raw(self) -> list[Data]:
        """执行查询并返回 Data 列表"""
        rows = self._run_cypher()
        return [Data(data=row, text=str(row)) for row in rows]
