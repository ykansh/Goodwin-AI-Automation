import React, { useState } from 'react';
import { Search, Filter, CheckCircle, Circle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useStore, type Candidate } from '../../lib/store';

export const Onboarding = () => {
  const onboardings = useStore(state => state.onboardings);
  const toggleChecklistTask = useStore(state => state.toggleChecklistTask);
  const completeOnboarding = useStore(state => state.completeOnboarding);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOnboardings = onboardings.filter(r => 
    r.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || 
    r.role?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const getProgress = (candidate: Candidate) => {
    if (!candidate.checklist || candidate.checklist.length === 0) return 0;
    const completed = candidate.checklist.filter(t => t.completed).length;
    return Math.round((completed / candidate.checklist.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Onboarding</h1>
          <p className="text-secondary-light text-sm mt-1">Track the setup and integration of new hires.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-light" />
            </div>
            <Input 
              type="text" 
              placeholder="Search new hires..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="px-3">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {filteredOnboardings.length === 0 ? (
        <div className="text-center py-12 bg-canvas-surface border border-canvas-variant rounded-lg">
          <p className="text-secondary-light">No new hires are currently being onboarded.</p>
          <p className="text-sm text-secondary-light/70 mt-2">Move candidates here from the Recruitment page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOnboardings.map((candidate) => {
            const progress = getProgress(candidate);
            
            return (
              <div key={candidate.id} className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary-dark font-bold text-lg">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-dark text-lg">{candidate.name}</h3>
                      <p className="text-sm text-secondary-light">{candidate.role}</p>
                    </div>
                  </div>
                  <Badge variant="success">{progress}%</Badge>
                </div>

                <div className="w-full bg-canvas-variant rounded-full h-1.5 mb-6">
                  <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="space-y-3 flex-1">
                  <h4 className="text-sm font-medium text-secondary-dark border-b border-canvas-variant pb-2">Onboarding Checklist</h4>
                  <ul className="space-y-2 mt-2">
                    {candidate.checklist?.map(task => (
                      <li 
                        key={task.id} 
                        className="flex items-center space-x-3 cursor-pointer group"
                        onClick={() => toggleChecklistTask(candidate.id, task.id)}
                      >
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-secondary-light group-hover:text-primary transition-colors flex-shrink-0" />
                        )}
                        <span className={`text-sm transition-colors ${task.completed ? 'text-secondary-light line-through' : 'text-secondary-dark'}`}>
                          {task.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {progress === 100 && (
                    <div className="mt-4 border-t border-canvas-variant pt-4">
                      <Button 
                        className="w-full justify-center"
                        onClick={() => completeOnboarding(candidate.id, {})}
                      >
                        Complete Onboarding
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
