# Flow 编辑页面目录索引 (FlowPage)

> URL: `http://localhost:7860/flow/:id`
> 路由: `src/frontend/src/routes.tsx`
> 入口组件: `FlowPage`

---

## 一、页面架构

```
FlowPage (pages/FlowPage/index.tsx)
│
├── [左侧] flowSidebarComponent     组件面板
│   ├── 搜索框 (searchInput)
│   ├── 分类导航 (sidebarSegmentedNav)
│   ├── 组件列表 (sidebarItemsList + sidebarBundles)
│   ├── 可拖拽组件卡片 (sidebarDraggableComponent)
│   ├── 过滤面板 (sidebarFilterComponent)
│   └── 版本管理 (FlowVersionSidebar)
│
├── [中央] PageComponent             画布区域
│   ├── @xyflow/react 画布实例
│   ├── 自定义节点 (CustomNodes/*)
│   ├── 自定义连线 (CustomEdges/*)
│   ├── 画布横幅 (CanvasBanner)
│   ├── 节点工具栏 (nodeToolbarComponent)
│   ├── 多选菜单 (SelectionMenuComponent)
│   └── 连线渲染 (ConnectionLineComponent)
│
├── [右侧] InspectionPanel           属性面板
│   ├── 组件标题 (EditableHeaderContent)
│   ├── 字段编辑器 (InspectionPanelFields)
│   └── 输出预览 (InspectionPanelOutputs)
│
├── [底部面板] TraceComponent        执行追踪
│   ├── 追踪列表 (TraceDetailView)
│   ├── Span 树 (SpanTree/SpanNode)
│   └── 洞察分析 (FlowInsightsContent)
│
└── [底部面板] MemoriesMainContent   记忆管理
    ├── 记忆侧栏 (MemoriesSidebar)
    ├── 记忆详情 (MemoryDetails)
    └── 文档面板 (MemoryDocumentPanel)
```

---

## 二、核心文件索引

### 2.1 页面入口

| 文件 | 说明 |
|------|------|
| [`pages/FlowPage/index.tsx`](../../src/frontend/src/pages/FlowPage/index.tsx) | Flow 编辑页主入口，组装三大面板 |
| [`pages/FlowPage/consts.ts`](../../src/frontend/src/pages/FlowPage/consts.ts) | 页面级常量 |

### 2.2 左侧 — 组件面板

| 文件 | 说明 |
|------|------|
| [`components/flowSidebarComponent/index.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/index.tsx) | 侧栏根组件 |
| [`components/flowSidebarComponent/components/searchInput.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/searchInput.tsx) | 组件搜索框 |
| [`components/flowSidebarComponent/components/sidebarSegmentedNav.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarSegmentedNav.tsx) | 分类分段导航（Bundles/All/Components/MCP） |
| [`components/flowSidebarComponent/components/sidebarBundles.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarBundles.tsx) | Bundle 扩展组件分组列表 |
| [`components/flowSidebarComponent/components/categoryGroup.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/categoryGroup.tsx) | 组件分类分组 |
| [`components/flowSidebarComponent/components/categoryDisclouse.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/categoryDisclouse.tsx) | 分类折叠展开 |
| [`components/flowSidebarComponent/components/sidebarDraggableComponent.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarDraggableComponent.tsx) | 可拖拽到画布的组件卡片 |
| [`components/flowSidebarComponent/components/sidebarItemsList.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarItemsList.tsx) | 扁平组件列表 |
| [`components/flowSidebarComponent/components/sidebarFilterComponent.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarFilterComponent.tsx) | 组件过滤面板（Beta/旧版/状态过滤） |
| [`components/flowSidebarComponent/components/sidebarHeader/index.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarHeader/index.tsx) | 侧栏顶栏 |
| [`components/flowSidebarComponent/components/sidebarFooterButtons.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebarFooterButtons.tsx) | 侧栏底部操作按钮 |
| [`components/flowSidebarComponent/components/searchConfigTrigger.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/searchConfigTrigger.tsx) | 搜索配置触发器 |
| [`components/flowSidebarComponent/components/emptySearchComponent.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/emptySearchComponent.tsx) | 搜索无结果占位 |
| [`components/flowSidebarComponent/components/bundleHeaderActions.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/bundleHeaderActions.tsx) | Bundle 头部操作按钮 |
| [`components/flowSidebarComponent/components/bundleItems.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/bundleItems.tsx) | Bundle 组件项 |
| [`components/flowSidebarComponent/components/featureTogglesComponent.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/featureTogglesComponent.tsx) | 特性开关 |
| [`components/flowSidebarComponent/components/McpSidebarGroup.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/McpSidebarGroup.tsx) | MCP 组件分组 |

#### 侧栏 Helper 函数（16 个）

| 文件 | 说明 |
|------|------|
| [`helpers/filtered-data.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/filtered-data.ts) | **主过滤入口** — 合并搜索 + 过滤 + 排序 |
| [`helpers/apply-component-filter.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/apply-component-filter.ts) | 组件状态过滤 |
| [`helpers/apply-beta-filter.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/apply-beta-filter.ts) | Beta 标签过滤 |
| [`helpers/apply-legacy-filter.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/apply-legacy-filter.ts) | 旧版组件过滤 |
| [`helpers/apply-edge-filter.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/apply-edge-filter.ts) | 连线过滤 |
| [`helpers/search-on-metadata.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/search-on-metadata.ts) | 元数据全文搜索 |
| [`helpers/traditional-search-metadata.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/traditional-search-metadata.ts) | 传统搜索元数据构建 |
| [`helpers/combined-results.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/combined-results.ts) | 多源搜索结果合并去重 |
| [`helpers/normalize-string.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/normalize-string.ts) | 搜索字符串标准化 |
| [`helpers/sensitive-sort.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/sensitive-sort.tsx) | 大小写/特殊字符排序 |
| [`helpers/derive-bundle-extension-id.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/derive-bundle-extension-id.ts) | Bundle ID 解析 |
| [`helpers/get-disabled-tooltip.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/get-disabled-tooltip.ts) | 禁用组件 tooltip 文案 |
| [`helpers/disable-item.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/disable-item.ts) | 禁用项条件判断 |
| [`helpers/compute-section-visibility.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/compute-section-visibility.ts) | 区域可见性计算 |
| [`helpers/constants.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/helpers/constants.ts) | 过滤常量 |
| [`helpers/sidebar-nav-items.ts`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/sidebar-nav-items.ts) | 导航项配置 |

### 2.3 中央 — 画布

| 文件 | 说明 |
|------|------|
| [`components/PageComponent/index.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/index.tsx) | **画布主组件** — @xyflow/react 实例 |
| [`components/PageComponent/MemoizedComponents.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/MemoizedComponents.tsx) | 缓存优化后的子组件集合 |
| [`components/PageComponent/components/CanvasBanner.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/components/CanvasBanner.tsx) | 画布顶部横幅（未保存/版本提示） |
| [`components/PageComponent/components/RestoreVersionButton.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/components/RestoreVersionButton.tsx) | 恢复到历史版本 |
| [`components/PageComponent/components/SaveVersionDialog.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/components/SaveVersionDialog.tsx) | 保存为新版本 |
| [`components/PageComponent/components/VersionPreviewOverlay.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/components/VersionPreviewOverlay.tsx) | 版本预览叠加层 |
| [`components/PageComponent/components/helper-lines.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/components/helper-lines.tsx) | 对齐辅助线 |
| [`components/PageComponent/components/SaveSnapshotButton.tsx`](../../src/frontend/src/pages/FlowPage/components/PageComponent/components/SaveSnapshotButton.tsx) | 快照保存按钮 |
| [`components/flowBuildingComponent/index.tsx`](../../src/frontend/src/pages/FlowPage/components/flowBuildingComponent/index.tsx) | Flow 构建中提示 |
| [`components/ConnectionLineComponent/index.tsx`](../../src/frontend/src/pages/FlowPage/components/ConnectionLineComponent/index.tsx) | 拖拽连接线动画 |
| [`components/SelectionMenuComponent/index.tsx`](../../src/frontend/src/pages/FlowPage/components/SelectionMenuComponent/index.tsx) | 多选节点批量操作菜单 |
| [`components/UpdateAllComponents/index.tsx`](../../src/frontend/src/pages/FlowPage/components/UpdateAllComponents/index.tsx) | 批量更新组件按钮/弹窗 |

### 2.4 自定义节点与连线

| 目录 | 说明 |
|------|------|
| [`CustomNodes/`](../../src/frontend/src/CustomNodes/) | 每种组件类型的画布渲染节点（如 GenericNode、AgentNode 等） |
| [`CustomEdges/`](../../src/frontend/src/CustomEdges/) | 自定义连线样式 |

### 2.5 右侧 — 属性面板

| 文件 | 说明 |
|------|------|
| [`components/InspectionPanel/index.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/index.tsx) | 属性面板根组件 |
| [`components/InspectionPanel/components/InspectionPanelHeader.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/InspectionPanelHeader.tsx) | 面板标题栏 |
| [`components/InspectionPanel/components/EditableHeaderContent.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/EditableHeaderContent.tsx) | 可编辑的组件名称标题 |
| [`components/InspectionPanel/components/InspectionPanelFields.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/InspectionPanelFields.tsx) | 参数字段组容器 |
| [`components/InspectionPanel/components/InspectionPanelField.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/InspectionPanelField.tsx) | 单个参数展示（只读模式） |
| [`components/InspectionPanel/components/InspectionPanelEditField.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/InspectionPanelEditField.tsx) | 参数编辑器（编辑模式） |
| [`components/InspectionPanel/components/InspectionPanelOutputs.tsx`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/InspectionPanelOutputs.tsx) | 组件输出结果预览 |
| [`components/InspectionPanel/components/hidden-fields.ts`](../../src/frontend/src/pages/FlowPage/components/InspectionPanel/components/hidden-fields.ts) | 隐藏字段白名单 |

### 2.6 节点工具栏

| 文件 | 说明 |
|------|------|
| [`components/nodeToolbarComponent/index.tsx`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/index.tsx) | 节点悬浮工具栏（复制、删除、API、代码、冻结等） |
| [`components/nodeToolbarComponent/components/toolbar-button.tsx`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/components/toolbar-button.tsx) | 工具栏按钮原子组件 |
| [`components/nodeToolbarComponent/components/toolbar-modals.tsx`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/components/toolbar-modals.tsx) | 工具栏弹窗（API 配置、代码编辑等） |
| [`components/nodeToolbarComponent/hooks/use-shortcuts.ts`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/hooks/use-shortcuts.ts) | 节点操作快捷键 |
| [`components/nodeToolbarComponent/shortcutDisplay/index.tsx`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/shortcutDisplay/index.tsx) | 快捷键文字提示 |
| [`components/nodeToolbarComponent/toolbarSelectItem/index.tsx`](../../src/frontend/src/pages/FlowPage/components/nodeToolbarComponent/toolbarSelectItem/index.tsx) | 工具栏下拉选择项 |

### 2.7 执行追踪面板

| 文件 | 说明 |
|------|------|
| [`components/TraceComponent/TraceDetailView.tsx`](../../src/frontend/src/pages/FlowPage/components/TraceComponent/TraceDetailView.tsx) | 追踪详情视图 |
| [`components/TraceComponent/SpanTree.tsx`](../../src/frontend/src/pages/FlowPage/components/TraceComponent/SpanTree.tsx) | Span 树形结构 |
| [`components/TraceComponent/SpanNode.tsx`](../../src/frontend/src/pages/FlowPage/components/TraceComponent/SpanNode.tsx) | 单个 Span 节点 |
| [`components/TraceComponent/SpanDetail.tsx`](../../src/frontend/src/pages/FlowPage/components/TraceComponent/SpanDetail.tsx) | Span 详情面板 |
| [`components/TraceComponent/TraceAccordionItem.tsx`](../../src/frontend/src/pages/FlowPage/components/TraceComponent/TraceAccordionItem.tsx) | 折叠项 |
| [`components/TraceComponent/DateRangePopover.tsx`](../../src/frontend/src/pages/FlowPage/components/TraceComponent/DateRangePopover.tsx) | 日期范围选择器 |
| [`components/TraceComponent/FlowInsightsContent.tsx`](../../src/frontend/src/pages/FlowPage/components/TraceComponent/FlowInsightsContent.tsx) | Flow 执行洞察分析 |

### 2.8 记忆管理面板

| 文件 | 说明 |
|------|------|
| [`components/MemoriesMainContent/index.tsx`](../../src/frontend/src/pages/FlowPage/components/MemoriesMainContent/index.tsx) | 记忆管理主面板 |
| [`components/MemoriesMainContent/components/MemoriesSidebar.tsx`](../../src/frontend/src/pages/FlowPage/components/MemoriesMainContent/components/MemoriesSidebar.tsx) | 记忆列表侧栏 |
| [`components/MemoriesMainContent/components/MemoryDetails.tsx`](../../src/frontend/src/pages/FlowPage/components/MemoriesMainContent/components/MemoryDetails.tsx) | 记忆详情 |
| [`components/MemoriesMainContent/components/MemoryDetailsHeader.tsx`](../../src/frontend/src/pages/FlowPage/components/MemoriesMainContent/components/MemoryDetailsHeader.tsx) | 记忆详情头部 |
| [`components/MemoriesMainContent/components/MemoryDocumentPanel.tsx`](../../src/frontend/src/pages/FlowPage/components/MemoriesMainContent/components/MemoryDocumentPanel.tsx) | 记忆文档面板 |
| [`components/MemoriesMainContent/components/MemoryKnowledgeBaseSection.tsx`](../../src/frontend/src/pages/FlowPage/components/MemoriesMainContent/components/MemoryKnowledgeBaseSection.tsx) | 知识库关联区域 |
| [`components/MemoriesMainContent/components/NoMemorySelected.tsx`](../../src/frontend/src/pages/FlowPage/components/MemoriesMainContent/components/NoMemorySelected.tsx) | 未选择记忆时的空状态 |
| [`components/MemoriesMainContent/components/SummaryCard.tsx`](../../src/frontend/src/pages/FlowPage/components/MemoriesMainContent/components/SummaryCard.tsx) | 记忆摘要卡片 |

### 2.9 版本管理

| 文件 | 说明 |
|------|------|
| [`components/flowSidebarComponent/components/FlowVersionSidebar/index.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/FlowVersionSidebar/index.tsx) | 版本管理侧栏 |
| [`components/flowSidebarComponent/components/FlowVersionSidebar/components/VersionListItem.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/FlowVersionSidebar/components/VersionListItem.tsx) | 版本列表项 |
| [`components/flowSidebarComponent/components/FlowVersionSidebar/components/DeleteConfirmDialog.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/FlowVersionSidebar/components/DeleteConfirmDialog.tsx) | 删除版本确认框 |
| [`components/flowSidebarComponent/components/FlowVersionSidebarContent.tsx`](../../src/frontend/src/pages/FlowPage/components/flowSidebarComponent/components/FlowVersionSidebarContent.tsx) | 版本侧栏内容 |

---

## 三、数据流

```
typesStore (所有可用组件元数据)
  │
  ▼
flowSidebarComponent ──[拖拽]──▶ flowStore.addNode()
  │                                  │
  │                                  ▼
  │                          PageComponent (@xyflow/react)
  │                                  │
  │                    ┌─────────────┼─────────────┐
  │                    ▼             ▼              ▼
  │             nodeToolbar   CustomNodes    ConnectionLine
  │                    │
  │                    ▼
  │             InspectionPanel
  │                    │
  │                    ▼
  │             flowStore.updateNode()
  │
  └──[执行 Flow]──▶ messagesStore ──▶ TraceComponent
```

---

## 四、相关文档

- [Flow 列表页面索引](./PAGE-FLOWS.md) — /flows 列表页
- [状态管理 Store 索引](./STORES.md) — 所有 Zustand Store
- [前端目录说明](../../src/frontend/README.md)
