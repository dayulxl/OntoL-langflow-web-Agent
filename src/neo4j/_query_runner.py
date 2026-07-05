"""独立进程 Cypher 执行器——绕过 Windows ProactorEventLoop 死锁

用法:
    python _query_runner.py <json_or_path>
    - 如果参数是 .json 文件路径，读取文件内容
    - 否则直接解析参数为 JSON
"""
from __future__ import annotations
import json, os, sys
from neo4j import GraphDatabase


def main():
    raw = sys.argv[1] if len(sys.argv) > 1 else sys.stdin.read()
    if raw.strip().endswith(".json"):
        with open(raw.strip(), encoding="utf-8") as f:
            raw = f.read()
    try:
        req = json.loads(raw)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"invalid json: {e}"}))
        sys.exit(1)

    url = req.get("url") or os.getenv("MEMGRAPH_URL", "bolt://localhost:7687")
    user = req.get("user") or os.getenv("MEMGRAPH_USERNAME", "")
    pwd = req.get("password") or os.getenv("MEMGRAPH_PASSWORD", "")

    driver = GraphDatabase.driver(url, auth=(user, pwd)) if user else GraphDatabase.driver(url)
    try:
        with driver.session() as s:
            result = s.run(req["cypher"], req.get("params", {}))
            rows = [r.data() for r in result]
        print(json.dumps(rows, default=str))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
    finally:
        driver.close()


if __name__ == "__main__":
    main()
