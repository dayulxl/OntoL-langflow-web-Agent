/**
 * MemgraphNode — 图数据库查询节点的自定义 ReactFlow 渲染
 *
 * 注册到 nodeTypes: import MemgraphNode from "@/CustomNodes/MemgraphNode"
 * const nodeTypes = { ..., memgraphNode: MemgraphNode }
 *
 * 依赖:
 *   - @xyflow/react (Handle, Position, useUpdateNodeInternals)
 *   - Tailwind CSS
 *   - @/components/common/genericIconComponent (ForwardedIconComponent)
 *   - @/stores/flowStore (观察节点的运行时构建状态)
 */
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { memo } from "react";
import ForwardedIconComponent from "@/components/common/genericIconComponent";
import useFlowStore from "@/stores/flowStore";
import type { VertexBuildTypeAPI } from "@/types/api";
import { cn } from "@/utils/utils";

interface MemgraphNodeData {
  id: string;
  type: string;
  node?: {
    template?: Record<string, any>;
    outputs?: Array<{ name: string; types: string[] }>;
    display_name?: string;
    description?: string;
    icon?: string;
  };
}

/** 节点构建状态 → 颜色指示 */
function useBuildStatusColor(nodeId: string) {
  const vertexBuilds = useFlowStore((state) => state.vertexBuilds);
  const build = vertexBuilds?.[nodeId] as VertexBuildTypeAPI | undefined;
  if (!build) return "bg-muted";
  switch (build.status) {
    case "running":
    case "building":
      return "bg-amber-500 animate-pulse";
    case "error":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    default:
      return "bg-muted";
  }
}

const MemgraphNode = memo(({ data, id, selected }: NodeProps) => {
  const nodeData = (data as any)?.node ?? {};
  const displayName = nodeData.display_name ?? data.type ?? "Memgraph";
  const description = nodeData.description ?? "";
  const template = nodeData.template ?? {};
  const statusColor = useBuildStatusColor(id);

  // 提取配置摘要
  const boltUrl = template?.bolt_url?.value ?? "bolt://localhost:7687";
  const cypher = template?.cypher_query?.value ?? "";

  // 输出口
  const outputs = nodeData.outputs ?? [
    { name: "table", types: ["DataFrame"] },
    { name: "raw", types: ["Data"] },
  ];

  return (
    <div
      className={cn(
        "relative min-w-[240px] max-w-[320px] rounded-xl border-2 bg-background shadow-lg transition-shadow",
        selected
          ? "border-primary shadow-[0_0_12px_rgba(59,130,246,0.3)]"
          : "border-border hover:border-primary/50"
      )}
    >
      {/* ── 头部 ── */}
      <div className="flex items-center gap-2 rounded-t-xl bg-emerald-950/40 px-3 py-2 border-b border-border">
        {/* 数据库图标 */}
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/20">
          <ForwardedIconComponent
            name="Database"
            className="h-4 w-4 text-emerald-400"
          />
        </div>
        {/* 名称 */}
        <span className="truncate text-sm font-semibold text-foreground">
          {displayName}
        </span>
        {/* 状态指示灯 */}
        <span
          className={cn(
            "ml-auto h-2 w-2 flex-shrink-0 rounded-full",
            statusColor
          )}
          title="构建状态"
        />
      </div>

      {/* ── 配置信息 ── */}
      <div className="space-y-1.5 px-3 py-2">
        {/* URL */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="flex-shrink-0 opacity-60">🔗</span>
          <span className="truncate font-mono text-[11px]" title={boltUrl}>
            {boltUrl}
          </span>
        </div>
        {/* Cypher 预览 */}
        {cypher && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <span className="flex-shrink-0 opacity-60 mt-0.5">▶</span>
            <span className="line-clamp-2 font-mono text-[11px] leading-tight">
              {cypher.length > 60 ? cypher.slice(0, 60) + "…" : cypher}
            </span>
          </div>
        )}
        {/* 描述 */}
        {description && (
          <p className="text-[11px] text-muted-foreground/60 leading-tight line-clamp-1">
            {description}
          </p>
        )}
      </div>

      {/* ── 底部输出标签 ── */}
      <div className="flex items-center gap-1 border-t border-border px-3 py-1.5">
        {outputs.map((out: any) => (
          <span
            key={out.name}
            className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            {out.name}
          </span>
        ))}
      </div>

      {/* ── Handle 端口 ── */}
      {/* 输入 — 无数据连线入口，但保留 Handle 供扩展 */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!absolute !left-0 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !h-3 !w-3 !rounded-full !border-2 !border-emerald-400 !bg-emerald-900"
      />

      {/* 输出 */}
      {outputs.map((out: any, idx: number) => {
        const total = outputs.length;
        const yOffset =
          total === 1 ? 0 : (idx / (total - 1)) * 20 - 10;
        return (
          <Handle
            key={out.name}
            type="source"
            position={Position.Right}
            id={out.name}
            title={out.name}
            style={{ top: `calc(50% + ${yOffset}px)` }}
            className="!absolute !right-0 !-translate-x-1/2 !-translate-y-1/2 !h-3 !w-3 !rounded-full !border-2 !border-border !bg-muted hover:!border-primary hover:!bg-primary"
          />
        );
      })}
    </div>
  );
});

MemgraphNode.displayName = "MemgraphNode";

export default MemgraphNode;
