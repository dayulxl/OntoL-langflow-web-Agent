# Docker 模板

本目录包含 Langflow 的 Docker 构建配置和部署模板。不同的 Dockerfile 对应不同的使用场景。

## 模板清单

### 构建镜像

| 文件 | 用途 |
|------|------|
| `build_and_push.Dockerfile` | 主构建文件，构建 langflow 完整镜像 |
| `build_and_push_backend.Dockerfile` | 仅构建后端镜像，不含前端 |
| `build_and_push_base.Dockerfile` | 构建基础镜像，作为其他镜像的共享层 |
| `build_and_push_ep.Dockerfile` | 构建端点（Endpoint）镜像 |
| `build_and_push_with_extras.Dockerfile` | 构建包含额外依赖的镜像 |
| `frontend/build_and_push_frontend.Dockerfile` | 前端独立构建镜像 |

### 开发环境

| 文件 | 用途 |
|------|------|
| `dev.Dockerfile` | 本地开发容器，支持热重载 |
| `dev.docker-compose.yml` | 开发环境 Docker Compose 编排 |
| `dev.start.sh` | 开发容器启动脚本 |

### 生产部署

| 文件 | 用途 |
|------|------|
| `render.Dockerfile` | Render 平台部署镜像 |
| `render.pre-release.Dockerfile` | Render 预发布版本镜像 |
| `cdk.Dockerfile` | AWS CDK 部署镜像 |
| `cdk-docker-compose.yml` | CDK 环境 Docker Compose 编排 |
| `container-cmd-cdk.sh` | CDK 容器启动命令脚本 |

### 前端 Nginx 配置

| 文件 | 用途 |
|------|------|
| `frontend/default.conf.template` | Nginx 站点配置模板 |
| `frontend/nginx.conf` | Nginx 主配置文件 |
| `frontend/start-nginx.sh` | Nginx 启动脚本 |

## 快速使用

```bash
# 构建开发镜像
docker build -f docker/dev.Dockerfile -t langflow:dev .

# 启动开发环境
docker compose -f docker/dev.docker-compose.yml up

# 运行最新发布版
docker run -p 7860:7860 langflowai/langflow:latest
```

## 镜像层次结构

```
langflow-base (基础依赖)
  └── langflow-backend (后端 + Python 依赖)
       └── langflow (完整镜像: 后端 + 前端 + Nginx)
```

- `langflow-base` — Python 运行时 + 通用系统依赖
- `langflow-backend` — 在 base 之上加上 Langflow Python 包
- `langflow` — 在 backend 之上加上前端静态文件 + Nginx 反向代理

## 相关文档

- [Docker 部署指南](https://docs.langflow.org/deployment-docker)
- [开发环境搭建](../DEVELOPMENT.md)
- [生产部署配置](../deploy/README.md)
