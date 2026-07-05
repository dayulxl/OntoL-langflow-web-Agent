# 部署 Langflow

## Docker Compose 部署

要使用 Docker Compose 运行 Langflow，你需要安装 Docker 和 Docker Compose。请参考 [Docker 官方文档](https://docs.docker.com/get-docker/) 进行安装。

Docker Compose 文件使用 `latest` 标签；建议在运行前拉取最新镜像。

```bash
docker compose pull
```

启动 Langflow 服务：

```bash
docker compose up
```

启动后，访问 http://localhost:80 即可使用 Langflow。

编辑 `.env` 文件可以更改端口和其他配置。

## 目录结构

```
deploy/
├── README.md                      # 本文档
├── .env.example                   # 环境变量示例
├── docker-compose.yml             # 基础 Docker Compose 编排
├── docker-compose.override.yml    # Docker Compose 覆盖配置
├── prometheus.yml                 # Prometheus 监控配置
└── observability/                 # 可观测性配置
    └── grafana-loki/              # Grafana + Loki 日志监控
        ├── README.md              # 日志监控部署说明
        ├── docker-compose.yml     # Grafana/Loki/Promtail 编排
        ├── grafana/               # Grafana 配置
        │   ├── dashboards/        # 预置仪表盘（含生产日志 JSON）
        │   └── provisioning/      # Grafana 自动配置
        └── promtail/              # Promtail 日志采集配置
```

## 可观测性

Langflow 支持通过以下组件实现可观测性：

| 组件 | 用途 |
|------|------|
| Prometheus | 指标采集与存储 |
| Grafana | 可视化仪表盘 |
| Loki | 日志聚合与查询 |
| Promtail | 日志采集代理 |

启动可观测性服务：

```bash
cd deploy/observability/grafana-loki
docker compose up
```

## 相关文档

- [Docker 模板说明](../docker/README.md) — 所有 Docker 构建配置
- [Docker 部署指南](https://docs.langflow.org/deployment-docker)
- [架构总览](../ARCHITECTURE.md)
