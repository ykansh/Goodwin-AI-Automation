import { create } from 'zustand';
import { supabase } from './supabase';

export interface MarketingLead {
  id: string;
  name: string;
  company: string;
  date: string;
  status: string;
  assignedTo: string;
  work: string;
}

export interface Post {
  id: string;
  platform: string;
  content: string;
  scheduledDate: string;
  status: string;
  engagement: { likes: number; comments: number; shares: number };
}

export interface Creative {
  id: string;
  title: string;
  type: string;
  status: string;
  assignee: string;
  dueDate: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  budget: number;
  spent: number;
  leads: number;
}

export interface Ad {
  id: string;
  name: string;
  platform: string;
  status: string;
  spend: number;
  clicks: number;
  conversions: number;
}

export interface MarketingState {
  isLoading: boolean;
  error: string | null;
  marketingLeads: MarketingLead[];
  socialPosts: Post[];
  creatives: Creative[];
  campaigns: Campaign[];
  ads: Ad[];

  fetchMarketingData: () => Promise<void>;
  addMarketingLead: (lead: Omit<MarketingLead, 'id'>) => Promise<void>;
  updateMarketingLead: (id: string, lead: Partial<MarketingLead>) => Promise<void>;
  deleteMarketingLead: (id: string) => Promise<void>;

  addPost: (post: Omit<Post, 'id' | 'engagement'>) => Promise<void>;
  updatePost: (id: string, post: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;

  addCreative: (creative: Omit<Creative, 'id'>) => Promise<void>;
  updateCreative: (id: string, creative: Partial<Creative>) => Promise<void>;
  deleteCreative: (id: string) => Promise<void>;

  addCampaign: (campaign: Omit<Campaign, 'id'>) => Promise<void>;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;

  addAd: (ad: Omit<Ad, 'id'>) => Promise<void>;
  updateAd: (id: string, ad: Partial<Ad>) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;

  setMarketingLeads: (updater: (prev: MarketingLead[]) => MarketingLead[]) => void;
  setSocialPosts: (updater: (prev: Post[]) => Post[]) => void;
  setCreatives: (updater: (prev: Creative[]) => Creative[]) => void;
  setCampaigns: (updater: (prev: Campaign[]) => Campaign[]) => void;
  setAds: (updater: (prev: Ad[]) => Ad[]) => void;
}

export const useMarketingStore = create<MarketingState>((set, get) => ({
  isLoading: false,
  error: null,
  marketingLeads: [],
  socialPosts: [],
  creatives: [],
  campaigns: [],
  ads: [],

  fetchMarketingData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [
        { data: leadsData, error: leadsErr },
        { data: postsData, error: postsErr },
        { data: creativesData, error: creativesErr },
        { data: campaignsData, error: campaignsErr },
        { data: adsData, error: adsErr }
      ] = await Promise.all([
        supabase.from('marketing_leads').select('*'),
        supabase.from('social_posts').select('*'),
        supabase.from('creatives').select('*'),
        supabase.from('campaigns').select('*'),
        supabase.from('ads').select('*')
      ]);

      if (leadsErr) throw leadsErr;
      if (postsErr) throw postsErr;
      if (creativesErr) throw creativesErr;
      if (campaignsErr) throw campaignsErr;
      if (adsErr) throw adsErr;

      set({
        marketingLeads: leadsData.map(l => ({
          id: l.id, name: l.name, company: l.company, date: l.date, status: l.status, assignedTo: l.assigned_to, work: l.work
        })),
        socialPosts: postsData.map(p => ({
          id: p.id, platform: p.platform, content: p.content, scheduledDate: p.scheduled_date, status: p.status, engagement: p.engagement
        })),
        creatives: creativesData.map(c => ({
          id: c.id, title: c.title, type: c.type, status: c.status, assignee: c.assignee, dueDate: c.due_date
        })),
        campaigns: campaignsData.map(c => ({
          id: c.id, name: c.name, platform: c.platform, status: c.status, budget: c.budget, spent: c.spent, leads: c.leads
        })),
        ads: adsData.map(a => ({
          id: a.id, name: a.name, platform: a.platform, status: a.status, spend: a.spend, clicks: a.clicks, conversions: a.conversions
        })),
        isLoading: false
      });
    } catch (err: any) {
      console.error(err);
      set({ error: err.message, isLoading: false });
    }
  },

  addMarketingLead: async (lead) => {
    const { data, error } = await supabase.from('marketing_leads').insert([{
      name: lead.name, company: lead.company, date: lead.date, status: lead.status, assigned_to: lead.assignedTo, work: lead.work
    }]).select().single();
    if (error) return console.error(error);
    set(state => ({ marketingLeads: [...state.marketingLeads, { ...lead, id: data.id }] }));
  },
  updateMarketingLead: async (id, lead) => {
    const { error } = await supabase.from('marketing_leads').update({
      name: lead.name, company: lead.company, date: lead.date, status: lead.status, assigned_to: lead.assignedTo, work: lead.work
    }).eq('id', id);
    if (error) return console.error(error);
    set(state => ({ marketingLeads: state.marketingLeads.map(l => l.id === id ? { ...l, ...lead } : l) }));
  },
  deleteMarketingLead: async (id) => {
    const { error } = await supabase.from('marketing_leads').delete().eq('id', id);
    if (error) return console.error(error);
    set(state => ({ marketingLeads: state.marketingLeads.filter(l => l.id !== id) }));
  },

  addPost: async (post) => {
    const { data, error } = await supabase.from('social_posts').insert([{
      platform: post.platform, content: post.content, scheduled_date: post.scheduledDate, status: post.status
    }]).select().single();
    if (error) return console.error(error);
    set(state => ({ socialPosts: [...state.socialPosts, { ...post, id: data.id, engagement: data.engagement }] }));
  },
  updatePost: async (id, post) => {
    const { error } = await supabase.from('social_posts').update({
      platform: post.platform, content: post.content, scheduled_date: post.scheduledDate, status: post.status
    }).eq('id', id);
    if (error) return console.error(error);
    set(state => ({ socialPosts: state.socialPosts.map(p => p.id === id ? { ...p, ...post } : p) }));
  },
  deletePost: async (id) => {
    const { error } = await supabase.from('social_posts').delete().eq('id', id);
    if (error) return console.error(error);
    set(state => ({ socialPosts: state.socialPosts.filter(p => p.id !== id) }));
  },

  addCreative: async (creative) => {
    const { data, error } = await supabase.from('creatives').insert([{
      title: creative.title, type: creative.type, status: creative.status, assignee: creative.assignee, due_date: creative.dueDate
    }]).select().single();
    if (error) return console.error(error);
    set(state => ({ creatives: [...state.creatives, { ...creative, id: data.id }] }));
  },
  updateCreative: async (id, creative) => {
    const { error } = await supabase.from('creatives').update({
      title: creative.title, type: creative.type, status: creative.status, assignee: creative.assignee, due_date: creative.dueDate
    }).eq('id', id);
    if (error) return console.error(error);
    set(state => ({ creatives: state.creatives.map(c => c.id === id ? { ...c, ...creative } : c) }));
  },
  deleteCreative: async (id) => {
    const { error } = await supabase.from('creatives').delete().eq('id', id);
    if (error) return console.error(error);
    set(state => ({ creatives: state.creatives.filter(c => c.id !== id) }));
  },

  addCampaign: async (campaign) => {
    const { data, error } = await supabase.from('campaigns').insert([{
      name: campaign.name, platform: campaign.platform, status: campaign.status, budget: campaign.budget, spent: campaign.spent, leads: campaign.leads
    }]).select().single();
    if (error) return console.error(error);
    set(state => ({ campaigns: [...state.campaigns, { ...campaign, id: data.id }] }));
  },
  updateCampaign: async (id, campaign) => {
    const { error } = await supabase.from('campaigns').update({
      name: campaign.name, platform: campaign.platform, status: campaign.status, budget: campaign.budget, spent: campaign.spent, leads: campaign.leads
    }).eq('id', id);
    if (error) return console.error(error);
    set(state => ({ campaigns: state.campaigns.map(c => c.id === id ? { ...c, ...campaign } : c) }));
  },
  deleteCampaign: async (id) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) return console.error(error);
    set(state => ({ campaigns: state.campaigns.filter(c => c.id !== id) }));
  },

  addAd: async (ad) => {
    const { data, error } = await supabase.from('ads').insert([{
      name: ad.name, platform: ad.platform, status: ad.status, spend: ad.spend, clicks: ad.clicks, conversions: ad.conversions
    }]).select().single();
    if (error) return console.error(error);
    set(state => ({ ads: [...state.ads, { ...ad, id: data.id }] }));
  },
  updateAd: async (id, ad) => {
    const { error } = await supabase.from('ads').update({
      name: ad.name, platform: ad.platform, status: ad.status, spend: ad.spend, clicks: ad.clicks, conversions: ad.conversions
    }).eq('id', id);
    if (error) return console.error(error);
    set(state => ({ ads: state.ads.map(a => a.id === id ? { ...a, ...ad } : a) }));
  },
  deleteAd: async (id) => {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) return console.error(error);
    set(state => ({ ads: state.ads.filter(a => a.id !== id) }));
  },

  setMarketingLeads: (updater) => set(state => ({ marketingLeads: updater(state.marketingLeads) })),
  setSocialPosts: (updater) => set(state => ({ socialPosts: updater(state.socialPosts) })),
  setCreatives: (updater) => set(state => ({ creatives: updater(state.creatives) })),
  setCampaigns: (updater) => set(state => ({ campaigns: updater(state.campaigns) })),
  setAds: (updater) => set(state => ({ ads: updater(state.ads) }))
}));
