import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Bot, ExternalLink } from 'lucide-react';

const mockAITools = [
  { id: 1, name: 'ChatGPT Enterprise', category: 'LLM', usedFor: 'Content, Coding', cost: 1200, sub: 'Annual', email: 'ai@goodwin.com', renewal: '2027-01-15', notes: 'API access enabled' },
  { id: 2, name: 'Midjourney', category: 'Image Generation', usedFor: 'Marketing Creatives', cost: 60, sub: 'Monthly', email: 'design@goodwin.com', renewal: '2026-10-01', notes: 'Pro plan' },
  { id: 3, name: 'GitHub Copilot', category: 'Coding', usedFor: 'Dev Team', cost: 190, sub: 'Annual', email: 'dev@goodwin.com', renewal: '2027-03-20', notes: '10 seats' },
];

export const AITools = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-tertiary/20 rounded-lg">
          <Bot className="h-8 w-8 text-tertiary-dark" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display text-secondary-dark tracking-tight">AI Slop</h1>
          <p className="text-secondary-light">Manage AI subscriptions, tools, and usage logs.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary-light" />
          </div>
          <Input 
            type="text" 
            placeholder="Search AI tools..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="w-full sm:w-auto bg-tertiary text-secondary-dark hover:bg-tertiary-dark hover:text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Tool
        </Button>
      </div>

      <div className="bg-canvas-surface rounded-lg border border-canvas-variant shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Used For</TableHead>
              <TableHead className="text-right">Monthly Cost</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Login Email</TableHead>
              <TableHead>Renewal Date</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAITools.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell className="font-medium text-secondary-dark flex items-center">
                  {tool.name}
                  <ExternalLink className="h-3 w-3 ml-2 text-secondary-light hover:text-primary cursor-pointer" />
                </TableCell>
                <TableCell>
                  <Badge variant="ai">{tool.category}</Badge>
                </TableCell>
                <TableCell className="text-xs text-secondary-light">{tool.usedFor}</TableCell>
                <TableCell className="text-right font-medium">${tool.cost}</TableCell>
                <TableCell>{tool.sub}</TableCell>
                <TableCell className="text-xs">{tool.email}</TableCell>
                <TableCell>{tool.renewal}</TableCell>
                <TableCell className="text-xs text-secondary-light max-w-[150px] truncate" title={tool.notes}>
                  {tool.notes}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
