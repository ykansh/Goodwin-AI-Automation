import React, { useState } from 'react';
import { useMarketingStore } from '../../lib/marketingStore';

import { Search, Filter, Plus, Hash, Share2, Image as ImageIcon, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';

interface Post {
  id: string;
  platform: string;
  content: string;
  date: string;
  time: string;
  status: string;
}

export const SocialMedia = () => {
  const posts = useMarketingStore((state: any) => state.socialPosts);
  const setSocialPosts = useMarketingStore((state: any) => state.setSocialPosts);
  const addPost = useMarketingStore((state: any) => state.addPost);
  const updatePost = useMarketingStore((state: any) => state.updatePost);
  const deletePost = useMarketingStore((state: any) => state.deletePost);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Post | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    platform: 'Twitter',
    content: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00 PM',
    status: 'Draft'
  });

  const handleOpenModal = (item?: Post) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        id: '',
        platform: 'Twitter',
        content: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00 PM',
        status: 'Draft'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingItem) {
      await updatePost(formData.id, formData);
    } else {
      await addPost(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePost(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published': return 'success';
      case 'Scheduled': return 'ai';
      case 'Draft': return 'warning';
      default: return 'default';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Twitter': return <Hash className="h-5 w-5 text-blue-400" />;
      case 'LinkedIn': return <Share2 className="h-5 w-5 text-blue-600" />;
      case 'Instagram': return <ImageIcon className="h-5 w-5 text-pink-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-secondary-dark tracking-tight">Social Media Scheduler</h1>
          <p className="text-secondary-light text-sm mt-1">Plan, schedule, and track your social media content.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
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
              placeholder="Search posts..." 
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {posts.filter((p: any) => p.content?.toLowerCase()?.includes(searchTerm.toLowerCase())).map((post: any) => (
          <div key={post.id} className="bg-canvas-surface p-6 rounded-xl border border-canvas-variant shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-canvas-variant rounded-full">
                  {getPlatformIcon(post.platform)}
                </div>
                <span className="font-medium text-secondary-dark">{post.platform}</span>
              </div>
              <Badge variant={getStatusBadge(post.status) as any}>
                {post.status}
              </Badge>
            </div>

            <div className="flex-1 bg-canvas-variant/50 p-4 rounded-lg mb-6 text-sm text-secondary line-clamp-4">
              {post.content}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-canvas-variant mt-auto">
              <div className="flex space-x-4 text-xs text-secondary-light">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {post.date}
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {post.time}
                </div>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-light hover:text-primary" onClick={() => handleOpenModal(post)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-light hover:text-danger" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Post" : "Create Post"}>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="enterprise-label">Platform</label>
            <Select 
              value={formData.platform}
              onChange={(e) => setFormData({...formData, platform: e.target.value})}
              options={[
                { value: 'Twitter', label: 'Twitter' },
                { value: 'LinkedIn', label: 'LinkedIn' },
                { value: 'Instagram', label: 'Instagram' }
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="enterprise-label">Content</label>
            <textarea 
              className="w-full h-32 px-4 py-2 bg-canvas border border-canvas-variant rounded-lg text-sm text-secondary-dark placeholder-secondary-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              placeholder="Write your post content here..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="enterprise-label">Date</label>
              <Input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="enterprise-label">Time</label>
              <Input 
                type="time" 
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="enterprise-label">Status</label>
            <Select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              options={[
                { value: 'Draft', label: 'Draft' },
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Published', label: 'Published' },
              ]}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-2 border-t border-canvas-variant">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingItem ? "Save Changes" : "Schedule Post"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
