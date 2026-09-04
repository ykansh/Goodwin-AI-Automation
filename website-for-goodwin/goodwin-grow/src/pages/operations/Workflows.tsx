import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Panel
} from '@xyflow/react';
import type {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 250, y: 50 },
    data: { label: 'Client Onboarding' },
    style: { 
      background: '#ffffff', 
      border: '1px solid #00a631', 
      borderRadius: '8px', 
      padding: '10px 20px',
      color: '#3a3b39',
      fontWeight: '600'
    },
  },
  {
    id: '2',
    position: { x: 100, y: 200 },
    data: { label: 'Collect Assets' },
    style: { 
      background: '#ffffff', 
      border: '1px solid #cde06c', 
      borderRadius: '8px', 
      padding: '10px 20px',
      color: '#3a3b39',
      fontWeight: '600'
    },
  },
  {
    id: '3',
    position: { x: 400, y: 200 },
    data: { label: 'Setup Accounts' },
    style: { 
      background: '#ffffff', 
      border: '1px solid #e3e2df', 
      borderRadius: '8px', 
      padding: '10px 20px',
      color: '#3a3b39',
      fontWeight: '600'
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00a631' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#00a631' } },
];

export const Workflows = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#00a631' } }, eds)),
    []
  );

  const addNode = () => {
    const newNode: Node = {
      id: (nodes.length + 1).toString(),
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: { label: 'New Phase' },
      style: { 
        background: '#ffffff', 
        border: '1px solid #3a3b39', 
        borderRadius: '8px', 
        padding: '10px 20px',
        color: '#3a3b39',
        fontWeight: '600'
      },
    };
    setNodes([...nodes, newNode]);
  };

  return (
    <div className="h-[calc(100vh-200px)] w-full border border-canvas-variant rounded-lg bg-canvas-surface shadow-sm overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <Background color="#e3e2df" gap={16} />
        <Panel position="top-right">
          <Button onClick={addNode} className="shadow-md">
            <Plus className="h-4 w-4 mr-2" /> Add Node
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};
