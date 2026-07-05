# 回归问题日志

本目录包含每个发布周期的 YAML 文件，用于记录已知的回归问题。

回归问题是指在上一个版本中正常工作、但在后续版本中出问题的功能。回归问题可能通过手动 QA、自动化测试、用户反馈或代码审查发现。

YAML 文件的目的是为版本发布前后已知的问题提供单一数据源。

## 如何记录回归问题

发现回归问题时，在当前发布周期的 YAML 文件中添加条目并提交 PR：

1. 打开对应版本的 `regressions/<version>.yaml` 文件。例如，如果问题首次在 1.9.0 中出现，则打开 `1.9.x.yaml`。如果文件不存在，则创建它。
2. 在 `entries:` 下按照以下 Schema 添加新条目。
3. 如果严重程度和临时解决方案尚未确认，设置为 `status: triage`。
4. 提交 PR 到活跃的 RC 分支。修复 PR 和 YAML 条目可以针对不同分支。

## 回归条目 Schema

```json
{
  "id": "GH-12345",
  "title": "简短描述",
  "status": "triage",
  "area": "flow_editor",
  "first_bad_version": "1.10.0",
  "last_known_good_version": "1.9.0",
  "resolved_in_version": "1.10.1",
  "fix_pr": "https://github.com/langflow-ai/langflow/pull/12345",
  "workaround": "无"
}
```

`resolved_in_version` 和 `fix_pr` 是可选的。首次提交时可以省略，待修复后补充。

## 状态选项

| 状态 | 含义 |
|------|------|
| `triage` | 已发现，尚未完全评估。首次提交时的默认状态。 |
| `ship_with_note` | 已知问题发布。文档需说明临时解决方案。 |
| `resolved` | 已修复；请添加 `resolved_in_version` 记录修复版本。 |
| `blocking` | 发布阻塞项；需明确签批后才能发布。 |

标记为 `resolved` 时，请包含修复版本：
```yaml
  resolved_in_version: 1.10.1
```

## 影响区域选项

| 区域 | 覆盖范围 |
|------|----------|
| `flow_editor` | 可视化编辑器 UI |
| `components` | 核心组件 |
| `mcp` | MCP 服务注册、MCP 工具、MCP 侧边栏 |
| `api` | REST API 端点 |
| `lfx` | `lfx` CLI 执行器 |
| `auth` | 登录、API 密钥、用户管理 |
| `database` | 迁移、存储、Flow 持久化 |
| `integrations` | 第三方组件 |
| `starter_projects` | 内置示例 Flow |

## 发布前审查回归问题

QA 期间，支持工程师在整个 RC 阶段保持条目最新：将条目移出 `triage` 状态、添加临时解决方案、标记已修复项为 `resolved` 并填写 `resolved_in_version`。

文档团队在发布前审查所有 `ship_with_note` 条目，在发布说明中更新已知问题的 `workaround` 文本。

发布负责人确认没有未解决的 `blocking` 条目。如果存在 `blocking` 条目，需在对应的 GitHub Issue 中获得维护者的签批。

## 相关文档

- [发布流程](../RELEASE.md) — 完整发布流程
