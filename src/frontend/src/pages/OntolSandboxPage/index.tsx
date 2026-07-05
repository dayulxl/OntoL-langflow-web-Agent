/**
 * 沙盘推演 — Memgraph 图可视化 + 推演分析
 * 功能: 工具栏 + 彩色节点画布 + 右侧属性栏 + 场景管理 + 推演
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background, Controls, Handle, MarkerType, Position,
  ReactFlow, useEdgesState, useNodesState, type Connection,
  type Edge, type Node, type NodeProps, addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { api } from "@/controllers/API/api";

// ── 常量 ────────────────────────────────────────────

const LABEL_COLORS: Record<string, string> = {
  Entity:   "#00d4ff",
  Class:    "#7c3aed",
  Property: "#22c55e",
  Patrol:   "#f97316",
  Type:     "#ef4444",
};
const FALLBACK_COLOR = "#6b7280";

const MEM_API = "/api/v1/memgraph";
const SCENE_API = "/api/v1/ontology-scenes";

// ── 自定义图节点（ReactFlow node type）───────────────

function OntolGraphNode({ data, selected }: NodeProps) {
  const labels: string[] = data.labels || [];
  const color = labels.map(l => LABEL_COLORS[l] || FALLBACK_COLOR).find(c => c !== FALLBACK_COLOR) || FALLBACK_COLOR;
  const name = data.name || data.id || "?";

  return (
    <div
      className={`relative rounded-xl border-2 px-4 py-3 text-xs shadow-lg transition-all min-w-[100px] max-w-[200px] text-center
        ${selected ? "scale-110 z-50 shadow-[0_0_20px_rgba(0,0,0,0.3)]" : ""}`}
      style={{ borderColor: color, background: `${color}15` }}
    >
      {/* Labels */}
      <div className="flex gap-1 justify-center mb-1.5 flex-wrap">
        {labels.map(l => (
          <span key={l} className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: LABEL_COLORS[l] || FALLBACK_COLOR, color: "#fff" }}>
            {l}
          </span>
        ))}
      </div>
      {/* Name */}
      <div className="font-semibold text-foreground truncate leading-tight">{name}</div>
      {data.id && <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">#{data.id}</div>}
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!h-3 !w-3 !border-2 !bg-background" style={{ borderColor: color }} />
      <Handle type="source" position={Position.Bottom} className="!h-3 !w-3 !border-2 !bg-background" style={{ borderColor: color }} />
    </div>
  );
}
const nodeTypes = { ontolNode: OntolGraphNode };

// ── 主页面 ──────────────────────────────────────────

export default function OntolSandboxPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [sidebarMode, setSidebarMode] = useState<"detail" | "createNode" | "createEdge" | "scene" | "deduction" | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [scenes, setScenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const rfInstance = useRef<any>(null);

  // 连接事件
  const onConnect = useCallback(async (conn: Connection) => {
    if (!conn.source || !conn.target) return;
    const label = prompt("关系类型 (如 RELATES_TO, HAS_PROPERTY):", "RELATES_TO") || "RELATES_TO";
    try {
      await api.post(`${MEM_API}/edges`, { source: Number(conn.source), target: Number(conn.target), label });
      await loadGraph();
    } catch (e: any) { alert("创建失败: " + (e.response?.data?.detail || e.message)); }
  }, []);

  // 选中 → 右侧详情
  const onNodeClick = useCallback((_e: any, node: Node) => { setSelectedNode(node); setSelectedEdge(null); setSidebarMode("detail"); }, []);
  const onEdgeClick = useCallback((_e: any, edge: Edge) => { setSelectedEdge(edge); setSelectedNode(null); setSidebarMode("detail"); }, []);
  const onPaneClick = useCallback(() => { setSelectedNode(null); setSelectedEdge(null); setSidebarMode(null); }, []);

  // 加载图
  const loadGraph = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get(`${MEM_API}/graph?limit=500`);
      const d = r.data;
      const columns = 8;
      setNodes(d.nodes.map((n: any, i: number) => ({
        id: String(n.id), type: "ontolNode",
        position: n.x != null ? { x: n.x, y: n.y } : { x: 60 + (i % columns) * 200, y: 40 + Math.floor(i / columns) * 140 },
        data: { labels: n.labels || [], name: n.name || n.ontol_name || `Node ${n.id}`, id: n.id, ...n },
      })));
      setEdges(d.edges.map((e: any) => ({
        id: String(e.id), source: String(e.source), target: String(e.target), label: e.label,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { strokeWidth: 2 },
      })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadGraph(); loadStatus(); loadScenes(); }, []);

  // 隐藏侧栏
  useEffect(() => {
    const sb = document.querySelector('[data-sidebar="sidebar"]') as HTMLElement | null;
    if (sb) sb.style.display = "none";
    return () => { if (sb) sb.style.display = ""; };
  }, []);

  async function loadStatus() {
    try { const r = await api.get(`${MEM_API}/status`); setStatus(r.data); } catch (e) {}
  }
  async function loadScenes() {
    try { const r = await api.get(SCENE_API); setScenes(r.data); } catch (e) {}
  }

  // ── 工具栏操作 ──
  function fitView() { rfInstance.current?.fitView({ padding: 0.2 }); }
  function zoomIn() { rfInstance.current?.zoomIn(); }
  function zoomOut() { rfInstance.current?.zoomOut(); }

  async function deleteSelected() {
    if (selectedNode) {
      if (!confirm("确定删除节点？")) return;
      await api.delete(`${MEM_API}/nodes/${selectedNode.id}`);
    } else if (selectedEdge) {
      if (!confirm("确定删除关系？")) return;
      await api.delete(`${MEM_API}/edges/${selectedEdge.id}`);
    } else return;
    setSelectedNode(null); setSelectedEdge(null); setSidebarMode(null);
    await loadGraph();
  }

  // 键盘
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Delete" && document.activeElement === document.body) deleteSelected(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selectedNode, selectedEdge]);

  // 搜索
  useEffect(() => {
    if (!search.trim()) return;
    const kw = search.toLowerCase();
    const n = nodes.find(x => (x.data.name || "").toLowerCase().includes(kw));
    if (n) { setSelectedNode(n); setSidebarMode("detail"); rfInstance.current?.setCenter(n.position.x + 60, n.position.y + 30, { zoom: 1.5, duration: 500 }); }
  }, [search]);

  // 保存选中节点位置到后端
  async function saveNodePosition(nodeId: string, x: number, y: number) {
    try { await api.put(`${MEM_API}/nodes/${nodeId}`, { props: { x, y } }); } catch (e) {}
  }

  return (
    <div className="flex h-[calc(100vh-48px)] bg-[#0a0f1e]">
      {/* ── 画布 + 工具栏 ── */}
      <div className="flex-1 relative">
        {/* 工具栏 */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-[#0a0f1ee8] backdrop-blur border border-white/10 rounded-lg px-2 py-1.5">
          <ToolBtn onClick={() => setSidebarMode("createNode")}>＋ 创建节点</ToolBtn>
          <ToolBtn onClick={() => setSidebarMode("createEdge")}>🔗 创建关系</ToolBtn>
          <ToolBtn danger onClick={deleteSelected}>🗑 删除</ToolBtn>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <ToolBtn onClick={fitView}>⊞ 适应画布</ToolBtn>
          <ToolBtn onClick={zoomIn}>＋ 放大</ToolBtn>
          <ToolBtn onClick={zoomOut}>− 缩小</ToolBtn>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索节点..."
            className="w-32 text-sm bg-white/5 border border-white/10 rounded px-3 py-1.5 outline-none text-white/80 placeholder:text-white/30 focus:border-[#00d4ff]/50"
          />
          <div className="w-px h-6 bg-white/10 mx-1" />
          <ToolBtn accent onClick={() => { setSidebarMode("deduction"); }}>🧠 推演分析</ToolBtn>
          <ToolBtn onClick={() => { loadScenes(); setSidebarMode("scene"); }}>📋 场景</ToolBtn>
          <ToolBtn onClick={loadGraph}>🔄 刷新</ToolBtn>
          <ToolBtn title="导出到 SQLite" onClick={async () => {
            try { const r = await api.post(`${MEM_API}/export-to-sqlite`); alert(`已导出: ${r.data.nodes} 节点, ${r.data.edges} 关系`); }
            catch (e: any) { alert("导出失败"); }
          }}>💾</ToolBtn>
        </div>

        {/* 状态指示栏 */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-2 py-1 rounded bg-[#0a0f1ee8] backdrop-blur border border-white/10 text-[11px] text-white/50">
          <span className={`w-1.5 h-1.5 rounded-full ${status?.connected ? "bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-red-400"}`} />
          {status?.connected ? `${status.node_count} 节点` : "未连接"}
          <div className="w-px h-4 bg-white/10" />
          <span>{nodes.length} N · {edges.length} E</span>
        </div>

        {/* 画布 */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onNodeDragStop={(_e, node) => saveNodePosition(node.id, node.position.x, node.position.y)}
          nodeTypes={nodeTypes}
          fitView
          onInit={(inst) => { rfInstance.current = inst; }}
          defaultEdgeOptions={{
            style: { stroke: "#ffffff22", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: "#ffffff55" },
          }}
          style={{ background: "#0a0f1e" }}
        >
          <Background color="#ffffff10" gap={24} size={1} />
          <Controls className="!bg-[#0a0f1e] !border-white/10 !fill-white/60" />
        </ReactFlow>
      </div>

      {/* ── 右侧栏 ── */}
      {sidebarMode && (
        <aside className="w-[340px] min-w-[340px] flex flex-col border-l border-white/10 bg-[#0c1225] overflow-auto">
          {sidebarMode === "detail" && (selectedNode || selectedEdge) && (
            <DetailPanel
              node={selectedNode} edge={selectedEdge}
              onUpdate={async (id, body) => {
                if (selectedNode) { await api.put(`${MEM_API}/nodes/${id}`, body); }
                else if (selectedEdge) { await api.put(`${MEM_API}/edges/${id}`, body); }
                setSidebarMode(null); loadGraph();
              }}
              onDelete={deleteSelected}
              onClose={() => { setSelectedNode(null); setSelectedEdge(null); setSidebarMode(null); }}
            />
          )}
          {sidebarMode === "createNode" && (
            <CreateNodePanel
              onCreate={async (data) => { await api.post(`${MEM_API}/nodes`, data); setSidebarMode(null); loadGraph(); }}
              onClose={() => setSidebarMode(null)}
            />
          )}
          {sidebarMode === "createEdge" && (
            <CreateEdgePanel
              nodeIds={nodes.map(n => ({ id: n.id, name: n.data.name || n.id }))}
              onCreate={async (data) => { await api.post(`${MEM_API}/edges`, data); setSidebarMode(null); loadGraph(); }}
              onInsert={async (data) => { await api.post(`${MEM_API}/insert-between`, data); setSidebarMode(null); loadGraph(); }}
              onClose={() => setSidebarMode(null)}
            />
          )}
          {sidebarMode === "scene" && (
            <ScenePanel scenes={scenes} onReload={() => { loadScenes(); }}
              onClose={() => setSidebarMode(null)} />
          )}
          {sidebarMode === "deduction" && (
            <DeductionPanel nodes={nodes} edges={edges}
              onClose={() => setSidebarMode(null)} />
          )}
        </aside>
      )}
    </div>
  );
}

// ── 子组件 ────────────────────────────────────────

// ── 推演分析面板 ─────────────────────────────────
function DeductionPanel({ nodes, edges, onClose }: any) {
  const [targetNode, setTargetNode] = useState("");
  const [result, setResult] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const nodeNames = nodes.map((n: any) => ({ id: n.id, name: n.data?.name || n.id }));

  async function runDeduction(mode: string) {
    const target = targetNode || (nodes[0]?.id);
    if (!target) { alert("请先选择目标节点"); return; }
    setLoading(true);
    try {
      let cypher = "";
      if (mode === "neighbors") {
        cypher = `MATCH (n)-[r]-(m) WHERE id(n)=${target} RETURN n,r,m`;
      } else if (mode === "paths") {
        cypher = `MATCH p=(n)-[*1..3]-(m) WHERE id(n)=${target} RETURN p LIMIT 20`;
      } else if (mode === "influence") {
        cypher = `MATCH (n)-[r]->(m) WHERE id(n)=${target} RETURN n,r,m, count(r) AS strength ORDER BY strength DESC`;
      }
      const resp = await fetch("/api/v1/memgraph/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cypher }),
      });
      const data = await resp.json();
      setResult(data.rows || []);
    } catch (e: any) {
      alert("推演失败: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">🧠 推演分析</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white text-lg">✕</button>
      </div>

      {/* 选择目标节点 */}
      <div className="mb-4">
        <div className="text-[11px] text-white/40 mb-1">目标节点</div>
        <select value={targetNode} onChange={e => setTargetNode(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none">
          <option value="">— 选择节点 —</option>
          {nodeNames.map((n: any) => (
            <option key={n.id} value={n.id}>{n.name} (ID:{n.id})</option>
          ))}
        </select>
      </div>

      {/* 推演操作 */}
      <div className="space-y-2 mb-4">
        <button onClick={() => runDeduction("neighbors")} disabled={loading}
          className="w-full py-2 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-all">
          🔗 探索邻居（1度关系）
        </button>
        <button onClick={() => runDeduction("paths")} disabled={loading}
          className="w-full py-2 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-all">
          🕸️ 路径推演（1-3跳）
        </button>
        <button onClick={() => runDeduction("influence")} disabled={loading}
          className="w-full py-2 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-all">
          📊 影响力分析
        </button>
      </div>

      {/* 推演结果 */}
      {loading && <div className="text-xs text-white/60 text-center py-4">推演中...</div>}
      {result !== null && !loading && (
        <div>
          <div className="text-[11px] text-white/40 mb-2">推演结果 ({result.length} 条)</div>
          <div className="max-h-[400px] overflow-auto space-y-1">
            {result.length === 0 ? (
              <div className="text-xs text-white/30 text-center py-4">无结果</div>
            ) : (
              result.map((row, i) => (
                <div key={i} className="text-[11px] text-white/60 bg-white/5 rounded px-2 py-1 font-mono break-all">
                  {JSON.stringify(row, null, 0).slice(0, 200)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 工具栏按钮 ───────────────────────────────────
function ToolBtn({ onClick, danger, accent, children }: any) {
  return (
    <button onClick={onClick}
      className={`h-9 px-3 flex items-center rounded text-sm font-medium transition-all whitespace-nowrap
        ${danger ? "text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
        : accent ? "text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 hover:text-purple-300"
        : "text-white/70 border border-white/10 hover:bg-white/10 hover:text-white"}`}>
      {children}
    </button>
  );
}

// ── 详情面板 ─────────────────────────────────────
function DetailPanel({ node, edge, onUpdate, onDelete, onClose }: any) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(node?.data?.name || "");
  const labels = node?.data?.labels || [];
  const color = labels.map((l: string) => LABEL_COLORS[l] || FALLBACK_COLOR).find((c: string) => c !== FALLBACK_COLOR) || FALLBACK_COLOR;

  if (edge) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">关系详情</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg">✕</button>
        </div>
        <div className="space-y-2 text-xs text-white/60">
          <Field label="ID" value={edge.id} />
          <Field label="类型" value={edge.label || "—"} />
          <Field label="源节点" value={edge.source} />
          <Field label="目标节点" value={edge.target} />
        </div>
        <button onClick={onDelete} className="mt-4 w-full py-1.5 text-xs border border-red-500/40 text-red-400 rounded hover:bg-red-500/10">🗑 删除关系</button>
      </div>
    );
  }
  if (!node) return null;

  // 属性列表（排除内部字段）
  const props = Object.entries(node.data || {}).filter(([k]) =>
    !["labels", "name", "id", "_id", "_labels", "x", "y"].includes(k) && typeof node.data[k] !== "function");

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">节点详情</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white text-lg">✕</button>
      </div>

      {/* 标签 + 颜色条 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1 h-5 rounded" style={{ background: color }} />
        {labels.map((l: string) => (
          <span key={l} className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: LABEL_COLORS[l] || FALLBACK_COLOR }}>{l}</span>
        ))}
      </div>

      {editing ? (
        <div className="space-y-2">
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#00d4ff]/50" />
          <div className="flex gap-2">
            <button onClick={async () => { await onUpdate(node.id, { props: { name } }); setEditing(false); }}
              className="px-3 py-1 text-xs bg-[#00d4ff] text-black font-bold rounded">保存</button>
            <button onClick={() => setEditing(false)} className="px-3 py-1 text-xs border border-white/10 text-white/60 rounded">取消</button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2 text-xs text-white/60">
            <Field label="ID" value={node.id} />
            <Field label="名称" value={name || "—"} />
          </div>
          <button onClick={() => setEditing(true)} className="mt-2 px-3 py-1 text-xs border border-white/10 text-white/60 rounded hover:bg-white/5">
            ✏ 更新名称
          </button>
        </>
      )}

      {/* 属性列表 */}
      {props.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-semibold text-white/40 uppercase mb-2">属性 ({props.length})</div>
          <div className="space-y-1">
            {props.map(([k, v]) => (
              <div key={k} className="flex justify-between text-[11px]">
                <span className="text-white/40">{k}</span>
                <span className="text-white/70 max-w-[160px] truncate">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 操作 */}
      <div className="mt-4 space-y-2">
        <button onClick={onDelete}
          className="w-full py-1.5 text-xs border border-red-500/40 text-red-400 rounded hover:bg-red-500/10">🗑 删除节点</button>
      </div>
    </div>
  );
}

// ── 创建节点 ─────────────────────────────────────
function CreateNodePanel({ onCreate, onClose }: any) {
  const [labels, setLabels] = useState(["Entity"]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [props, setProps] = useState<[string, string][]>([["", ""]]);
  const LABEL_OPTS = ["Entity", "Class", "Property", "Patrol", "Type"];

  function toggleLabel(l: string) {
    setLabels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">创建节点</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white text-lg">✕</button>
      </div>
      <div className="space-y-3">
        {/* 标签选择 */}
        <div>
          <div className="text-[11px] text-white/40 mb-1">标签（可多选）</div>
          <div className="flex gap-1.5 flex-wrap">
            {LABEL_OPTS.map(l => (
              <button key={l} onClick={() => toggleLabel(l)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border
                  ${labels.includes(l) ? "text-white" : "text-white/30 border-white/10 bg-white/5 opacity-50"}`}
                style={labels.includes(l) ? { background: LABEL_COLORS[l] || FALLBACK_COLOR, borderColor: LABEL_COLORS[l] } : {}}
              >{l}</button>
            ))}
          </div>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="名称 *" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#00d4ff]/50" />
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="编码（可选）" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#00d4ff]/50" />
        {/* 自定义属性 */}
        <div>
          <div className="text-[11px] text-white/40 mb-1">自定义属性</div>
          {props.map(([k, v], i) => (
            <div key={i} className="flex gap-1 mb-1">
              <input value={k} onChange={e => { const n = [...props]; n[i][0] = e.target.value; setProps(n); }} placeholder="键"
                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white outline-none" />
              <input value={v} onChange={e => { const n = [...props]; n[i][1] = e.target.value; setProps(n); }} placeholder="值"
                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white outline-none" />
              {props.length > 1 && <button onClick={() => setProps(props.filter((_, j) => j !== i))} className="text-red-400 text-xs px-1">✕</button>}
            </div>
          ))}
          <button onClick={() => setProps([...props, ["", ""]])} className="text-[11px] text-[#00d4ff] hover:underline">+ 添加属性</button>
        </div>
        <button onClick={() => {
          if (!name) { alert("请输入名称"); return; }
          const p: any = { name };
          if (code) p.code = code;
          props.filter(([k]) => k).forEach(([k, v]) => { p[k] = v; });
          onCreate({ labels, props: p });
        }} className="w-full py-2 text-xs bg-[#00d4ff] text-black font-bold rounded hover:opacity-90">创建节点</button>
      </div>
    </div>
  );
}

// ── 创建关系 ─────────────────────────────────────
function CreateEdgePanel({ nodeIds, onCreate, onInsert, onClose }: any) {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [label, setLabel] = useState("RELATES_TO");
  const [mode, setMode] = useState<"direct" | "insert">("direct");
  const [insertLabels, setInsertLabels] = useState(["Entity"]);
  const [insertName, setInsertName] = useState("");

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">创建关系</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white text-lg">✕</button>
      </div>
      {/* 模式切换 */}
      <div className="flex gap-1 mb-3 bg-white/5 rounded p-0.5">
        <button onClick={() => setMode("direct")}
          className={`flex-1 py-1 text-[11px] rounded ${mode === "direct" ? "bg-[#00d4ff]/20 text-[#00d4ff]" : "text-white/40"}`}>直接连线</button>
        <button onClick={() => setMode("insert")}
          className={`flex-1 py-1 text-[11px] rounded ${mode === "insert" ? "bg-purple-500/20 text-purple-400" : "text-white/40"}`}>插入节点</button>
      </div>
      <div className="space-y-2">
        <SelectField label="源节点" value={source} onChange={setSource} options={nodeIds} />
        <SelectField label="目标节点" value={target} onChange={setTarget} options={nodeIds} />
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="关系类型" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#00d4ff]/50" />
        {mode === "insert" && (
          <>
            <input value={insertName} onChange={e => setInsertName(e.target.value)} placeholder="插入节点名称 *" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-purple-500/50" />
          </>
        )}
        <button onClick={() => {
          if (!source || !target) { alert("请选择源节点和目标节点"); return; }
          if (mode === "insert") {
            if (!insertName) { alert("请输入插入节点名称"); return; }
            onInsert({ source: Number(source), target: Number(target), node_labels: insertLabels, node_props: { name: insertName }, from_label: label, to_label: label });
          } else {
            onCreate({ source: Number(source), target: Number(target), label });
          }
        }} className="w-full py-2 text-xs bg-[#00d4ff] text-black font-bold rounded hover:opacity-90">
          {mode === "insert" ? "插入节点并创建关系" : "创建关系"}
        </button>
      </div>
    </div>
  );
}

// ── 场景面板 ─────────────────────────────────────
function ScenePanel({ scenes, onReload, onClose }: any) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">场景管理</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white text-lg">✕</button>
      </div>
      {/* 新建 */}
      <div className="space-y-2 mb-4 pb-4 border-b border-white/10">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="场景名称" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none" />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="场景描述" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none" />
        <button onClick={async () => {
          if (!name) { alert("请输入场景名称"); return; }
          try { await api.post(SCENE_API, { scene_name: name, scene_desc: desc, scene_is_system: "0" }); setName(""); setDesc(""); onReload(); } catch (e: any) { alert("创建失败"); }
        }} className="w-full py-1.5 text-xs bg-[#00d4ff] text-black font-bold rounded">新建场景</button>
      </div>
      {/* 列表 */}
      <div className="space-y-1">
        {scenes.length === 0 ? <div className="text-xs text-white/30 text-center py-4">暂无场景</div> : scenes.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/5 text-xs text-white/60">
            <div>
              <div className="text-white/80">{s.scene_name}</div>
              {s.scene_desc && <div className="text-[10px] text-white/30">{s.scene_desc}</div>}
            </div>
            <button onClick={async () => {
              if (!confirm("删除场景？")) return;
              await api.delete(`${SCENE_API}/${s.id}`); onReload();
            }} className="text-red-400 hover:text-red-300 text-xs">删除</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 原子组件 ─────────────────────────────────────

function Field({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-white/40">{label}</span><span className="text-white/70 font-mono text-[11px] truncate max-w-[180px]">{value}</span></div>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { id: string; name: string }[] }) {
  return (
    <div>
      <label className="text-[11px] text-white/40">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none">
        <option value="">— 选择 —</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.name} (ID:{o.id})</option>)}
      </select>
    </div>
  );
}
