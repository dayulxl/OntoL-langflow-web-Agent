# GitHub Actions CI/CD 工作流

本目录包含 Langflow 项目的持续集成和持续部署工作流配置。

## 工作流清单

### 持续集成

| 工作流文件 | 触发条件 | 用途 |
|------------|----------|------|
| `ci.yml` | Push / PR | 主 CI 流水线 |
| `ci-scripts-test.yml` | PR | CI 脚本自身测试 |
| `python_test.yml` | Push / PR | Python 单元测试 |
| `typescript_test.yml` | Push / PR | TypeScript 测试 |
| `jest_test.yml` | Push / PR | Jest 前端单元测试 |
| `integration_tests.yml` | PR | 后端集成测试 |
| `smoke-tests.yml` | PR | 冒烟测试 |
| `stress-tests.yml` | 定时 / 手动 | 压力测试 |
| `template-tests.yml` | PR | 模板测试 |

### 代码质量

| 工作流文件 | 触发条件 | 用途 |
|------------|----------|------|
| `lint-py.yml` | PR | Python 代码检查（ruff, mypy） |
| `lint-js.yml` | PR | JavaScript/TypeScript 代码检查 |
| `style-check-py.yml` | PR | Python 代码风格检查 |
| `py_autofix.yml` | PR | Python 代码自动修复 |
| `js_autofix.yml` | PR | JavaScript 代码自动修复 |
| `codeql.yml` | Push / PR | GitHub CodeQL 安全分析 |
| `mend.yml` | Push | Mend 软件供应链分析 |
| `test-coverage-advisor.yml` | PR | 测试覆盖率建议 |

### Docker 镜像

| 工作流文件 | 触发条件 | 用途 |
|------------|----------|------|
| `docker-build.yml` | Push main / 发布 | 正式 Docker 镜像构建 |
| `docker-build-v2.yml` | Push main | v2 版本 Docker 构建 |
| `docker-nightly-build.yml` | 定时（每晚） | 夜间 Docker 镜像构建 |
| `docker_test.yml` | PR | Docker 构建测试 |
| `extension-migration-checks.yml` | PR | 扩展迁移检查 |

### 数据库

| 工作流文件 | 触发条件 | 用途 |
|------------|----------|------|
| `db-migration-validation.yml` | PR | 数据库迁移验证 |
| `migration-validation.yml` | PR | 迁移兼容性验证 |

### 部署与发布

| 工作流文件 | 触发条件 | 用途 |
|------------|----------|------|
| `release.yml` | 手动 | 正式版本发布 |
| `release-lfx.yml` | 手动 | LFX 独立发布 |
| `release_nightly.yml` | 定时（每晚） | 夜间版本发布 |
| `release_bundles.yml` | 手动 | 扩展包发布 |
| `nightly_build.yml` | 定时（每晚） | 夜间构建 |
| `create-release.yml` | Push main | 自动创建 Release |
| `deploy_gh-pages.yml` | Push main | 部署文档到 GitHub Pages |
| `deploy-docs-draft.yml` | PR | 文档草稿部署 |
| `deploy-storybook.yml` | Push main | Storybook 部署 |

### 标签与自动化

| 工作流文件 | 触发条件 | 用途 |
|------------|----------|------|
| `add-labels.yml` | PR | 自动添加 PR 标签 |
| `community-label.yml` | Issue/PR | 社区贡献标签 |
| `conventional-labels.yml` | PR | 基于语义提交的标签 |
| `auto-update.yml` | 定时 | 依赖自动更新 |
| `request-docs-review.yml` | PR | 请求文档审查 |
| `regression-stub.yml` | 手动 | 回归测试桩 |

### 文档与 Storybook

| 工作流文件 | 触发条件 | 用途 |
|------------|----------|------|
| `docs_test.yml` | PR | 文档站点构建测试 |
| `cross-platform-test.yml` | PR / Push | 跨平台兼容性测试 |

### 本地化

| 工作流文件 | 触发条件 | 用途 |
|------------|----------|------|
| `gp-download.yml` | 手动 / 定时 | 下载翻译文件 |
| `gp-upload.yml` | Push main | 上传待翻译字符串 |
| `gp-test.yml` | PR | 翻译脚本测试 |
| `gp-backend-check.yml` | PR | 后端翻译检查 |

### 商店度量

| 工作流文件 | 触发条件 | 用途 |
|------------|----------|------|
| `store_pytest_durations.yml` | Push main | 存储 pytest 执行时长数据 |

## 目录结构

```
.github/
├── README.md                  # 本文档
├── workflows/                 # 所有工作流定义（YAML）
│   └── matchers/              # GitHub Actions 自定义匹配器
├── ISSUE_TEMPLATE/            # Issue 模板
└── actions/                   # 自定义 GitHub Actions
```

## 颜色标识说明

在 CI 流程中使用以下颜色标识不同状态：
- 🟢 **绿色** — 通过
- 🟡 **黄色** — 警告 / 需要关注
- 🔴 **红色** — 失败 / 阻塞

## 相关文档

- [脚本说明](../scripts/README.md) — CI 辅助脚本
- [发布流程](../RELEASE.md) — 版本发布规范
- [开发环境搭建](../DEVELOPMENT.md)
