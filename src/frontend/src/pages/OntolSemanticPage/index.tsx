import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/controllers/API/api";

interface OntolAttr {
  id: string; ontol_model_id: string; attr_name: string; attr_code: string;
  attr_data_type: string; attr_length: string | null; attr_digit: string | null;
  attr_is_only: string; attr_required: string; attr_default_value: string | null;
  attr_is_system: string; attr_desc: string | null;
}
interface OntolModel {
  id: string; ontol_parent_id: string | null; ontol_name: string; ontol_model_type: string;
  ontol_model_status: string; ontol_model_desc: string | null; ontol_code: string;
  create_time?: string; update_time?: string; depth?: number;
  attributes?: OntolAttr[]; children?: OntolModel[];
}

const MODEL_TYPE: Record<string,string>={M1:"对象",M2:"行为",M3:"规则",M4:"场景",M5:"主体",M6:"异常补偿",M7:"质量约束",ME:"事件",MT:"模板"};
const DATA_TYPE: Record<string,string>={"0":"字符串","1":"数字","2":"浮点数"};
const API_BASE = "/api/v1/ontology-models";

export default function OntolSemanticPage() {
  const [treeData, setTreeData] = useState<OntolModel[]>([]);
  const [active, setActive] = useState<OntolModel | null>(null);
  const [view, setView] = useState<"detail"|"createChild"|"editModel"|"createAttr"|"editAttr"|"moveModel">("detail");
  const [editAttrId, setEditAttrId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try { const r = await api.get(API_BASE); setTreeData(r.data); }
    catch(e) { console.error(e); }
  }, []);
  useEffect(() => { load(); }, [load]);

  // 页签标题
  useEffect(() => { document.title = "OntoL"; }, []);

  // 隐藏 Langflow 自带侧栏（保留顶栏菜单）
  useEffect(() => {
    const sidebar = document.querySelector('[data-sidebar="sidebar"]') as HTMLElement | null;
    if (sidebar) sidebar.style.display = "none";
    return () => {
      if (sidebar) sidebar.style.display = "";
    };
  }, []);

  const selectModel = async (m: OntolModel) => {
    setActive(m); setView("detail");
    try {
      const r = await api.get(`${API_BASE}/${encodeURIComponent(m.id)}?with_attrs=true`);
      setActive(r.data);
    } catch(e) {}
  };
  const showCreateChild = (pid: string | null) => { setView("createChild"); };
  const reset = () => { setActive(null); setView("detail"); };

  // 开移动
  function openMove(node: OntolModel) {
    setActive(node);
    setView("moveModel");
  }

  // 获取某节点的所有子孙 ID（防止循环引用）
  const getDescendantIds = useCallback((models: OntolModel[], pid: string): Set<string> => {
    const ids = new Set<string>();
    const walk = (p: string) => {
      for (const m of models) {
        if (m.ontol_parent_id === p) { ids.add(m.id); walk(m.id); }
      }
    };
    walk(pid);
    return ids;
  }, []);

  // 搜索
  const filtered = search.trim()
    ? treeData.filter(n => {
        const kw = search.toLowerCase();
        return (n.ontol_name||"").toLowerCase().includes(kw)
          || (n.ontol_code||"").toLowerCase().includes(kw)
          || (n.ontol_model_desc||"").toLowerCase().includes(kw);
      }).map(n => ({...n, depth: 0}))
    : treeData;

  const roots = filtered.filter(n => !n.ontol_parent_id);
  const idMap = new Map(filtered.map(n => [n.id, {...n, children: [] as OntolModel[]}]));
  const top: OntolModel[] = [];
  for (const n of idMap.values()) {
    if (n.ontol_parent_id && idMap.has(n.ontol_parent_id)) {
      idMap.get(n.ontol_parent_id)!.children!.push(n);
    } else if (!n.ontol_parent_id) {
      top.push(n);
    } else {
      top.push(n);
    }
  }

  // 不能移到的 ID（自己和子孙）
  const forbiddenIds = active?.id ? getDescendantIds(treeData, active.id) : new Set<string>();
  if (active?.id) forbiddenIds.add(active.id);

  return (
    <div className="flex h-[calc(100vh-48px)] bg-background">
      <aside className="w-[300px] min-w-[300px] flex flex-col border-r border-border bg-muted/30">
        <div className="p-4 pb-2 border-b border-border/30 flex-shrink-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">模板目录</div>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1.5 focus-within:border-primary focus-within:shadow-[0_0_10px_rgba(59,130,246,0.15)] transition-all">
            <span className="text-xs opacity-40">🔍</span>
            <input ref={searchRef} type="text" placeholder="搜索模板..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/50" />
          </div>
        </div>
        <div className="flex-1 overflow-auto px-0 py-2">
          {top.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">暂无数据</div>
          ) : (
            top.map(n => <TreeNode key={n.id} node={n} depth={0} activeId={active?.id} onSelect={selectModel} onMove={openMove} />)
          )}
        </div>
        <div className="px-4 py-2 border-t border-border/30 text-[11px] text-muted-foreground space-y-1.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
            <span>SQLite 已连接</span>
            <span className="ml-auto">{treeData.length} 模型</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span>Memgraph · bolt://localhost:7687</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8 bg-[radial-gradient(ellipse_at_70%_20%,rgba(59,130,246,0.03)_0%,transparent_60%),radial-gradient(ellipse_at_30%_80%,rgba(124,58,237,0.03)_0%,transparent_60%)]">
        {!active ? (
          <EmptyState onCreateRoot={() => { setActive(null); showCreateChild(null); }} />
        ) : view === "detail" ? (
          <DetailPanel model={active} onUpdate={load} onSelect={selectModel}
            onCreateChild={() => showCreateChild(active.id)}
            onCreateAttr={() => setView("createAttr")}
            onEditModel={() => setView("editModel")}
            onEditAttr={(aid) => { setEditAttrId(aid); setView("editAttr"); }}
            onMove={() => openMove(active)}
            onDelete={() => { reset(); load(); }}
          />
        ) : view === "moveModel" ? (
          <MoveModelForm model={active} allModels={treeData} forbiddenIds={forbiddenIds}
            onDone={async () => { await load(); if (active) await selectModel(active); setView("detail"); }}
            onCancel={() => setView("detail")} />
        ) : view === "createChild" ? (
          <CreateChildForm parentId={active.id} parentName={active.ontol_name}
            onDone={async () => { await load(); if (active) await selectModel(active); setView("detail"); }}
            onCancel={() => setView("detail")} />
        ) : view === "editModel" ? (
          <EditModelForm model={active}
            onDone={async () => { await load(); await selectModel(active); setView("detail"); }}
            onCancel={() => setView("detail")} />
        ) : view === "createAttr" ? (
          <CreateAttrForm modelId={active.id} modelName={active.ontol_name}
            onDone={async () => { await selectModel(active); setView("detail"); }}
            onCancel={() => setView("detail")} />
        ) : view === "editAttr" && editAttrId ? (
          <EditAttrForm modelId={active.id} modelName={active.ontol_name} attrId={editAttrId}
            attrs={active.attributes || []}
            onDone={async () => { await selectModel(active); setView("detail"); }}
            onCancel={() => setView("detail")} />
        ) : null}
      </main>
    </div>
  );
}

// ── 树节点 ─────────────────────────────────────
function TreeNode({ node, depth, activeId, onSelect, onMove }: {
  node: OntolModel; depth: number; activeId?: string; onSelect: (n: OntolModel) => void; onMove: (n: OntolModel) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = (node.children && node.children.length > 0);
  const isActive = activeId === node.id;
  const typeLabel = MODEL_TYPE[node.ontol_model_type] || node.ontol_model_type;
  const attrCount = (node.attributes || []).length;

  return (
    <div>
      <div onClick={() => onSelect(node)}
        className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer text-[13px] transition-all select-none relative group
          ${isActive ? "bg-primary/10 text-foreground border-l-[3px] border-l-primary shadow-[inset_0_0_8px_rgba(59,130,246,0.08)]" : "hover:bg-muted/50 text-foreground border-l-[3px] border-l-transparent"}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}>
        <span onClick={e => { e.stopPropagation(); hasChildren && setExpanded(!expanded); }}
          className={`text-[10px] text-muted-foreground/60 transition-transform w-4 flex-shrink-0 ${hasChildren ? (expanded ? "rotate-90 opacity-90" : "") : "invisible"}`}>▶</span>
        <span className="flex-shrink-0 text-sm">{hasChildren ? "📂" : "📄"}</span>
        <span className="truncate flex-1">{node.ontol_name}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-muted-foreground flex-shrink-0">{typeLabel}</span>
        {attrCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-muted-foreground flex-shrink-0">{attrCount}字段</span>}
        <button onClick={e => { e.stopPropagation(); onMove(node); }}
          className="text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30 text-amber-500/60 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:border-amber-500 hover:text-amber-500 transition-opacity" title="移动到其他父级">↗</button>
      </div>
      {hasChildren && expanded && node.children!.map(c => (
        <TreeNode key={c.id} node={c} depth={depth + 1} activeId={activeId} onSelect={onSelect} onMove={onMove} />
      ))}
    </div>
  );
}

// ── 空状态 ─────────────────────────────────────
function EmptyState({ onCreateRoot }: { onCreateRoot: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full text-center text-muted-foreground">
      <div className="text-6xl mb-6 opacity-35 animate-[float_3s_ease-in-out_infinite]">🗂️</div>
      <h2 className="text-xl font-bold text-foreground mb-2">本体语义管理</h2>
      <p className="max-w-[360px] text-sm leading-relaxed mb-6">选择左侧模板，查看预定义的本体模型 Schema —— 包括节点标签、关系类型、属性和样例数据。</p>
      <div className="w-[200px] h-px bg-border mb-6" />
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1"><kbd className="bg-primary/8 border border-border rounded px-1 py-0.5 text-[11px] text-primary">Ctrl+N</kbd> 新建根模型</span>
        <span className="flex items-center gap-1"><kbd className="bg-primary/8 border border-border rounded px-1 py-0.5 text-[11px] text-primary">↑↓</kbd> 切换模板</span>
        <span className="flex items-center gap-1"><kbd className="bg-primary/8 border border-border rounded px-1 py-0.5 text-[11px] text-primary">Esc</kbd> 清除选择</span>
      </div>
    </div>
  );
}

// ── 移动模型表单 ─────────────────────────────────
function MoveModelForm({ model, allModels, forbiddenIds, onDone, onCancel }: {
  model: OntolModel; allModels: OntolModel[]; forbiddenIds: Set<string>; onDone: () => void; onCancel: () => void;
}) {
  const [targetId, setTargetId] = useState(model.ontol_parent_id || "");
  const [loading, setLoading] = useState(false);
  // 可选的父级：排除自己和所有子孙
  const candidates = allModels.filter(m => !forbiddenIds.has(m.id) && m.delete_flag !== "1");

  async function submit() {
    setLoading(true);
    try {
      await api.put(`${API_BASE}/${encodeURIComponent(model.id)}`, {
        ontol_parent_id: targetId || null, update_id: "admin" });
      onDone();
    } catch(e: any) { alert("移动失败: " + (e.response?.data?.detail || e.message)); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-xs text-muted-foreground mb-1"><a onClick={onCancel} className="cursor-pointer hover:text-primary">← 返回</a></div>
        <h1 className="text-xl font-bold">移动本体</h1>
        <p className="text-sm text-muted-foreground">
          将 <b>{model.ontol_name}</b> ({model.id}) 从 <b>{model.ontol_parent_id || "根节点"}</b> 移动到其他父级下方
        </p>
      </div>
      <div className="max-w-[500px] space-y-3">
        <div>
          <label className="block text-sm mb-1">目标父级（留空 = 根节点）</label>
          <select className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" value={targetId}
            onChange={e => setTargetId(e.target.value)}>
            <option value="">— 根节点 —</option>
            {candidates.map(c => (
              <option key={c.id} value={c.id}>
                {(MODEL_TYPE[c.ontol_model_type]||c.ontol_model_type) + " · " + c.ontol_name + " (" + c.id + ")"}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground mt-1">
            可选 {candidates.length} 个模型（已排除自身和子孙节点）
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Btn accent onClick={submit} disabled={loading}>{loading ? "移动中..." : "确认移动"}</Btn>
          <Btn onClick={onCancel}>取消</Btn>
        </div>
      </div>
    </div>
  );
}

// ── 详情面板 ───────────────────────────────────
function DetailPanel({ model, onUpdate, onSelect, onCreateChild, onCreateAttr, onEditModel, onEditAttr, onMove, onDelete }:
  { model: OntolModel; onUpdate: () => void; onSelect: (m: OntolModel) => void;
    onCreateChild: () => void; onCreateAttr: () => void; onEditModel: () => void;
    onEditAttr: (id: string) => void; onMove: () => void; onDelete: () => void }) {
  const attrs = model.attributes || [];
  const preset = attrs.filter(a => a.attr_is_system === "1");
  const custom = attrs.filter(a => a.attr_is_system !== "1");
  const typeLabel = MODEL_TYPE[model.ontol_model_type] || model.ontol_model_type;

  async function handleDelete() {
    if (!confirm(`确定删除本体 "${model.ontol_name}" 吗？`)) return;
    try { await api.delete(`${API_BASE}/${encodeURIComponent(model.id)}?soft=true`); onDelete(); }
    catch(e: any) { alert("删除失败: " + (e.response?.data?.detail || e.message)); }
  }
  async function handleDeleteAttr(attrId: string, attrName: string) {
    if (!confirm(`删除字段 "${attrName}"？`)) return;
    try { await api.delete(`${API_BASE}/${encodeURIComponent(model.id)}/attrs/${encodeURIComponent(attrId)}`); onSelect(model); }
    catch(e: any) { alert("删除失败: " + (e.response?.data?.detail || e.message)); }
  }
  async function handleMoveAttr(attrId: string, toModelId: string) {
    try {
      await api.put(`${API_BASE}/${encodeURIComponent(model.id)}/attrs/${encodeURIComponent(attrId)}`, { ontol_model_id: toModelId });
      onSelect(model);
    } catch(e: any) { alert("移动失败: " + (e.response?.data?.detail || e.message)); }
  }

  return (
    <div>
      <div className="mb-8 pb-6 border-b border-border">
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <span>本体模型</span> / <span className="text-primary">{typeLabel}</span> / <span>{model.ontol_name}</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{model.ontol_name}</h1>
          <Tag label={typeLabel} />
          <Tag label={model.ontol_model_status === "0" ? "启用中" : "已停用"} color={model.ontol_model_status === "0" ? "green" : "red"} />
        </div>
        <p className="text-sm text-muted-foreground mb-3">{model.ontol_model_desc || "暂无描述"}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Tag label={`本体编码: ${model.ontol_code || model.id}`} />
          {model.ontol_parent_id ? <Tag label={`父级: ${model.ontol_parent_id}`} /> : <Tag label="根节点" color="amber" />}
          <Tag label={`${attrs.length} 个字段`} />
          <Tag label={`创建: ${(model.create_time||"").substring(0,10)}`} />
        </div>
        <div className="flex gap-2 mt-5">
          <Btn accent onClick={onCreateAttr}>＋ 添加字段</Btn>
          <Btn onClick={onEditModel}>✏ 编辑本体</Btn>
          <Btn onClick={onCreateChild}>＋ 新建子本体</Btn>
          <Btn onClick={onMove}>↗ 移动到</Btn>
          <Btn danger onClick={handleDelete}>🗑 删除</Btn>
        </div>
      </div>
      <Section title="预置字段" count={preset.length} dot>
        <AttrTable attrs={preset} readonly onDelete={handleDeleteAttr} onMove={handleMoveAttr} />
      </Section>
      <Section title="自定义字段" count={custom.length} dot>
        <AttrTable attrs={custom} onEdit={onEditAttr} onDelete={handleDeleteAttr} onMove={handleMoveAttr} />
      </Section>
    </div>
  );
}

// ── 字段表格 ───────────────────────────────────
function AttrTable({ attrs, readonly, onEdit, onDelete, onMove }:
  { attrs: OntolAttr[]; readonly?: boolean; onEdit?: (id: string) => void;
    onDelete: (id: string, name: string) => void; onMove: (id: string, to: string) => void }) {
  if (attrs.length === 0) return <p className="text-sm text-muted-foreground">无</p>;
  return (
    <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-muted/50">
          <th className="p-2.5 text-left text-xs font-medium">编码</th><th className="p-2.5 text-left text-xs font-medium">名称</th>
          <th className="p-2.5 text-left text-xs font-medium">类型</th><th className="p-2.5 text-left text-xs font-medium">长度</th>
          <th className="p-2.5 text-left text-xs font-medium">必填</th><th className="p-2.5 text-left text-xs font-medium">唯一</th>
          <th className="p-2.5 text-left text-xs font-medium">默认值</th><th className="p-2.5 text-left text-xs font-medium">操作</th>
        </tr>
      </thead>
      <tbody>
        {attrs.map(a => (
          <tr key={a.id} className="border-t border-border hover:bg-muted/30">
            <td className="p-2.5"><code className="text-xs">{a.attr_code}</code></td>
            <td className="p-2.5">{a.attr_name}</td>
            <td className="p-2.5">{DATA_TYPE[a.attr_data_type] || a.attr_data_type}</td>
            <td className="p-2.5">{a.attr_length || "—"}</td>
            <td className="p-2.5">{a.attr_required === "1" ? "是" : "否"}</td>
            <td className="p-2.5">{a.attr_is_only === "1" ? "是" : "—"}</td>
            <td className="p-2.5 max-w-[160px] truncate" title={a.attr_default_value || ""}>{a.attr_default_value || "—"}</td>
            <td className="p-2.5">
              {readonly ? (
                <span className="text-[10px] text-muted-foreground opacity-50">🔒 系统预设</span>
              ) : (
                <div className="flex gap-1">
                  <button onClick={() => onEdit?.(a.id)} className="text-[11px] px-1.5 py-0.5 border border-border rounded hover:bg-muted" title="编辑">✏</button>
                  <button onClick={() => { const tid = prompt("目标模型ID:"); if (tid) onMove(a.id, tid); }}
                    className="text-[11px] px-1.5 py-0.5 border border-amber-500/30 text-amber-500/60 rounded hover:border-amber-500 hover:text-amber-500" title="移动到其他本体">📦</button>
                  <button onClick={() => onDelete(a.id, a.attr_name)}
                    className="text-[11px] px-1.5 py-0.5 border border-red-500/30 text-red-500/60 rounded hover:border-red-500 hover:text-red-500" title="删除">✕</button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── 创建子模型表单 ──────────────────────────────
function CreateChildForm({ parentId, parentName, onDone, onCancel }:
  { parentId: string | null; parentName?: string; onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ code:"", name:"", type:"M1", desc:"", status:"0" });
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.code || !form.name) { alert("请填写编码和名称"); return; }
    setLoading(true);
    try {
      await api.post(API_BASE, { ontol_code: form.code, ontol_name: form.name, ontol_model_type: form.type,
        ontol_parent_id: parentId || null, ontol_model_status: form.status, ontol_model_desc: form.desc || null, create_id: "admin" });
      onDone();
    } catch(e: any) { alert("创建失败: " + (e.response?.data?.detail || e.message)); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="mb-6"><div className="text-xs text-muted-foreground mb-1"><a onClick={onCancel} className="cursor-pointer hover:text-primary">← 返回</a></div>
        <h1 className="text-xl font-bold">新建子本体</h1>
        <p className="text-sm text-muted-foreground">在 <b>{parentName || "根节点"}</b> 下创建新的本体模型</p>
      </div>
      <div className="max-w-[500px] space-y-3">
        <Field label="本体编码 *" value={form.code} onChange={v => setForm({...form, code: v})} placeholder="唯一编码" />
        <Field label="名称 *" value={form.name} onChange={v => setForm({...form, name: v})} placeholder="本体名称" />
        <label className="block text-sm">类型 *</label>
        <select className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" value={form.type}
          onChange={e => setForm({...form, type: e.target.value})}>
          {Object.entries(MODEL_TYPE).map(([k,v]) => <option key={k} value={k}>{k} — {v}</option>)}
        </select>
        <Field label="描述" value={form.desc} onChange={v => setForm({...form, desc: v})} placeholder="本体描述" />
        <label className="block text-sm">状态</label>
        <select className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" value={form.status}
          onChange={e => setForm({...form, status: e.target.value})}>
          <option value="0">启用中</option><option value="1">已停用</option>
        </select>
        <div className="flex gap-2 pt-2">
          <Btn accent onClick={submit} disabled={loading}>{loading ? "创建中..." : "创建"}</Btn>
          <Btn onClick={onCancel}>取消</Btn>
        </div>
      </div>
    </div>
  );
}

// ── 编辑模型表单 ────────────────────────────────
function EditModelForm({ model, onDone, onCancel }:
  { model: OntolModel; onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    code: model.ontol_code || "", name: model.ontol_name || "", type: model.ontol_model_type,
    parent: model.ontol_parent_id || "", desc: model.ontol_model_desc || "", status: model.ontol_model_status });
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await api.put(`${API_BASE}/${encodeURIComponent(model.id)}`, {
        ontol_code: form.code, ontol_name: form.name, ontol_model_type: form.type,
        ontol_parent_id: form.parent || null, ontol_model_desc: form.desc || null,
        ontol_model_status: form.status, update_id: "admin" });
      onDone();
    } catch(e: any) { alert("保存失败: " + (e.response?.data?.detail || e.message)); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="mb-6"><div className="text-xs text-muted-foreground mb-1"><a onClick={onCancel} className="cursor-pointer hover:text-primary">← 返回</a></div>
        <h1 className="text-xl font-bold">编辑本体</h1>
      </div>
      <div className="max-w-[500px] space-y-3">
        <Field label="本体编码 *" value={form.code} onChange={v => setForm({...form, code: v})} />
        <Field label="名称" value={form.name} onChange={v => setForm({...form, name: v})} />
        <label className="block text-sm">类型</label>
        <select className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" value={form.type}
          onChange={e => setForm({...form, type: e.target.value})}>
          {Object.entries(MODEL_TYPE).map(([k,v]) => <option key={k} value={k}>{k} — {v}</option>)}
        </select>
        <Field label="父级ID" value={form.parent} onChange={v => setForm({...form, parent: v})} placeholder="留空=根节点" />
        <Field label="描述" value={form.desc} onChange={v => setForm({...form, desc: v})} />
        <label className="block text-sm">状态</label>
        <select className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" value={form.status}
          onChange={e => setForm({...form, status: e.target.value})}>
          <option value="0">启用中</option><option value="1">已停用</option>
        </select>
        <div className="flex gap-2 pt-2">
          <Btn accent onClick={submit} disabled={loading}>{loading ? "保存中..." : "保存"}</Btn>
          <Btn onClick={onCancel}>取消</Btn>
        </div>
      </div>
    </div>
  );
}

// ── 创建字段表单 ────────────────────────────────
function CreateAttrForm({ modelId, modelName, onDone, onCancel }:
  { modelId: string; modelName: string; onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ code:"", name:"", dtype:"0", len:"", digit:"", req:"0", uniq:"0", defval:"", desc:"" });
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!form.code || !form.name) { alert("请填写字段编码和名称"); return; }
    setLoading(true);
    try {
      await api.post(`${API_BASE}/${encodeURIComponent(modelId)}/attrs`, {
        attr_code: form.code, attr_name: form.name, attr_data_type: form.dtype,
        attr_length: form.len || null, attr_digit: form.digit || null,
        attr_required: form.req, attr_is_only: form.uniq,
        attr_default_value: form.defval || null, attr_desc: form.desc || null,
        attr_is_system: "0", create_id: "admin" });
      onDone();
    } catch(e: any) { alert("创建失败: " + (e.response?.data?.detail || e.message)); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="mb-6"><div className="text-xs text-muted-foreground mb-1"><a onClick={onCancel} className="cursor-pointer hover:text-primary">← 返回</a></div>
        <h1 className="text-xl font-bold">添加字段</h1>
        <p className="text-sm text-muted-foreground">为 <b>{modelName}</b> 添加自定义属性字段</p>
      </div>
      <div className="max-w-[500px] space-y-3">
        <Field label="字段编码 *" value={form.code} onChange={v => setForm({...form, code: v})} placeholder="如 range_km" />
        <Field label="字段名称 *" value={form.name} onChange={v => setForm({...form, name: v})} placeholder="如 作战半径" />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm">数据类型</label>
            <select className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background" value={form.dtype}
              onChange={e => setForm({...form, dtype: e.target.value})}>
              <option value="0">字符串</option><option value="1">数字</option><option value="2">浮点数</option>
            </select>
          </div>
          <div><label className="block text-sm">长度</label><input className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background" value={form.len} onChange={e => setForm({...form, len: e.target.value})} placeholder="如 100" /></div>
          <div><label className="block text-sm">小数位</label><input className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background" value={form.digit} onChange={e => setForm({...form, digit: e.target.value})} placeholder="如 2" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">是否必填</label>
            <select className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background" value={form.req}
              onChange={e => setForm({...form, req: e.target.value})}><option value="0">否</option><option value="1">是</option></select>
          </div>
          <div>
            <label className="block text-sm">是否唯一</label>
            <select className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background" value={form.uniq}
              onChange={e => setForm({...form, uniq: e.target.value})}><option value="0">否</option><option value="1">是</option></select>
          </div>
        </div>
        <Field label="默认值" value={form.defval} onChange={v => setForm({...form, defval: v})} placeholder="默认值" />
        <Field label="字段描述" value={form.desc} onChange={v => setForm({...form, desc: v})} placeholder="字段用途说明" />
        <div className="flex gap-2 pt-2">
          <Btn accent onClick={submit} disabled={loading}>{loading ? "创建中..." : "创建"}</Btn>
          <Btn onClick={onCancel}>取消</Btn>
        </div>
      </div>
    </div>
  );
}

// ── 编辑字段表单 ────────────────────────────────
function EditAttrForm({ modelId, modelName, attrId, attrs, onDone, onCancel }:
  { modelId: string; modelName: string; attrId: string; attrs: OntolAttr[]; onDone: () => void; onCancel: () => void }) {
  const a = attrs.find(x => x.id === attrId);
  const [form, setForm] = useState({
    name: a?.attr_name || "", code: a?.attr_code || "", dtype: a?.attr_data_type || "0",
    len: a?.attr_length || "", digit: a?.attr_digit || "", req: a?.attr_required || "0",
    uniq: a?.attr_is_only || "0", defval: a?.attr_default_value || "", desc: a?.attr_desc || "",
    isSystem: a?.attr_is_system || "0", modelId: a?.ontol_model_id || modelId });
  const [loading, setLoading] = useState(false);

  if (!a) {
    return <div className="p-8 text-center text-muted-foreground"><p>未找到该字段</p><Btn onClick={onCancel}>← 返回</Btn></div>;
  }

  async function submit() {
    setLoading(true);
    try {
      await api.put(`${API_BASE}/${encodeURIComponent(modelId)}/attrs/${encodeURIComponent(attrId)}`, {
        attr_name: form.name, attr_code: form.code, attr_data_type: form.dtype,
        attr_length: form.len || null, attr_digit: form.digit || null,
        attr_required: form.req, attr_is_only: form.uniq,
        attr_default_value: form.defval || null, attr_desc: form.desc || null,
        attr_is_system: form.isSystem });
      onDone();
    } catch(e: any) { alert("保存失败: " + (e.response?.data?.detail || e.message)); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-xs text-muted-foreground mb-1"><a onClick={onCancel} className="cursor-pointer hover:text-primary">← 返回模型</a> / <span>编辑字段</span> / <span>{a.attr_name}</span></div>
        <h1 className="text-xl font-bold">编辑字段</h1>
        <p className="text-sm text-muted-foreground">所属模型: <b>{modelName}</b></p>
      </div>
      <div className="max-w-[500px] space-y-3">
        <Field label="字段名称" value={form.name} onChange={v => setForm({...form, name: v})} />
        <Field label="字段编码" value={form.code} onChange={v => setForm({...form, code: v})} />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm">数据类型</label>
            <select className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background" value={form.dtype}
              onChange={e => setForm({...form, dtype: e.target.value})}>
              <option value="0">字符串</option><option value="1">数字</option><option value="2">浮点数</option>
            </select>
          </div>
          <div><label className="block text-sm">长度</label><input className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background" value={form.len} onChange={e => setForm({...form, len: e.target.value})} /></div>
          <div><label className="block text-sm">小数位</label><input className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background" value={form.digit} onChange={e => setForm({...form, digit: e.target.value})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">是否必填</label>
            <select className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background" value={form.req}
              onChange={e => setForm({...form, req: e.target.value})}><option value="0">否</option><option value="1">是</option></select>
          </div>
          <div>
            <label className="block text-sm">是否唯一</label>
            <select className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background" value={form.uniq}
              onChange={e => setForm({...form, uniq: e.target.value})}><option value="0">否</option><option value="1">是</option></select>
          </div>
        </div>
        <Field label="默认值" value={form.defval} onChange={v => setForm({...form, defval: v})} />
        <Field label="字段描述" value={form.desc} onChange={v => setForm({...form, desc: v})} />
        <label className="block text-sm">预置标识</label>
        <select className="w-full border border-border rounded-md px-2 py-2 text-sm bg-background" value={form.isSystem}
          onChange={e => setForm({...form, isSystem: e.target.value})}>
          <option value="0">自定义字段</option><option value="1">系统预设</option>
        </select>
        <div className="flex gap-2 pt-2">
          <Btn accent onClick={submit} disabled={loading}>{loading ? "保存中..." : "保存"}</Btn>
          <Btn onClick={onCancel}>取消</Btn>
        </div>
      </div>
    </div>
  );
}

// ── 原子组件 ────────────────────────────────────
function Tag({ label, color }: { label: string; color?: string }) {
  const cls = color === "green" ? "border-green-500/30 text-green-500"
    : color === "red" ? "border-red-500/30 text-red-500"
    : color === "amber" ? "border-amber-500/30 text-amber-500"
    : "border-border text-muted-foreground";
  return <span className={`px-2 py-1 rounded text-[11px] border bg-muted/30 ${cls}`}>{label}</span>;
}
function Section({ title, count, dot, children }: { title: string; count: number; dot?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
        {dot && <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
        {title} ({count})
      </h3>
      {children}
    </div>
  );
}
function Btn({ accent, danger, onClick, children, disabled }: {
  accent?: boolean; danger?: boolean; onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  const cls = accent ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
    : danger ? "border-red-500/50 text-red-500 hover:bg-red-500/10"
    : "border-border hover:bg-muted";
  return (
    <button disabled={disabled} onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm border transition-all disabled:opacity-50 ${cls}`}>{children}</button>
  );
}
function Field({ label, value, onChange, placeholder }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      {label && <label className="block text-sm mb-0.5">{label}</label>}
      <input className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background" value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
