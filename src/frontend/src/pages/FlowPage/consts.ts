import { DefaultEdge } from "@/CustomEdges";
import GenericNode from "@/CustomNodes/GenericNode";
import MemgraphNode from "@/CustomNodes/MemgraphNode";
import NoteNode from "@/CustomNodes/NoteNode";

/**
 * Shared ReactFlow node/edge type registrations used by the main canvas
 * (PageComponent).
 *
 * 注册新节点只需在此对象中添加一行。
 */
export const nodeTypes = {
  genericNode: GenericNode,
  noteNode: NoteNode,
  MemgraphCypher: MemgraphNode,
};

export const edgeTypes = {
  default: DefaultEdge,
};
