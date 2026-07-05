# LFX CI/CD 模板

本目录包含 `lfx init` 命令使用的 CI/CD 工作流模板。当你通过 `lfx init` 初始化一个新的工作流项目时，这些模板会被复制到你的项目中。

## 目录结构

```
src/lfx/src/lfx/templates/
├── README.md              # 本文档
├── flows/                 # 示例工作流 JSON 文件
│   └── *.json             # 示例 Flow 定义
├── github-actions/        # GitHub Actions 工作流模板
│   ├── langflow-validate.yml   # PR 时验证 Flow JSON 格式
│   ├── langflow-test.yml       # 集成测试（需要 staging 环境）
│   └── langflow-push.yml       # 推送到生产环境
├── gitlab-ci/             # GitLab CI 工作流模板
│   └── *.yml              # GitLab 流水线定义
└── shell/                 # Shell 脚本模板
    └── *.sh               # 辅助脚本
```

## GitHub Actions

| 文件 | 触发条件 | 所需密钥 |
|------|----------|----------|
| [`github-actions/langflow-validate.yml`](github-actions/langflow-validate.yml) | PR 中包含 `flows/**/*.json` 变更 | 无 |
| [`github-actions/langflow-test.yml`](github-actions/langflow-test.yml) | PR 中包含 Flow 或测试变更 | `LANGFLOW_STAGING_API_KEY` |
| [`github-actions/langflow-push.yml`](github-actions/langflow-push.yml) | 推送到 `main` 分支的 Flow 变更 | `LANGFLOW_PROD_API_KEY` |

### 快速开始

```bash
mkdir -p .github/workflows
cp github-actions/langflow-validate.yml \
   github-actions/langflow-test.yml \
   github-actions/langflow-push.yml \
   .github/workflows/
```

在 **Settings → Environments** 中配置以下变量：

**`staging` 环境**（由 `langflow-test.yml` 使用）：
| 名称 | 类型 | 值 |
|------|------|-----|
| `LANGFLOW_STAGING_URL` | 变量 | `https://staging.langflow.example.com` |
| `LANGFLOW_STAGING_API_KEY` | 密钥 | 暂存环境 API 密钥 |

**`production` 环境**（由 `langflow-push.yml` 使用）：
| 名称 | 类型 | 值 |
|------|------|-----|
| `LANGFLOW_PROD_URL` | 变量 | `https://langflow.example.com` |
| `LANGFLOW_PROD_API_KEY` | 密钥 | 生产环境 API 密钥 |
| `LANGFLOW_PROJECT_NAME` | 变量 | `Production Flows` *(可选)* |

为 `production` 环境添加 **必须审查人** 以保证每次部署都需要人工批准。

---

## GitLab CI

| 文件 | 说明 |
|------|------|
| [`gitlab-ci/langflow.yml`](gitlab-ci/langflow.yml) | 三阶段模板：验证 → 测试 → 部署 |

### 快速开始

```bash
mkdir -p .gitlab/ci
cp gitlab-ci/langflow.yml .gitlab/ci/
```

在 `.gitlab-ci.yml` 中添加：

```yaml
include:
  - local: .gitlab/ci/langflow.yml
```

在 **Settings → CI/CD → Variables** 中配置：

| 变量 | 受保护 | 已屏蔽 | 说明 |
|------|--------|--------|------|
| `LANGFLOW_STAGING_URL` | ✓ | ✗ | 暂存实例 URL |
| `LANGFLOW_STAGING_API_KEY` | ✓ | ✓ | 暂存 API 密钥 |
| `LANGFLOW_PROD_URL` | ✓ | ✗ | 生产实例 URL |
| `LANGFLOW_PROD_API_KEY` | ✓ | ✓ | 生产 API 密钥 |
| `LANGFLOW_PROJECT_NAME` | ✗ | ✗ | 项目文件夹名称 *(可选)* |

---

## Shell 脚本模板 (`shell/`)

`shell/` 目录中的模板（`ci-validate.sh`, `ci-test.sh`, `ci-push.sh`）适用于任何 CI 系统（Jenkins、CircleCI、Bitbucket Pipelines、Azure Pipelines 等），它们由 `lfx init` 复制到 `ci/` 目录。

### 环境变量

#### `ci-validate.sh`

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `FLOWS_DIR` | `flows/` | Flow JSON 文件目录 |
| `VALIDATE_LEVEL` | `4` | 验证深度（1–4） |
| `VALIDATE_FORMAT` | `text` | 输出格式：`text` 或 `json` |
| `LFX_VERSION` | *(最新)* | `lfx` 的 PEP 508 版本约束，如 `>=0.4,<1` |

#### `ci-test.sh`

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LANGFLOW_URL` | — | 目标 Langflow 实例 URL |
| `LANGFLOW_API_KEY` | — | 目标实例 API 密钥 |
| `LANGFLOW_ENV` | — | 配置中的环境名称 |
| `LANGFLOW_ENVIRONMENTS_FILE` | `langflow-environments.toml` | 环境配置文件路径 |
| `TESTS_DIR` | `tests/` | 测试文件目录 |
| `PYTEST_MARKERS` | `integration` | 传给 `pytest -m` 的标记 |
| `SDK_VERSION` | *(最新)* | `langflow-sdk` 的版本约束 |

#### `ci-push.sh`

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LANGFLOW_URL` | — | 目标 Langflow 实例 URL |
| `LANGFLOW_API_KEY` | — | 目标实例 API 密钥 |
| `LANGFLOW_ENV` | — | 配置中的环境名称 |
| `FLOWS_DIR` | `flows/` | Flow JSON 文件目录 |
| `LANGFLOW_PROJECT` | — | 远程实例上的项目（文件夹）名称 |
| `DRY_RUN` | `false` | 设为 `true` 预览变更但不执行 |
| `LFX_VERSION` | *(最新)* | `lfx` 的版本约束 |

---

## 工作流总览

```
PR 提交
  │
  ├── langflow-validate  ──── lfx validate flows/ --level 4
  │                           ↳ Flow 格式错误时阻止合并
  │
  └── langflow-test  ──────── pytest tests/ --langflow-env staging
                              ↳ staging 不可用时优雅跳过

合并到 main 分支
  │
  └── langflow-push  ──────── lfx push --dir flows/ --env production
                              ↳ 按 ID 更新每个 Flow（幂等，可安全重试）
```

## 编写集成测试

安装测试依赖：

```bash
pip install "langflow-sdk[testing]"
```

创建 `tests/test_flows.py`：

```python
def test_rag_flow(flow_runner):
    response = flow_runner("rag-endpoint", "What is Langflow?")
    assert "Langflow" in response.first_text_output()

async def test_async_flow(async_flow_runner):
    response = await async_flow_runner("my-endpoint", "Hello!")
    assert response.first_text_output() is not None
```

在 staging 环境运行：

```bash
LANGFLOW_URL=https://staging.langflow.example.com \
LANGFLOW_API_KEY=<key> \
pytest tests/ -m integration
```

## 相关文档

- [LFX 使用指南](../../README.md)
- [Flow DevOps 工具包](https://docs.langflow.org/flow-devops-sdk)
