# 数据库目录索引 (SQLite)

> 数据库引擎: SQLite（嵌入式、零配置）
> ORM 框架: SQLAlchemy 2.x + SQLModel
> 迁移工具: Alembic
> 模型路径: `src/backend/base/langflow/services/database/models/`

---

## 一、数据库文件位置

### 默认 SQLite 数据库

```
src/backend/base/langflow/langflow.db        # 正式版本
src/backend/base/langflow/langflow-pre.db     # 预发布版本
```

完整路径：`D:\OntoL-langflow-web-Agent\src\backend\base\langflow\langflow.db`

### 配置方式

数据库文件位置由 `DatabaseSettings` 自动决定：

1. 优先读取环境变量 `LANGFLOW_DATABASE_URL`
2. 未设置时自动使用 `sqlite:///<langflow 包目录>/langflow.db`
3. 设置 `save_db_in_config_dir=True` 后，数据库存储到 `LANGFLOW_CONFIG_DIR`

---

## 二、表结构总览（34 张表）

### 用户与认证

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `user` | [`models/user/model.py`](../../src/backend/base/langflow/services/database/models/user/model.py) | `id`, `username`, `password`, `is_active`, `is_superuser`, `profile_image`, `last_login_at` | 用户基本信息 |
| `apikey` | [`models/api_key/model.py`](../../src/backend/base/langflow/services/database/models/api_key/model.py) | `id`, `user_id`, `api_key`, `name`, `created_at` | API 密钥管理 |
| `sso_config` | [`models/auth/sso.py`](../../src/backend/base/langflow/services/database/models/auth/sso.py) | SSO 单点登录配置 | 第三方登录配置 |
| `sso_user_profile` | [`models/auth/sso.py`](../../src/backend/base/langflow/services/database/models/auth/sso.py) | SSO 用户关联 | 第三方账号绑定 |

### 权限控制（RBAC）

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `authz_role` | [`models/auth/authz.py`](../../src/backend/base/langflow/services/database/models/auth/authz.py) | `id`, `name`, `is_system`, `permissions` | 角色定义（内置 viewer/developer/admin） |
| `authz_role_assignment` | 同上 | `user_id`, `role_id`, `resource_type`, `resource_id` | 用户→角色绑定 |
| `authz_team` | 同上 | `id`, `name`, `workspace_id` | 团队定义 |
| `authz_team_member` | 同上 | `team_id`, `user_id` | 团队成员关系 |
| `authz_share` | 同上 | `id`, `resource_type`, `resource_id`, `shared_with_id` | 资源共享记录 |
| `authz_edit_lock` | 同上 | `resource_type`, `resource_id`, `user_id` | 编辑锁（防止并发编辑） |
| `authz_audit_log` | 同上 | `user_id`, `resource_type`, `resource_id`, `action`, `result` | 权限审计日志 |
| `casbin_rule` | 同上 | Casbin 格式规则 | RBAC 策略存储 |

### 工作流（Flow）

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `flow` | [`models/flow/model.py`](../../src/backend/base/langflow/services/database/models/flow/model.py) | `id`, `name`, `description`, `data` (JSON), `user_id`, `folder_id`, `is_component`, `endpoint_name`, `icon`, `gradient`, `tags` | **核心表** — 工作流定义 |
| `flow_version` | [`models/flow_version/model.py`](../../src/backend/base/langflow/services/database/models/flow_version/model.py) | `id`, `flow_id`, `version`, `data`, `name` | Flow 版本快照 |
| `flow_version_deployment_attachment` | [`models/flow_version_deployment_attachment/model.py`](../../src/backend/base/langflow/services/database/models/flow_version_deployment_attachment/model.py) | `deployment_id`, `flow_version_id` | 部署→Flow 版本关联 |

### 文件夹

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `folder` | [`models/folder/model.py`](../../src/backend/base/langflow/services/database/models/folder/model.py) | `id`, `name`, `description`, `parent_id`, `user_id`, `workspace_id`, `auth_settings` | 文件夹/项目（支持树形结构） |

### 部署

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `deployment` | [`models/deployment/model.py`](../../src/backend/base/langflow/services/database/models/deployment/model.py) | `id`, `name`, `type`, `status`, `config`, `user_id`, `folder_id` | Flow 部署配置 |
| `deployment_provider_account` | [`models/deployment_provider_account/model.py`](../../src/backend/base/langflow/services/database/models/deployment_provider_account/model.py) | `id`, `provider`, `credentials`, `user_id` | 部署提供商账号 |

### 知识库

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `knowledge_base` | [`models/knowledge_base/model.py`](../../src/backend/base/langflow/services/database/models/knowledge_base/model.py) | `id`, `name`, `description`, `config`, `user_id` | 知识库定义 |
| `ingestion_run` | [`models/ingestion_run/model.py`](../../src/backend/base/langflow/services/database/models/ingestion_run/model.py) | `id`, `kb_id`, `status`, `stats` | 文档摄入运行记录 |

### 记忆（Memory）

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `memory_base` | [`models/memory_base/model.py`](../../src/backend/base/langflow/services/database/models/memory_base/model.py) | `id`, `name`, `type`, `config`, `user_id` | 记忆存储定义 |
| `memory_base_session` | 同上 | `id`, `memory_id`, `session_id`, `summary` | 记忆会话记录 |
| `memory_base_workflow_run` | 同上 | `id`, `memory_id`, `session_id`, `flow_id` | 记忆工作流运行记录 |
| `memory_base_preprocessing_output` | 同上 | `id`, `memory_id`, `status` | 记忆预处理输出 |

### 消息与对话

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `message` | [`models/message/model.py`](../../src/backend/base/langflow/services/database/models/message/model.py) | `id`, `flow_id`, `session_id`, `sender`, `text`, `timestamp` | Flow 执行聊天消息 |
| `message_ingestion_record` | 同上 | 消息摄入记录 | 消息处理追踪 |

### 追踪与可观测性

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `trace` | [`models/traces/model.py`](../../src/backend/base/langflow/services/database/models/traces/model.py) | `id`, `flow_id`, `session_id`, `start_time`, `end_time`, `status` | Flow 执行追踪 |
| `span` | 同上 | `id`, `trace_id`, `parent_id`, `component`, `start_time`, `end_time`, `input`, `output` | 组件级别 Span |
| `transaction` | [`models/transactions/model.py`](../../src/backend/base/langflow/services/database/models/transactions/model.py) | `id`, `flow_id`, `session_id`, `timestamp`, `data` | API 事务记录 |

### 任务与构建

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `job` | [`models/jobs/model.py`](../../src/backend/base/langflow/services/database/models/jobs/model.py) | `id`, `name`, `status`, `user_id` | 后台任务队列 |
| `vertex_build` | [`models/vertex_builds/model.py`](../../src/backend/base/langflow/services/database/models/vertex_builds/model.py) | `id`, `flow_id`, `vertex_id`, `status`, `data` | 组件编译构建记录 |

### 文件

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `file` | [`models/file/model.py`](../../src/backend/base/langflow/services/database/models/file/model.py) | `id`, `name`, `path`, `size`, `type`, `user_id`, `folder_id` | 上传文件管理 |

### 全局变量

| 表名 | 模型文件 | 主要字段 | 说明 |
|------|----------|----------|------|
| `variable` | [`models/variable/model.py`](../../src/backend/base/langflow/services/database/models/variable/model.py) | `id`, `name`, `value`, `type`, `user_id` | 全局环境变量（API Key 等） |

### 迁移版本

| 表名 | 说明 |
|------|------|
| `alembic_version` | Alembic 迁移版本号记录 |

---

## 三、核心表 ER 关系

```
user ──1:N──▶ flow ──1:N──▶ flow_version
  │              │                 │
  │              │                 └──N:M──▶ deployment (via flow_version_deployment_attachment)
  │              │
  │              └──1:N──▶ message
  │              └──1:N──▶ transaction
  │              └──1:N──▶ trace ──1:N──▶ span
  │              └──1:N──▶ vertex_build
  │
  ├──1:N──▶ folder ──1:N──▶ flow
  │              └──1:N──▶ deployment
  │
  ├──1:N──▶ apikey
  ├──1:N──▶ file
  ├──1:N──▶ variable
  ├──1:N──▶ knowledge_base ──1:N──▶ ingestion_run
  ├──1:N──▶ memory_base ──1:N──▶ memory_base_session
  │                              └──1:N──▶ memory_base_workflow_run
  │
  └──N:M──▶ authz_role (via authz_role_assignment)
```

---

## 四、数据库服务层

### 核心服务

| 文件 | 说明 |
|------|------|
| [`services/database/service.py`](../../src/backend/base/langflow/services/database/service.py) | 数据库服务 — 引擎管理、连接池、迁移锁 |
| [`services/database/factory.py`](../../src/backend/base/langflow/services/database/factory.py) | 服务工厂 — 根据 settings 创建数据库服务 |
| [`services/database/utils.py`](../../src/backend/base/langflow/services/database/utils.py) | 数据库工具 — 健康检查、路径校验 |

### 配置管理

| 文件 | 说明 |
|------|------|
| [`src/lfx/src/lfx/services/settings/groups/database.py`](../../src/lfx/src/lfx/services/settings/groups/database.py) | `DatabaseSettings` — 数据库 URL、连接池、SQLite PRAGMA |

### 关键配置参数

```python
# 连接池（默认值）
pool_size: 20          # 保持打开的连接数
max_overflow: 30       # 允许超出的额外连接数
pool_timeout: 30       # 等待可用连接的超时秒数
pool_recycle: 1800     # 连接回收秒数（防止超时断开）

# SQLite PRAGMA（默认值）
synchronous: NORMAL    # 写同步级别
journal_mode: WAL      # 预写日志模式（提升并发读性能）
busy_timeout: 30000    # 忙碌等待超时（毫秒）
```

---

## 五、数据库迁移

### 迁移文件

```
src/backend/base/langflow/alembic/versions/
```

### 常用命令

```bash
# 生成迁移文件
make alembic-revision message="描述变更"

# 升级到最新
make alembic-upgrade

# 回滚一个版本
make alembic-downgrade

# 查看迁移历史
uv run alembic history
```

### 迁移验证

CI 中通过以下工作流自动检查：

| 工作流 | 说明 |
|--------|------|
| `db-migration-validation.yml` | 数据库迁移正确性验证 |
| `migration-validation.yml` | 迁移兼容性验证 |

---

## 六、快速查询示例

```bash
# 进入项目目录
cd d:/OntoL-langflow-web-Agent

# 用 Python 查询数据库
uv run python -c "
import sqlite3
conn = sqlite3.connect('src/backend/base/langflow/langflow.db')

# 查看所有 Flow
for row in conn.execute('SELECT id, name, user_id FROM flow LIMIT 5'):
    print(row)

# 查看所有用户
for row in conn.execute('SELECT id, username, is_superuser FROM user'):
    print(row)

conn.close()
"
```

---

## 七、相关文档

- [架构总览](../../ARCHITECTURE.md) — 项目级架构
- [后端模块说明](../../src/backend/README.md) — 后端整体架构
- [开发环境搭建](../../DEVELOPMENT.md) — 本地开发配置
- [DatabaseSettings 源码](../../src/lfx/src/lfx/services/settings/groups/database.py) — 数据库配置类
- [数据库服务源码](../../src/backend/base/langflow/services/database/service.py) — 服务实现

---

## 八、独立本体表（OntoL 扩展）

以下 6 张表由用户手工 SQL 创建，**不在 SQLModel / Alembic 管理范围内**。API 通过 `DatabaseService → SQLite 直连` 操作。

### 8.1 表清单与 API

| 表名 | 说明 | API 路由 |
|------|------|----------|
| `ontol_model` | 本体模板（树形 id → parent_id） | `/api/v1/ontology-models` GET/POST/PUT/DELETE |
| `ontol_model_attr` | 模板字段属性（FK → ontol_model） | `/api/v1/ontology-models/{id}/attrs` |
| `ontol_model_scene` | 场景定义 | `/api/v1/ontology-scenes` |
| `ontol_node_scene_relation` | 节点-场景关联 | `/api/v1/ontology-node-scene-relations` |
| `ontol_char_scene_relation` | 对话-场景关联 | `/api/v1/ontology-char-scene-relations` |
| `ontol_data_his` | 历史记录（含 JSON context） | `/api/v1/ontology-data-his` |

### 8.2 ontol_model（本体模板）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | TEXT PK | 模型 ID（M_ROOT, M_ENTITY...） |
| `ontol_parent_id` | TEXT FK | 父级模型 ID，树形结构的关键字段 |
| `ontol_name` | TEXT NOT NULL | 本体名称 |
| `ontol_model_type` | TEXT NOT NULL | M1~M7, ME, MT |
| `ontol_model_status` | TEXT DEFAULT '0' | 0=启用 1=停用 |
| `ontol_model_desc` | TEXT | 描述 |
| `ontol_code` | TEXT NOT NULL DEFAULT '' | 唯一编码 |
| `create_id` | TEXT | 创建人 |
| `create_time` | TEXT NOT NULL DEFAULT datetime('now') | 创建时间 |
| `update_id` | TEXT | 更新人 |
| `update_time` | TEXT | 更新时间 |
| `delete_flag` | TEXT NOT NULL DEFAULT '0' | 0=正常 1=已删除 |

### 8.3 ontol_model_attr（模板字段属性）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | TEXT PK | 属性 ID |
| `ontol_model_id` | TEXT NOT NULL FK | 所属模型 ID |
| `attr_name` | TEXT NOT NULL | 属性名称 |
| `attr_code` | TEXT NOT NULL | 属性编码 |
| `attr_data_type` | TEXT DEFAULT '0' | 0=字符串 1=数字 2=浮点数 |
| `attr_length` | TEXT | 字段长度 |
| `attr_is_only` | TEXT DEFAULT '0' | 0=不唯一 1=唯一 |
| `attr_required` | TEXT DEFAULT '0' | 0=可选 1=必填 |
| `attr_default_value` | TEXT | 默认值 |
| `attr_is_system` | TEXT DEFAULT '0' | 0=自定义 1=系统预设 |
| `create_time` | TEXT NOT NULL | 创建时间 |
| `delete_flag` | TEXT DEFAULT '0' | 删除标志 |

### 8.4 表关系

```
ontol_model ──1:N──▶ ontol_model_attr (ontol_model_id)
ontol_model ──1:N──▶ ontol_node_scene_relation (scene_id → ontol_model_scene.id)
ontol_model ──1:N──▶ ontol_char_scene_relation (scene_id)
                     ontol_data_his (独立历史记录)
```

### 8.5 Alembic 过滤机制

这些表由 `alembic/env.py` 中的 `include_object` 过滤，防止 Alembic 检测到"多余的表"并尝试删除：

```python
ONTOL_TABLES = frozenset({
    "ontol_model", "ontol_model_attr", "ontol_model_scene",
    "ontol_node_scene_relation", "ontol_char_scene_relation", "ontol_data_his",
})

def include_object(obj, name, type_, reflected, compare_to):
    if type_ == "table" and name in ONTOL_TABLES:
        return False
    return True
```

每次手工新增表时，**必须**同步更新 `ONTOL_TABLES` 集合。

---

## 九、文件存储

### 文件存储路径

上传文件（用户上传的图片、文档等）存储在 Langflow 的 `config_dir` 下：

```
默认路径: C:\Users\<用户名>\AppData\Local\langflow\langflow\<操作>
          └── Linux/macOS: ~/.langflow/langflow/
```

通过的 Storage Service: `src/backend/base/langflow/services/storage/local.py`

**路径配置优先级：**

1. 环境变量 `LANGFLOW_CONFIG_DIR` → 直接使用
2. 未设置 → 系统默认缓存目录

```bash
# 自定义文件存储位置
export LANGFLOW_CONFIG_DIR=D:\my-langflow-data

# Docker 部署时建议挂载持久化目录
docker run -v /data/langflow:/root/.langflow langflowai/langflow:latest
```

### 文件管理

| 操作 | 方式 |
|------|------|
| 上传 | 前端 `/assets/files` 页面拖拽或点击上传 |
| 下载 | 文件列表中点击下载按钮 |
| 删除 | 勾选文件后点击删除 |

### 安全机制

`StorageService` 内置路径穿越防护：上传的文件名如果包含 `..` 或 `/` 会被拒绝，防止恶意攻击者通过文件名读取系统任意文件。

