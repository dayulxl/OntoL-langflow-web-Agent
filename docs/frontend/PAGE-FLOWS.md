# /flows 页面目录索引

> URL: `http://localhost:7860/flows/`
> 路由: `src/frontend/src/routes.tsx:115`
> 入口组件: `HomePage type="flows"`

---

## 一、路由入口

[`src/frontend/src/routes.tsx`](../../src/frontend/src/routes.tsx)

| 路由 | 组件 | 说明 |
|------|------|------|
| `/flows/` | `<HomePage type="flows" />` | Flow 列表主页（含 folders 子路由） |
| `/components/` | `<HomePage type="components" />` | 组件列表页 |
| `/all/` | `<HomePage type="flows" />` | 继承到 /flows/ |

子路由在 `/flows/` 下还包括文件夹导航：
- `/flows/folder/:folderId` — 文件夹内 Flow 列表

---

## 二、页面组件树

```
HomePage (pages/MainPage/pages/homePage/index.tsx)
├── HeaderComponent (pages/MainPage/components/header/)
│   ├── InputSearchComponent (pages/MainPage/components/inputSearchComponent/)
│   └── Dropdown (pages/MainPage/components/dropdown/)
│
├── CardsWrapComponent (components/core/cardsWrapComponent/)
│   └── Flow 卡片网格
│
├── ListComponent (pages/MainPage/components/list/)
│   └── Flow 表格列表
│
├── ListSkeleton (pages/MainPage/components/listSkeleton/)
│   └── 加载骨架屏
│
├── ModalsComponent (pages/MainPage/components/modalsComponent/)
│   └── 新建/编辑/删除 Flow 的弹窗
│
├── PaginatorComponent (components/common/paginatorComponent/)
│   └── 分页控件
│
└── EmptyFolder (pages/MainPage/pages/emptyFolder/)
    └── 空文件夹占位
```

---

## 三、页面文件索引

### 3.1 HomePage — 主页入口

| 文件 | 说明 |
|------|------|
| [`pages/MainPage/pages/homePage/index.tsx`](../../src/frontend/src/pages/MainPage/pages/homePage/index.tsx) | Flow 列表页主组件，管理 view 模式（grid/list）、搜索、分页、文件夹 |
| [`pages/MainPage/pages/homePage/components/McpServerTab.tsx`](../../src/frontend/src/pages/MainPage/pages/homePage/components/McpServerTab.tsx) | MCP Server 管理 Tab |
| [`pages/MainPage/pages/homePage/components/McpFlowsSection.tsx`](../../src/frontend/src/pages/MainPage/pages/homePage/components/McpFlowsSection.tsx) | MCP 关联 Flows 选择区 |
| [`pages/MainPage/pages/homePage/components/McpAuthSection.tsx`](../../src/frontend/src/pages/MainPage/pages/homePage/components/McpAuthSection.tsx) | MCP 认证配置区 |
| [`pages/MainPage/pages/homePage/components/McpAutoInstallContent.tsx`](../../src/frontend/src/pages/MainPage/pages/homePage/components/McpAutoInstallContent.tsx) | MCP 自动安装内容 |
| [`pages/MainPage/pages/homePage/components/McpJsonContent.tsx`](../../src/frontend/src/pages/MainPage/pages/homePage/components/McpJsonContent.tsx) | MCP JSON 配置编辑器 |
| [`pages/MainPage/pages/homePage/hooks/useMcpServer.ts`](../../src/frontend/src/pages/MainPage/pages/homePage/hooks/useMcpServer.ts) | MCP Server 状态管理 Hook |
| [`pages/MainPage/pages/homePage/utils/isFolderEmpty.ts`](../../src/frontend/src/pages/MainPage/pages/homePage/utils/isFolderEmpty.ts) | 判断文件夹是否为空的工具函数 |
| [`pages/MainPage/pages/homePage/utils/mcpServerUtils.tsx`](../../src/frontend/src/pages/MainPage/pages/homePage/utils/mcpServerUtils.tsx) | MCP Server 辅助渲染函数 |

### 3.2 共享组件

| 文件 | 说明 |
|------|------|
| [`pages/MainPage/components/header/index.tsx`](../../src/frontend/src/pages/MainPage/components/header/index.tsx) | 顶部操作栏（新建、搜索、视图切换） |
| [`pages/MainPage/components/inputSearchComponent/index.tsx`](../../src/frontend/src/pages/MainPage/components/inputSearchComponent/index.tsx) | 搜索输入框 |
| [`pages/MainPage/components/list/index.tsx`](../../src/frontend/src/pages/MainPage/components/list/index.tsx) | Flow 列表视图（表格模式） |
| [`pages/MainPage/components/listSkeleton/index.tsx`](../../src/frontend/src/pages/MainPage/components/listSkeleton/index.tsx) | 列表加载骨架屏 |
| [`pages/MainPage/components/modalsComponent/index.tsx`](../../src/frontend/src/pages/MainPage/components/modalsComponent/index.tsx) | 弹窗容器（新建/编辑/删除 Flow） |
| [`pages/MainPage/components/dropdown/index.tsx`](../../src/frontend/src/pages/MainPage/components/dropdown/index.tsx) | 操作下拉菜单 |

### 3.3 公共 Hooks

| 文件 | 说明 |
|------|------|
| [`pages/MainPage/hooks/use-description-modal.ts`](../../src/frontend/src/pages/MainPage/hooks/use-description-modal.ts) | Flow 描述编辑弹窗状态 |
| [`pages/MainPage/hooks/use-handle-duplicate.ts`](../../src/frontend/src/pages/MainPage/hooks/use-handle-duplicate.ts) | Flow 复制操作 |
| [`pages/MainPage/hooks/use-on-file-drop.ts`](../../src/frontend/src/pages/MainPage/hooks/use-on-file-drop.ts) | 拖放 JSON 文件导入 Flow |
| [`pages/MainPage/hooks/use-select-options-change.ts`](../../src/frontend/src/pages/MainPage/hooks/use-select-options-change.ts) | 批量选择与操作 |

### 3.4 类型与工具

| 文件 | 说明 |
|------|------|
| [`pages/MainPage/types.ts`](../../src/frontend/src/pages/MainPage/types.ts) | Flow 列表相关 TypeScript 类型定义 |
| [`pages/MainPage/utils/sort-flows.ts`](../../src/frontend/src/pages/MainPage/utils/sort-flows.ts) | Flow 排序逻辑 |
| [`pages/MainPage/utils/get-template-style.ts`](../../src/frontend/src/pages/MainPage/utils/get-template-style.ts) | 模板样式获取 |
| [`pages/MainPage/utils/time-elapse.ts`](../../src/frontend/src/pages/MainPage/utils/time-elapse.ts) | 时间格式化 |
| [`pages/MainPage/pages/main-page-utils.ts`](../../src/frontend/src/pages/MainPage/pages/main-page-utils.ts) | 页面通用工具函数 |
| [`pages/MainPage/pages/main-page.tsx`](../../src/frontend/src/pages/MainPage/pages/main-page.tsx) | MainPage 布局封装 |

---

## 四、Flow 编辑页（跳转目标）

点击某个 Flow 进入的编辑画布页面：

```
FlowPage (pages/FlowPage/index.tsx)
├── flowSidebarComponent          ← 左侧组件面板（拖拽添加组件）
│   ├── searchInput               — 组件搜索
│   ├── sidebarSegmentedNav       — 分类导航
│   ├── sidebarBundles            — Bundle 组件列表
│   ├── categoryGroup / categoryDisclouse — 分类折叠组
│   ├── sidebarDraggableComponent — 可拖拽组件项
│   ├── FlowVersionSidebar        — 版本管理侧栏
│   └── McpSidebarGroup           — MCP 组件分组
│
├── PageComponent                 ← 中央画布（节点 + 连线）
│   ├── CanvasBanner              — 画布顶部横幅（未保存提示等）
│   ├── RestoreVersionButton      — 版本恢复按钮
│   ├── SaveVersionDialog         — 保存版本对话框
│   └── VersionPreviewOverlay     — 版本预览叠加层
│
├── InspectionPanel               ← 右侧属性面板（编辑选中组件参数）
│   ├── EditableHeaderContent     — 组件标题编辑
│   ├── InspectionPanelFields     — 字段组
│   ├── InspectionPanelField      — 单个字段编辑器
│   ├── InspectionPanelEditField  — 编辑字段
│   └── InspectionPanelOutputs    — 输出展示
│
├── nodeToolbarComponent          ← 节点工具栏（复制/删除/API等）
├── SelectionMenuComponent        ← 多选菜单（批量操作选中节点）
├── ConnectionLineComponent       ← 连线渲染
├── UpdateAllComponents           ← 批量更新组件
│
├── TraceComponent                ← 执行追踪面板
│   ├── TraceDetailView           — 追踪详情
│   ├── SpanTree / SpanNode       — Span 树形展示
│   └── FlowInsightsContent       — Flow 洞察分析
│
└── MemoriesMainContent           ← 记忆管理面板
    ├── MemoriesSidebar           — 记忆列表
    ├── MemoryDetails             — 记忆详情
    ├── MemoryDocumentPanel       — 记忆文档面板
    └── MemoryKnowledgeBaseSection — 知识库关联
```

### 4.1 FlowPage 文件索引

| 文件 | 说明 |
|------|------|
| [`pages/FlowPage/index.tsx`](../../src/frontend/src/pages/FlowPage/index.tsx) | Flow 编辑页主入口 |
| [`pages/FlowPage/consts.ts`](../../src/frontend/src/pages/FlowPage/consts.ts) | 页面常量 |

#### 左侧面板 (flowSidebarComponent)

| 文件 | 说明 |
|------|------|
| [`components/flowSidebarComponent/index.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/index.tsx) | 侧栏主组件 |
| [`components/flowSidebarComponent/components/searchInput.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/searchInput.tsx) | 组件搜索框 |
| [`components/flowSidebarComponent/components/sidebarSegmentedNav.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarSegmentedNav.tsx) | 分类导航 |
| [`components/flowSidebarComponent/components/sidebarBundles.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarBundles.tsx) | Bundle 分组 |
| [`components/flowSidebarComponent/components/categoryGroup.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/categoryGroup.tsx) | 组件分类组 |
| [`components/flowSidebarComponent/components/sidebarDraggableComponent.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarDraggableComponent.tsx) | 可拖拽到画布的组件卡片 |
| [`components/flowSidebarComponent/components/sidebarItemsList.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarItemsList.tsx) | 组件列表 |
| [`components/flowSidebarComponent/components/sidebarHeader/index.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarHeader/index.tsx) | 侧栏顶栏 |
| [`components/flowSidebarComponent/components/sidebarFooterButtons.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarFooterButtons.tsx) | 侧栏底部按钮 |

#### 侧栏 Helper 函数

| 文件 | 说明 |
|------|------|
| [`helpers/filtered-data.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/filtered-data.ts) | 组件过滤主逻辑 |
| [`helpers/apply-component-filter.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/apply-component-filter.ts) | 组件过滤器 |
| [`helpers/apply-beta-filter.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/apply-beta-filter.ts) | Beta 组件过滤 |
| [`helpers/apply-legacy-filter.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/apply-legacy-filter.ts) | 旧版组件过滤 |
| [`helpers/apply-edge-filter.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/apply-edge-filter.ts) | 连线过滤 |
| [`helpers/search-on-metadata.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/search-on-metadata.ts) | 元数据搜索 |
| [`helpers/combined-results.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/combined-results.ts) | 搜索结果合并 |
| [`helpers/normalize-string.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/normalize-string.ts) | 字符串标准化 |
| [`helpers/sensitive-sort.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/sensitive-sort.tsx) | 大小写敏感排序 |
| [`helpers/derive-bundle-extension-id.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/derive-bundle-extension-id.ts) | Bundle 扩展 ID 解析 |
| [`helpers/get-disabled-tooltip.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/get-disabled-tooltip.ts) | 禁用组件提示 |
| [`helpers/disable-item.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/disable-item.ts) | 禁用项判断 |
| [`helpers/compute-section-visibility.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/compute-section-visibility.ts) | 区域可见性计算 |

#### 中央画布 (PageComponent)

| 文件 | 说明 |
|------|------|
| [`components/PageComponent/index.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/index.tsx) | 画布主组件，管理 @xyflow/react 实例 |
| [`components/PageComponent/components/CanvasBanner.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/components/CanvasBanner.tsx) | 画布顶部提示横幅 |
| [`components/PageComponent/components/RestoreVersionButton.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/components/RestoreVersionButton.tsx) | 恢复到历史版本按钮 |
| [`components/PageComponent/components/SaveVersionDialog.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/components/SaveVersionDialog.tsx) | 保存版本对话框 |
| [`components/PageComponent/components/VersionPreviewOverlay.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/components/VersionPreviewOverlay.tsx) | 版本预览叠加层 |
| [`components/PageComponent/components/helper-lines.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/components/helper-lines.tsx) | 辅助对齐线 |

#### 右侧属性面板 (InspectionPanel)

| 文件 | 说明 |
|------|------|
| [`components/InspectionPanel/index.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/index.tsx) | 属性面板入口 |
| [`components/InspectionPanel/components/InspectionPanelHeader.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/InspectionPanelHeader.tsx) | 面板标题栏 |
| [`components/InspectionPanel/components/InspectionPanelFields.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/InspectionPanelFields.tsx) | 字段组容器 |
| [`components/InspectionPanel/components/InspectionPanelField.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/InspectionPanelField.tsx) | 单个字段展示 |
| [`components/InspectionPanel/components/InspectionPanelEditField.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/InspectionPanelEditField.tsx) | 字段编辑器 |
| [`components/InspectionPanel/components/InspectionPanelOutputs.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/InspectionPanelOutputs.tsx) | 输出预览 |
| [`components/InspectionPanel/components/EditableHeaderContent.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/EditableHeaderContent.tsx) | 可编辑标题 |
| [`components/InspectionPanel/components/hidden-fields.ts`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/hidden-fields.ts) | 隐藏字段配置 |

#### 节点工具栏 (nodeToolbarComponent)

| 文件 | 说明 |
|------|------|
| [`components/nodeToolbarComponent/index.tsx`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/index.tsx) | 节点工具栏（复制、删除、API、代码） |
| [`components/nodeToolbarComponent/components/toolbar-button.tsx`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/components/toolbar-button.tsx) | 工具栏按钮 |
| [`components/nodeToolbarComponent/components/toolbar-modals.tsx`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/components/toolbar-modals.tsx) | 工具栏弹窗 |
| [`components/nodeToolbarComponent/hooks/use-shortcuts.ts`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/hooks/use-shortcuts.ts) | 快捷键绑定 |
| [`components/nodeToolbarComponent/shortcutDisplay/index.tsx`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/shortcutDisplay/index.tsx) | 快捷键显示 |
| [`components/nodeToolbarComponent/toolbarSelectItem/index.tsx`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/toolbarSelectItem/index.tsx) | 工具栏下拉选项 |

---

## 五、状态管理层 (Zustand Stores)

Flow 相关的核心 Store：

| Store 文件 | 职责 |
|------------|------|
| [`stores/flowsManagerStore.ts`](../../src/frontend/src/stores/flowsManagerStore.ts) | **Flow CRUD 核心** — 列表、创建、更新、删除、搜索过滤 |
| [`stores/flowStore.ts`](../../src/frontend/src/stores/flowStore.ts) | **当前画布状态** — 节点、连线、选中节点、视口偏移 |
| [`stores/foldersStore.tsx`](../../src/frontend/src/stores/foldersStore.tsx) | **文件夹管理** — 文件夹列表、当前文件夹、我的集合 |
| [`stores/flowBuilderWelcomeStore.ts`](../../src/frontend/src/stores/flowBuilderWelcomeStore.ts) | **引导界面** — 新建 Flow 时的模板选择/跳过状态 |
| [`stores/versionPreviewStore.ts`](../../src/frontend/src/stores/versionPreviewStore.ts) | **版本预览** — 预览旧版本的状态 |
| [`stores/tweaksStore.ts`](../../src/frontend/src/stores/tweaksStore.ts) | **参数微调** — Playground 中的参数覆盖 |
| [`stores/typesStore.ts`](../../src/frontend/src/stores/typesStore.ts) | **组件类型** — 所有可用组件类型的元数据 |
| [`stores/storeStore.ts`](../../src/frontend/src/stores/storeStore.ts) | **组件商店** — 组件市场数据 |
| [`stores/messagesStore.ts`](../../src/frontend/src/stores/messagesStore.ts) | **聊天消息** — Flow 执行时的输入/输出消息 |

其他全局 Store：

| Store 文件 | 职责 |
|------------|------|
| [`stores/authStore.ts`](../../src/frontend/src/stores/authStore.ts) | 用户认证信息 |
| [`stores/darkStore.ts`](../../src/frontend/src/stores/darkStore.ts) | 暗色模式 |
| [`stores/alertStore.ts`](../../src/frontend/src/stores/alertStore.ts) | 告警通知 |
| [`stores/shortcuts.ts`](../../src/frontend/src/stores/shortcuts.ts) | 键盘快捷键 |
| [`stores/utilityStore.ts`](../../src/frontend/src/stores/utilityStore.ts) | UI 实用状态（最小化面板等） |
| [`stores/globalVariablesStore/globalVariables.ts`](../../src/frontend/src/stores/globalVariablesStore/globalVariables.ts) | 全局变量 |
| [`stores/sessionManagerStore.ts`](../../src/frontend/src/stores/sessionManagerStore.ts) | 会话管理 |

---

## 六、API 层 (Controllers)

Flow 相关的 API 查询 Hooks（基于 React Query）：

| 文件 | 说明 |
|------|------|
| [`controllers/API/queries/flows/use-get-flow.ts`](../../src/frontend/src/controllers/API/queries/flows/use-get-flow.ts) | 获取单个 Flow |
| [`controllers/API/queries/flows/use-get-refresh-flows-query.ts`](../../src/frontend/src/controllers/API/queries/flows/use-get-refresh-flows-query.ts) | 获取 Flow 列表（支持刷新） |
| [`controllers/API/queries/flows/use-post-add-flow.ts`](../../src/frontend/src/controllers/API/queries/flows/use-post-add-flow.ts) | 创建新 Flow |
| [`controllers/API/queries/flows/use-patch-update-flow.ts`](../../src/frontend/src/controllers/API/queries/flows/use-patch-update-flow.ts) | 更新 Flow |
| [`controllers/API/queries/flows/use-delete-delete-flows.ts`](../../src/frontend/src/controllers/API/queries/flows/use-delete-delete-flows.ts) | 删除 Flow（支持批量） |
| [`controllers/API/queries/flows/use-get-basic-examples.ts`](../../src/frontend/src/controllers/API/queries/flows/use-get-basic-examples.ts) | 获取模板示例 |
| [`controllers/API/queries/flows/use-get-download-flows.ts`](../../src/frontend/src/controllers/API/queries/flows/use-get-download-flows.ts) | 下载 Flow JSON |
| [`controllers/API/queries/flows/use-get-types.ts`](../../src/frontend/src/controllers/API/queries/flows/use-get-types.ts) | 获取所有组件类型 |
| [`controllers/API/queries/flows/use-get-note-translations.ts`](../../src/frontend/src/controllers/API/queries/flows/use-get-note-translations.ts) | 获取画布便签翻译 |

文件夹 API：

| 文件 | 说明 |
|------|------|
| [`controllers/API/queries/folders/use-get-folders.ts`](../../src/frontend/src/controllers/API/queries/folders/use-get-folders.ts) | 获取文件夹列表 |
| [`controllers/API/queries/folders/use-get-folder.ts`](../../src/frontend/src/controllers/API/queries/folders/use-get-folder.ts) | 获取单个文件夹 |
| [`controllers/API/queries/folders/use-post-folders.ts`](../../src/frontend/src/controllers/API/queries/folders/use-post-folders.ts) | 创建文件夹 |
| [`controllers/API/queries/folders/use-patch-folders.ts`](../../src/frontend/src/controllers/API/queries/folders/use-patch-folders.ts) | 更新文件夹 |
| [`controllers/API/queries/folders/use-delete-folders.ts`](../../src/frontend/src/controllers/API/queries/folders/use-delete-folders.ts) | 删除文件夹 |

底层 HTTP Client：

| 文件 | 说明 |
|------|------|
| [`controllers/API/api.tsx`](../../src/frontend/src/controllers/API/api.tsx) | Axios 实例，统一拦截器 |
| [`controllers/API/index.ts`](../../src/frontend/src/controllers/API/index.ts) | API 模块入口 |

---

## 七、数据流总览

```
┌──────────────────────────────────────────────────────┐
│  URL: /flows/                                         │
│  routes.tsx → <HomePage type="flows" />                │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Zustand Store: flowsManagerStore                │  │
│  │  - flows[]          (Flow 列表)                  │  │
│  │  - searchParams      (搜索/过滤条件)              │  │
│  │  - isLoading         (加载状态)                   │  │
│  │  - setFlows()        (设置列表)                   │  │
│  │  - addFlow()         (创建 Flow)                 │  │
│  │  - removeFlow()      (删除 Flow)                 │  │
│  └──────────┬──────────────────────────────────────┘  │
│             │                                          │
│  ┌──────────▼──────────────────────────────────────┐  │
│  │  React Query Hooks (controllers/API/queries/)    │  │
│  │  - useGetRefreshFlowsQuery()   (GET /flows)      │  │
│  │  - usePostAddFlow()            (POST /flows)     │  │
│  │  - usePatchUpdateFlow()        (PATCH /flows/:id)│  │
│  │  - useDeleteFlows()            (DELETE /flows)   │  │
│  └──────────┬──────────────────────────────────────┘  │
│             │                                          │
│  ┌──────────▼──────────────────────────────────────┐  │
│  │  Backend: FastAPI /api/v2/flows                  │  │
│  │  → Service Layer → SQLAlchemy → SQLite/Postgres  │  │
│  └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## 八、页面功能清单

| 功能 | 实现位置 | 说明 |
|------|----------|------|
| Flow 列表展示 | `HomePage` + `ListComponent` / `CardsWrapComponent` | 支持表格和卡片两种视图 |
| 搜索 Flow | `InputSearchComponent` + `flowsManagerStore.searchParams` | 按名称/描述搜索 |
| 新建 Flow | `ModalsComponent` → `usePostAddFlow` → `FlowPage` | 创建空白 Flow 或从模板创建 |
| 编辑 Flow | 跳转 `FlowPage` (`/flow/:id`) | 进入画布编辑器 |
| 复制 Flow | `use-handle-duplicate.ts` → `usePostAddFlow` | 复制一份新 Flow |
| 删除 Flow | `ModalsComponent` → `useDeleteFlows` | 支持批量删除 |
| 文件夹管理 | `foldersStore` + `useGetFolders` | 创建、重命名、移动 Flow |
| 拖放导入 | `use-on-file-drop.ts` | 拖放 JSON 文件导入 Flow |
| 导出 Flow | `use-get-download-flows.ts` | 下载 Flow JSON 文件 |
| 分页 | `PaginatorComponent` | 每页 12 个 |
| 加载状态 | `ListSkeleton` | 骨架屏占位 |

## 九、相关文档

- [架构总览](../../ARCHITECTURE.md)
- [前端目录说明](../../src/frontend/README.md)
- [Flow 编辑器（FlowPage）详细文档](./PAGE-FLOW-EDITOR.md) *(待编写)*
