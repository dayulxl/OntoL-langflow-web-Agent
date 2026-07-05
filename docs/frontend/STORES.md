# 状态管理层目录索引 (Zustand Stores)

> 路径: `src/frontend/src/stores/`
> 技术: Zustand — 轻量级 React 状态管理

---

## 一、Flow 核心 Store

### flowsManagerStore — Flow 列表管理

[`stores/flowsManagerStore.ts`](../../src/frontend/src/stores/flowsManagerStore.ts)

管理所有 Flow 的 CRUD、搜索、过滤、排序。

| 状态 | 类型 | 说明 |
|------|------|------|
| `flows` | `Flow[]` | Flow 列表数据 |
| `searchParams` | `SearchParams` | 搜索/排序/过滤参数 |
| `isLoading` | `boolean` | 加载中 |
| `selectedFlows` | `string[]` | 批量选中的 Flow ID |
| `examples` | `Flow[]` | 模板 Flow 列表 |

### flowStore — 当前画布状态

[`stores/flowStore.ts`](../../src/frontend/src/stores/flowStore.ts)

管理当前编辑中 Flow 的画布实时状态。

| 状态 | 类型 | 说明 |
|------|------|------|
| `nodes` | `Node[]` | 画布中的所有节点 |
| `edges` | `Edge[]` | 节点间连线 |
| `selectedNode` | `Node \| null` | 当前选中节点 |
| `viewport` | `Viewport` | 画布缩放和平移 |
| `flowId` | `string \| null` | 当前编辑的 Flow ID |
| `isDirty` | `boolean` | 是否有未保存更改 |

### foldersStore — 文件夹管理

[`stores/foldersStore.tsx`](../../src/frontend/src/stores/foldersStore.tsx)

| 状态 | 说明 |
|------|------|
| `folders` | 文件夹列表 |
| `myCollectionId` | "我的集合"文件夹 ID |
| `currentFolderId` | 当前浏览的文件夹 |

---

## 二、UI 状态 Store

| Store | 文件 | 职责 |
|-------|------|------|
| `darkStore` | [`stores/darkStore.ts`](../../src/frontend/src/stores/darkStore.ts) | 暗色/亮色主题切换 |
| `alertStore` | [`stores/alertStore.ts`](../../src/frontend/src/stores/alertStore.ts) | 全局告警通知队列 |
| `utilityStore` | [`stores/utilityStore.ts`](../../src/frontend/src/stores/utilityStore.ts) | UI 工具状态（面板折叠、工具栏位置等） |
| `shortcuts` | [`stores/shortcuts.ts`](../../src/frontend/src/stores/shortcuts.ts) | 键盘快捷键绑定 |
| `voiceStore` | [`stores/voiceStore.ts`](../../src/frontend/src/stores/voiceStore.ts) | 语音输入状态 |

---

## 三、用户与认证 Store

| Store | 文件 | 职责 |
|-------|------|------|
| `authStore` | [`stores/authStore.ts`](../../src/frontend/src/stores/authStore.ts) | 用户认证 — 登录状态、token、用户信息、API key |

---

## 四、Flow 执行与调试 Store

| Store | 文件 | 职责 |
|-------|------|------|
| `messagesStore` | [`stores/messagesStore.ts`](../../src/frontend/src/stores/messagesStore.ts) | Flow 执行时的聊天消息 — 输入/输出历史 |
| `tweaksStore` | [`stores/tweaksStore.ts`](../../src/frontend/src/stores/tweaksStore.ts) | Playground 参数微调 — 逐组件覆盖参数 |
| `sessionManagerStore` | [`stores/sessionManagerStore.ts`](../../src/frontend/src/stores/sessionManagerStore.ts) | 聊天会话管理 — session 列表与切换 |
| `playgroundStore` | [`stores/playgroundStore.ts`](../../src/frontend/src/stores/playgroundStore.ts) | Playground 页面状态 |
| `durationStore` | [`stores/durationStore.ts`](../../src/frontend/src/stores/durationStore.ts) | 执行耗时统计 |
| `versionPreviewStore` | [`stores/versionPreviewStore.ts`](../../src/frontend/src/stores/versionPreviewStore.ts) | Flow 版本预览状态 |

---

## 五、组件与类型 Store

| Store | 文件 | 职责 |
|-------|------|------|
| `typesStore` | [`stores/typesStore.ts`](../../src/frontend/src/stores/typesStore.ts) | 所有可用组件类型的元数据（名称、图标、参数 Schema） |
| `storeStore` | [`stores/storeStore.ts`](../../src/frontend/src/stores/storeStore.ts) | 组件商店（Marketplace）数据 |

---

## 六、全局配置 Store

| Store | 文件 | 职责 |
|-------|------|------|
| `globalVariablesStore` | [`stores/globalVariablesStore/globalVariables.ts`](../../src/frontend/src/stores/globalVariablesStore/globalVariables.ts) | 全局环境变量（API Key 等） |

---

## 七、其他 Store

| Store | 文件 | 职责 |
|-------|------|------|
| `flowBuilderWelcomeStore` | [`stores/flowBuilderWelcomeStore.ts`](../../src/frontend/src/stores/flowBuilderWelcomeStore.ts) | 新建 Flow 引导页状态 |
| `assistantManagerStore` | [`stores/assistantManagerStore.ts`](../../src/frontend/src/stores/assistantManagerStore.ts) | AI 助手面板状态 |

---

## 八、Store 交互关系

```
flowsManagerStore (Flow 列表)
  │
  ├──[打开 Flow]──▶ flowStore (画布编辑)
  │                    │
  │                    ├──▶ typesStore (获取可用组件)
  │                    ├──▶ tweaksStore (参数覆盖)
  │                    └──▶ messagesStore (执行消息)
  │
  ├──▶ foldersStore (文件夹导航)
  │
  └──▶ authStore (用户权限)

utilityStore ──▶ darkStore
alertStore ──▶ 所有 Store (错误/成功通知)
```

## 九、使用示例

```typescript
// 读取 Flow 列表
const flows = useFlowsManagerStore(state => state.flows);

// 获取当前画布节点
const nodes = useFlowStore(state => state.nodes);

// 选择节点
const setSelectedNode = useFlowStore(state => state.setSelectedNode);

// 切换主题
const toggleDark = useDarkStore(state => state.toggleDark);
```

## 十、相关文档

- [Flow 列表页面索引](./PAGE-FLOWS.md)
- [Flow 编辑页面索引](./PAGE-FLOW-EDITOR.md)
- [前端目录说明](../../src/frontend/README.md)
