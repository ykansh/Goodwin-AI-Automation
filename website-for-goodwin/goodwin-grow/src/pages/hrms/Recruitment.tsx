import React, { useState } from 'react';
import { Search, Filter, Plus, FileText, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../lib/store';

export const Recruitment = () => {
  const recruits = useStore(state => state.recruits);
  const moveToOnboarding = useStore(state => state.moveToOnboarding);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecruits = recruits.filter(r => 
    r.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || 
    r.role?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Offered': return 'success';
      case 'Interviewing': return 'warning';
      case 'Screening': return 'ai';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Recruitment Pipeline</h1>
          <p className="text-secondary-light text-sm mt-1">Manage active candidates and move them to onboarding.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-canvas-surface p-4 rounded-lg border border-canvas-variant shadow-sm">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-light" />
            </div>
            <Input 
              type="text" 
              placeholder="Search candidates..." 
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

      {filteredRecruits.length === 0 ? (
        <div className="text-center py-12 bg-canvas-surface border border-canvas-variant rounded-lg">
          <p className="text-secondary-light">No candidates found in the recruitment pipeline.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRecruits.map((candidate) => (
            <div key={candidate.id} className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm hover:shadow-md transition-shadow flex flex-col">
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
                <Badge variant={getStatusBadge(candidate.status) as any}>{candidate.status}</Badge>
              </div>

              <div className="space-y-3 flex-1">
                <div className="text-sm font-medium text-secondary-dark">Documents</div>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm" className="flex-1 text-xs justify-center" onClick={() => alert('View CV')}>
                    <FileText className="w-3 h-3 mr-2" />
                    View CV
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1 text-xs justify-center" onClick={() => alert('View Portfolio')}>
                    <Briefcase className="w-3 h-3 mr-2" />
                    Portfolio
                  </Button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-canvas-variant">
                <Button 
                  className="w-full justify-center group" 
                  onClick={() => moveToOnboarding(candidate.id)}
                >
                  Move to Onboarding
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
