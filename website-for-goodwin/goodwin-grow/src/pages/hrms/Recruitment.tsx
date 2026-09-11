import React, { useState } from 'react';
import { Search, Filter, Plus, FileText, Briefcase, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useStore } from '../../lib/store';

export const Recruitment = () => {
  const recruits = useStore(state => state.recruits);
  const moveToOnboarding = useStore(state => state.moveToOnboarding);
  const addRecruit = useStore(state => state.addRecruit);
  const updateRecruit = useStore(state => state.updateRecruit);
  const deleteRecruit = useStore(state => state.deleteRecruit);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [cvLink, setCvLink] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [status, setStatus] = useState('Screening');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateRecruit(editingId, { name, role, cvLink, portfolioLink, status });
      } else {
        await addRecruit({ name, role, cvLink, portfolioLink, status, checklist: [] });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setName('');
      setRole('');
      setCvLink('');
      setPortfolioLink('');
      setStatus('Screening');
    } catch (err: any) {
      alert('Failed to save candidate: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (candidate: any) => {
    setEditingId(candidate.id);
    setName(candidate.name);
    setRole(candidate.role);
    setCvLink(candidate.cvLink || '');
    setPortfolioLink(candidate.portfolioLink || '');
    setStatus(candidate.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await deleteRecruit(id);
    } catch (err: any) {
      alert('Failed to delete candidate: ' + err.message);
    }
  };

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
        <Button onClick={() => {
          setEditingId(null);
          setName('');
          setRole('');
          setCvLink('');
          setPortfolioLink('');
          setStatus('Screening');
          setIsModalOpen(true);
        }}>
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
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-secondary-light hover:text-primary" onClick={() => handleEdit(candidate)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-secondary-light hover:text-danger" onClick={() => handleDelete(candidate.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Badge variant={getStatusBadge(candidate.status) as any}>{candidate.status}</Badge>
                </div>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Candidate" : "Add Candidate"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Role</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} required placeholder="e.g. Frontend Developer" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">CV Link</label>
              <Input value={cvLink} onChange={(e) => setCvLink(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-dark mb-1">Portfolio Link</label>
              <Input value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-dark mb-1">Status</label>
            <Select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'Screening', label: 'Screening' },
                { value: 'Interviewing', label: 'Interviewing' },
                { value: 'Offered', label: 'Offered' }
              ]}
              required
            />
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Candidate'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
