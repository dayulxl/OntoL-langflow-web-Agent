# Langflow SDK (Python)

Python SDK 包，允许在 Python 代码中以编程方式调用和管理 Langflow 实例。

## 目录结构

```
src/sdk/
├── README.md                    # 本文档
├── pyproject.toml               # Python 包配置
├── src/langflow_sdk/            # SDK 源代码
│   ├── __init__.py
│   ├── client.py                # API 客户端
│   └── ...
└── tests/                       # SDK 测试
    └── ...
```

## 安装

```bash
pip install langflow-sdk
```

## 快速开始

```python
from langflow_sdk import LangflowClient

# 初始化客户端
client = LangflowClient(
    base_url="http://localhost:7860",
    api_key="sk-..."
)

# 运行工作流
result = client.run_flow(
    flow_id="my-flow-id",
    input_value="Hello, world!"
)

print(result)
```

## 核心功能

- **工作流管理** — 创建、读取、更新、删除工作流
- **工作流执行** — 同步/异步执行工作流
- **组件管理** — 获取可用组件列表和元数据
- **用户管理** — 管理用户和 API 密钥

## 相关文档

- [架构总览](../../ARCHITECTURE.md)
- [LFX CLI](../lfx/README.md)
