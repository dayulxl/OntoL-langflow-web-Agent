"""ORM 模型校对 — SQLite 表结构 vs SQLModel 定义

用法:  uv run python scripts/verify_orm_models.py [table_name...]
"""
from __future__ import annotations

import re
import sqlite3
import sys
from pathlib import Path
from typing import Any

import langflow


def parse_ddl(ddl: str) -> dict[str, dict[str, Any]]:
    """解析 CREATE TABLE DDL"""
    match = re.search(r"\((.*)\)", ddl, re.DOTALL)
    if not match:
        return {}
    body = match.group(1)

    cols: dict[str, dict[str, Any]] = {}

    for raw in body.split(","):
        raw = raw.strip()
        # 跳过约束行
        if re.match(r"^\s*(FOREIGN\s+KEY|PRIMARY\s+KEY|UNIQUE|CHECK|CONSTRAINT)", raw, re.I):
            # 提取独立 PRIMARY KEY 声明的列名
            pk_match = re.match(r"^\s*PRIMARY\s+KEY\s*\(\s*(\w+)\s*\)", raw, re.I)
            if pk_match:
                name = pk_match.group(1)
                if name in cols:
                    cols[name]["pk"] = True
            continue

        # 解析列: col_name TYPE [NOT NULL] [PRIMARY KEY] [DEFAULT xxx]
        parts = raw.split()
        if len(parts) < 2:
            continue

        name = parts[0]
        ctype = parts[1].upper()
        rest = " ".join(parts[2:]).upper()

        nullable = "NOT NULL" not in rest
        pk = "PRIMARY KEY" in rest or "PRIMARY" in rest

        default = None
        def_match = re.search(r"DEFAULT\s+(.+?)$", raw, re.I)
        if def_match:
            default = def_match.group(1).strip().rstrip(",")
            # 去掉引号和括号
            default = default.strip("'\"").strip("()")

        cols[name] = {"type": ctype, "nullable": nullable, "default": default, "pk": pk}

    return cols


def get_table_info(table_name: str, db_path: str) -> dict[str, dict[str, Any]]:
    conn = sqlite3.connect(db_path)
    try:
        rows = conn.execute(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name=?", [table_name]
        ).fetchall()
        if not rows:
            return {}
        return parse_ddl(rows[0][0])
    finally:
        conn.close()


def get_model_info(model_class) -> dict[str, dict[str, Any]]:
    table = model_class.__table__
    fields: dict[str, dict[str, Any]] = {}
    for col in table.columns:
        ctype = str(col.type).upper()
        if "TEXT" in ctype:
            ctype = "TEXT"
        elif "INTEGER" in ctype or "INT" in ctype:
            ctype = "INTEGER"
        elif "REAL" in ctype or "FLOAT" in ctype:
            ctype = "REAL"

        default = None
        try:
            if col.default is not None and hasattr(col.default, "arg") and col.default.arg is not None:
                default = str(col.default.arg).strip("'\"")
            elif col.server_default is not None:
                sd = col.server_default
                if hasattr(sd, "arg") and sd.arg is not None:
                    default = str(sd.arg).strip("'\"")
        except Exception:
            pass

        # 标准化 default 字符串
        if default:
            default = default.strip("()").strip("'\"")

        fields[col.name] = {
            "type": ctype,
            "nullable": col.nullable,
            "default": default,
            "pk": col.primary_key,
        }
    return fields


def _norm_default(d: str | None) -> str:
    """标准化 default 值用于比较"""
    if not d:
        return ""
    d = d.strip().strip("'\"")
    # datetime('now') == (datetime('now'))
    d = d.replace("(datetime('now'))", "datetime('now')")
    # '0' == 0
    if d in ("'0'", "0"):
        return "0"
    if d in ("''", ""):
        return ""
    return d


def verify_table(table_name: str, model_class, db_path: str) -> list[str]:
    db_cols = get_table_info(table_name, db_path)
    model_cols = get_model_info(model_class)
    if not db_cols:
        return [f"❌ 数据库中没有表 {table_name}"]
    errors: list[str] = []
    all_names = sorted(set(db_cols.keys()) | set(model_cols.keys()))
    for name in all_names:
        db = db_cols.get(name)
        md = model_cols.get(name)
        if db and not md:
            errors.append(f"  ⚠ {name}: DB有, ORM缺")
            continue
        if md and not db:
            errors.append(f"  ⚠ {name}: ORM有, DB缺")
            continue
        if db["type"] != md["type"]:
            errors.append(f"  ❌ {name}: 类型 DB={db['type']} ORM={md['type']}")
        if not db["pk"] and not md["pk"] and db["nullable"] != md["nullable"]:
            errors.append(f"  ❌ {name}: nullable DB={'NULL' if db['nullable'] else 'NOT NULL'} ORM={'NULL' if md['nullable'] else 'NOT NULL'}")
        if _norm_default(db["default"]) != _norm_default(md["default"]):
            errors.append(f"  ⚠ {name}: default DB='{db['default']}' ORM='{md['default']}'")
    return errors


def main():
    db_path = Path(langflow.__file__).parent / "langflow.db"
    if not db_path.exists():
        print(f"数据库不存在: {db_path}")
        sys.exit(1)

    from langflow.services.database.models.ontol.model import OntolModel, OntolModelAttr

    targets = {"ontol_model": OntolModel, "ontol_model_attr": OntolModelAttr}
    if sys.argv[1:]:
        targets = {k: v for k, v in targets.items() if k in sys.argv[1:]}

    all_ok = True
    for tn, mc in targets.items():
        print(f"━━━ {tn} ━━━")
        errors = verify_table(tn, mc, str(db_path))
        if errors:
            for e in errors:
                print(e)
            all_ok = False
        else:
            print("  ✅ 完全匹配")
        print()
    if not all_ok:
        print("🔴 发现差异，修正后再启动。")
        sys.exit(1)
    else:
        print("🟢 所有模型与数据库一致。")
        sys.exit(0)


if __name__ == "__main__":
    main()
