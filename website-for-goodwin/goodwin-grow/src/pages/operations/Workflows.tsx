import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Panel,
  EdgeLabelRenderer,
  BaseEdge,
  getBezierPath,
  useReactFlow,
  ReactFlowProvider,
  Handle,
  Position,
} from '@xyflow/react';
import type {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  EdgeProps,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, FolderGit2, Save, X } from 'lucide-react';
import { useOperationsStore } from '../../lib/operationsStore';

// ──────────────────────────────────────────────
// Custom Node with delete button on hover
// ──────────────────────────────────────────────
const nodeColors = [
  { border: '#00a631', bg: '#f0fdf4' },
  { border: '#cde06c', bg: '#f9ffe5' },
  { border: '#3b82f6', bg: '#eff6ff' },
  { border: '#f59e0b', bg: '#fffbeb' },
  { border: '#ec4899', bg: '#fdf2f8' },
  { border: '#8b5cf6', bg: '#f5f3ff' },
];

function WorkflowNode({ id, data }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label as string);
  const { setNodes } = useReactFlow();
  const colorIdx = (data.colorIdx as number) ?? 0;
  const color = nodeColors[colorIdx % nodeColors.length];

  const deleteNode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setNodes((nds) => nds.filter((n) => n.id !== id));
    },
    [id, setNodes]
  );

  const commitLabel = () => {
    setEditing(false);
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n))
    );
  };

  const handleStyle = {
    background: color.border,
    border: `2px solid #fff`,
    width: 10,
    height: 10,
    borderRadius: '50%',
    opacity: hovered ? 1 : 0,
    transition: 'opacity 0.2s',
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: '10px',
        padding: '10px 18px',
        minWidth: '130px',
        position: 'relative',
        cursor: 'default',
        boxShadow: hovered ? `0 4px 16px ${color.border}44` : '0 1px 4px #0001',
        transition: 'box-shadow 0.2s',
        userSelect: 'none',
      }}
    >
      {/* ReactFlow connection handles */}
      <Handle type="target" position={Position.Top} style={handleStyle} />
      <Handle type="source" position={Position.Bottom} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />
      <Handle type="target" position={Position.Left} style={handleStyle} />

      {/* Delete button */}
      {hovered && !editing && (
        <button
          onClick={deleteNode}
          style={{
            position: 'absolute',
            top: -10,
            right: -10,
            background: '#ef4444',
            border: 'none',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: '#fff',
            boxShadow: '0 2px 6px #ef444466',
          }}
          title="Delete node"
        >
          <X size={12} />
        </button>
      )}

      {/* Label or input */}
      {editing ? (
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={(e) => e.key === 'Enter' && commitLabel()}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: 13,
            color: '#3a3b39',
            width: '100%',
          }}
        />
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          style={{ fontWeight: 700, fontSize: 13, color: '#3a3b39', display: 'block' }}
          title="Double-click to rename"
        >
          {data.label as string}
        </span>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Custom Edge with delete button on hover
// ──────────────────────────────────────────────
function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const deleteEdge = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEdges((eds) => eds.filter((ed) => ed.id !== id));
    },
    [id, setEdges]
  );

  return (
    <>
      {/* Invisible wide stroke for easy hover */}
      <path
        d={edgePath}
        strokeWidth={20}
        fill="none"
        stroke="transparent"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: hovered ? 2.5 : 1.8,
          stroke: hovered ? '#ef4444' : '#00a631',
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />
      <EdgeLabelRenderer>
        {hovered && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
            className="nodrag nopan"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <button
              onClick={deleteEdge}
              style={{
                background: '#ef4444',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                boxShadow: '0 2px 8px #ef444466',
              }}
              title="Delete connection"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { workflowNode: WorkflowNode };
const edgeTypes = { deletable: DeletableEdge };

// ──────────────────────────────────────────────
// Per-project canvas
// ──────────────────────────────────────────────
interface CanvasProps {
  projectId: string;
  initialNodes: Node[];
  initialEdges: Edge[];
  onSave: (nodes: Node[], edges: Edge[]) => void;
}

function WorkflowCanvas({ projectId, initialNodes, initialEdges, onSave }: CanvasProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [nodeName, setNodeName] = useState('New Phase');
  const colorCounterRef = useRef(0);

  // Reset when project changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [projectId]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, type: 'deletable', animated: true }, eds)
      ),
    []
  );

  const addNode = () => {
    const colorIdx = colorCounterRef.current++ % nodeColors.length;
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'workflowNode',
      position: { x: 100 + Math.random() * 300, y: 80 + Math.random() * 250 },
      data: { label: nodeName || 'New Phase', colorIdx },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div style={{ height: 'calc(100vh - 240px)', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode="Delete"
        connectionLineStyle={{ stroke: '#00a631', strokeWidth: 2, strokeDasharray: '6 4' }}
        connectionLineType={"bezier" as any}
        fitView
      >
        <Controls />
        <Background color="#e3e2df" gap={16} />
        <Panel position="top-right">
          <div className="flex items-center gap-2 bg-canvas-surface border border-canvas-variant rounded-lg shadow-md p-2">
            <Input
              placeholder="Phase name..."
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              className="h-8 text-sm w-36"
              onKeyDown={(e) => e.key === 'Enter' && addNode()}
            />
            <Button size="sm" onClick={addNode} className="h-8">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8"
              onClick={() => onSave(nodes, edges)}
            >
              <Save className="h-3.5 w-3.5 mr-1" /> Save
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Workflows page
// ──────────────────────────────────────────────
export const Workflows = () => {
  const projects = useOperationsStore((state: any) => state.projects);
  const workflows = useOperationsStore((state: any) => state.workflows);
  const updateWorkflow = useOperationsStore((state: any) => state.updateWorkflow);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = projects?.find((p: any) => p.id === selectedProjectId);
  const workflow = workflows?.find((w: any) => w.projectId === selectedProjectId);

  // Parse saved nodes/edges for the selected project
  const savedNodes: Node[] = workflow?.nodes
    ? typeof workflow.nodes === 'string'
      ? JSON.parse(workflow.nodes)
      : workflow.nodes
    : [];

  const savedEdges: Edge[] = workflow?.edges
    ? typeof workflow.edges === 'string'
      ? JSON.parse(workflow.edges)
      : workflow.edges
    : [];

  // Ensure existing nodes use our custom type
  const parsedNodes: Node[] = savedNodes.map((n: any) => ({
    ...n,
    type: 'workflowNode',
    data: { label: n.data?.label ?? 'Phase', colorIdx: n.data?.colorIdx ?? 0 },
  }));

  const parsedEdges: Edge[] = savedEdges.map((e: any) => ({
    ...e,
    type: 'deletable',
    animated: true,
  }));

  const handleSave = async (nodes: Node[], edges: Edge[]) => {
    if (!selectedProjectId) return;
    await updateWorkflow(selectedProjectId, nodes, edges);
    alert('Workflow saved!');
  };

  return (
    <div className="flex gap-4 h-full" style={{ minHeight: 'calc(100vh - 180px)' }}>
      {/* ── LEFT: Project list ── */}
      <div className="w-56 flex-shrink-0 bg-canvas-surface border border-canvas-variant rounded-xl shadow-sm overflow-y-auto">
        <div className="p-4 border-b border-canvas-variant">
          <h3 className="font-semibold text-secondary-dark text-sm tracking-wide uppercase">
            Projects
          </h3>
        </div>
        <div className="p-2 space-y-1">
          {(!projects || projects.length === 0) && (
            <p className="text-xs text-secondary-light p-2">
              No projects yet. Add projects first.
            </p>
          )}
          {projects?.map((project: any) => (
            <button
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-2 ${
                selectedProjectId === project.id
                  ? 'bg-primary/10 text-primary font-semibold border border-primary/30'
                  : 'text-secondary-dark hover:bg-canvas-variant'
              }`}
            >
              <FolderGit2 className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
              <div className="min-w-0">
                <div className="font-medium truncate">{project.projectName}</div>
                <div className="text-xs opacity-60 truncate">{project.companyName}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Canvas ── */}
      <div className="flex-1 min-w-0 bg-canvas-surface border border-canvas-variant rounded-xl shadow-sm overflow-hidden">
        {selectedProject ? (
          <div className="flex flex-col h-full">
            <div className="px-5 py-3 border-b border-canvas-variant flex items-center gap-3">
              <FolderGit2 className="h-4 w-4 text-primary" />
              <div>
                <h2 className="font-semibold text-secondary-dark text-sm leading-tight">
                  {selectedProject.projectName}
                </h2>
                <p className="text-xs text-secondary-light">{selectedProject.companyName}</p>
              </div>
              <span className="ml-auto text-xs text-secondary-light bg-canvas-variant px-2 py-1 rounded-full">
                Drag handles to connect • Double-click node to rename • Hover edge to delete
              </span>
            </div>
            <div className="flex-1">
              <ReactFlowProvider>
                <WorkflowCanvas
                  key={selectedProjectId!}
                  projectId={selectedProjectId!}
                  initialNodes={parsedNodes}
                  initialEdges={parsedEdges}
                  onSave={handleSave}
                />
              </ReactFlowProvider>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <FolderGit2 className="h-14 w-14 text-secondary-light/40 mb-4" />
            <h3 className="font-semibold text-secondary-dark text-lg mb-1">
              Select a Project
            </h3>
            <p className="text-secondary-light text-sm max-w-xs">
              Choose a project from the left panel to view or build its workflow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
