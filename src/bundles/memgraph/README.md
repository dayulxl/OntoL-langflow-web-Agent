# lfx-memgraph — Memgraph / Neo4j 图数据库组件

Langflow 扩展包，提供 Cypher 查询执行能力，兼容 Memgraph 和 Neo4j。

## 组件

| 组件 | 说明 |
|------|------|
| `MemgraphCypherComponent` | 执行 Cypher 查询并返回结果表格 |

## 安装

```bash
pip install lfx-memgraph
```

或者开发安装：

```bash
cd src/bundles/memgraph
pip install -e .
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MEMGRAPH_URL` | `bolt://localhost:7687` | Bolt 连接地址 |
| `MEMGRAPH_USERNAME` | (空) | Memgraph 默认空 |
| `MEMGRAPH_PASSWORD` | (空) | Memgraph 默认空 |

## 开发

```bash
uv run lfx extension validate src/bundles/memgraph/src/lfx_memgraph
```

## 清单文件

`extension.json` → `components/memgraph`

注册 ID：`ext:memgraph:MemgraphCypherComponent@official`
