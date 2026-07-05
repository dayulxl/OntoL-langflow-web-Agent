# Memgraph / Neo4j 图数据库连接模块

基于 `neo4j` Python 原生驱动，兼容 Memgraph（零认证）和 Neo4j。

## 文件结构

```
src/neo4j/
├── __init__.py          # 导出 GraphDatabaseClient, get_graph_db
├── client.py            # 连接客户端（查询 / Schema / 导入）
└── README.md            # 本文档
```

## 快速开始

```python
from client import GraphDatabaseClient, get_graph_db

# 方式 1：显式创建
db = GraphDatabaseClient(url="bolt://localhost:7687")

# 方式 2：全局单例（使用环境变量）
db = get_graph_db()

# 查询
nodes = db.query("MATCH (n) RETURN n LIMIT 10")

# Schema
schema = db.fetch_schema()
print(schema["labels"])        # ['Person', 'Company', ...]
print(schema["relationships"]) # ['WORKS_AT', 'KNOWS', ...]

# 写入
db.run("CREATE (n:Person {name: $name})", {"name": "Alice"})
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MEMGRAPH_URL` | `bolt://localhost:7687` | Bolt 连接地址 |
| `MEMGRAPH_USERNAME` | (空) | Memgraph 默认空，Neo4j 默认 neo4j |
| `MEMGRAPH_PASSWORD` | (空) | Memgraph 默认空，Neo4j 默认 neo4j |

## API 参考

### `GraphDatabaseClient`

| 方法 | 返回 | 说明 |
|------|------|------|
| `query(cypher, params)` | `list[dict]` | 执行查询 |
| `query_one(cypher, params)` | `dict \| None` | 返回第一条 |
| `run(cypher, params)` | `list[dict]` | 执行写操作 |
| `run_many(cypher, rows)` | `Any` | 批量执行 |
| `fetch_schema()` | `dict` | `{labels, relationships}` |
| `fetch_node_count()` | `int` | 节点总数 |
| `import_model(model)` | `list[dict]` | 导入本体模型 |
| `import_attrs(attrs)` | `list[dict]` | 批量导入字段属性 |
| `close()` | — | 关闭连接 |

### 属性

| 属性 | 说明 |
|------|------|
| `url` | 连接 URL |
| `username` / `password` | 认证信息 |
| `driver` | 底层 neo4j Driver 实例 |

## 依赖

```bash
uv pip install neo4j
```

Python 标准依赖，无额外 C 扩展。

## 兼容性

| 数据库 | 认证 | 数据库名 | 兼容 |
|--------|------|----------|------|
| Memgraph | 空用户名密码 | 无 database 概念 | ✅ |
| Neo4j Community | neo4j / neo4j | neo4j | ✅ |
| Neo4j Aura | 自定义 | 自定义 | 需配置用户名密码 |

## 相关文档

- [图数据库详细文档](../../docs/neo4j/README.md)
- [架构总览](../../ARCHITECTURE.md)
- [数据库架构](../../docs/backend/DATABASE.md)
