# 脚本目录

本目录包含 Langflow 项目的各类运维、CI 和开发辅助脚本。

## 目录结构

```
scripts/
├── README.md                       # 本文档
├── build_component_index.py       # 构建组件索引
├── check_changes_filter.py        # 检查变更过滤器
├── check_deprecated_imports.py    # 检查弃用的导入
├── factory_restart_space.py       # 工厂重启脚本
├── generate_migration.py          # 生成数据库迁移文件
├── generate_coverage_config.py    # 生成代码覆盖率配置
│
├── ci/                            # CI/CD 脚本
│   ├── update_lf_base_dependency.py   # 更新 langflow-base 依赖
│   ├── update_sdk_version.py          # 更新 SDK 版本
│   ├── update_lfx_version.py          # 更新 LFX 版本
│   ├── update_pyproject_version.py    # 更新 pyproject 版本号
│   ├── update_pyproject_name.py       # 更新项目名称
│   ├── update_pyproject_combined.py   # 组合更新 pyproject
│   ├── update_bundle_versions.py      # 更新 Bundle 版本
│   ├── update_starter_projects.py     # 更新 Starter 项目
│   ├── update_uv_dependency.py        # 更新 uv 依赖
│   ├── sync_bundle_lfx_pin.py         # 同步 Bundle LFX 版本锁定
│   ├── langflow_pre_release_tag.py    # Langflow 预发布标签
│   ├── lfx_nightly_tag.py             # LFX 夜间构建标签
│   ├── pypi_nightly_tag.py            # PyPI 夜间构建标签
│   ├── sdk_nightly_tag.py             # SDK 夜间构建标签
│   └── test_*.py                      # CI 脚本的测试文件
│
├── e2e_deployment_tests/          # E2E 部署测试
│   └── watsonx_orchestrate/       # Watsonx Orchestrate 适配器测试
│
├── gcp/                           # Google Cloud Platform 部署
│   ├── deploy_langflow_gcp.sh       # GCP 部署脚本
│   ├── deploy_langflow_gcp_spot.sh  # GCP Spot 实例部署
│   ├── GCP_DEPLOYMENT.md            # GCP 部署指南
│   └── walkthroughtutorial*.md      # GCP 部署教程
│
├── gp/                            # 本地化脚本 (Globalization Platform)
│   ├── download.py                # 下载翻译文件
│   ├── extract_backend_strings.py # 提取后端可翻译字符串
│   ├── gp_client.py               # 翻译平台客户端
│   ├── bake_note_keys.py          # 烘焙备注键
│   └── tests/                     # GP 脚本测试
│
├── lint/                          # 代码检查脚本
├── migrate/                       # 数据库迁移辅助
├── setup/                         # 环境设置辅助
└── windows/                       # Windows 平台特定脚本
```

## 常用脚本说明

### 构建相关
- **`build_component_index.py`** — 扫描所有组件并生成索引文件，用于前端组件面板展示
- **`generate_migration.py`** — 基于模型变更自动生成 Alembic 迁移文件

### CI/CD 版本管理
- **`ci/update_*`** — 一系列版本号和依赖更新脚本，在 CI 流水线中自动执行
- **`ci/*_tag.py`** — 为预发布/夜间版本创建 Git 标签

### 代码质量
- **`check_deprecated_imports.py`** — 检查代码中是否使用了已弃用的导入路径
- **`lint/`** — 存放代码检查相关的辅助脚本

### 部署
- **`gcp/`** — Google Cloud Platform 一键部署脚本，支持常规实例和 Spot 实例
- **`e2e_deployment_tests/`** — 端到端部署验证测试

## 相关文档

- [CI/CD 工作流配置](../.github/) — GitHub Actions 工作流
- [开发环境搭建](../DEVELOPMENT.md)
- [GCP 部署指南](gcp/GCP_DEPLOYMENT.md)
