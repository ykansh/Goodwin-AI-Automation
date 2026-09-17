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
  // Important Features from Jotform:
  legalName?: string;
  designation?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  industry?: string;
  businessType?: string;
  businessModel?: 'B2B' | 'B2C' | 'Both' | string;
  description?: string;
  leadSource?: string;
  dealValue?: number;
  priority?: 'Hot' | 'Warm' | 'Cold' | string;
  responseSpeed?: string;
  productsInterested?: string;
  qualificationNotes?: string;
  nextFollowUp?: string;
  details?: Record<string, any>;
}

export const INITIAL_MARKETING_LEADS: MarketingLead[] = [
  {
    id: 'lead_1',
    name: 'Rajesh Sharma',
    company: 'Precision Forgings & Gears Pvt Ltd',
    legalName: 'Precision Forgings & Gears India Private Limited',
    designation: 'Managing Director',
    email: 'rajesh.sharma@precisionforgings.in',
    phone: '+91 98230 45678',
    website: 'https://precisionforgings.in',
    city: 'Pune',
    state: 'Maharashtra',
    industry: 'Automotive & Industrial Machinery',
    businessType: 'Manufacturer',
    businessModel: 'B2B',
    description: 'Specialized manufacturer of high-precision spiral bevel gears and custom forged alloy flanges for automotive OEMs.',
    leadSource: 'IndiaMART',
    dealValue: 450000,
    priority: 'Hot',
    status: 'Qualified',
    assignedTo: 'Sarah Connor',
    work: 'started',
    responseSpeed: 'Within 15 minutes',
    productsInterested: 'Custom Spiral Bevel Gears, Forged Flanges',
    qualificationNotes: 'Losing high-value leads due to 24hr delayed follow-up on IndiaMART. Needs automated WhatsApp capture & quotation dispatch.',
    date: '2026-09-17',
    nextFollowUp: '2026-09-19'
  },
  {
    id: 'lead_2',
    name: 'Amitabh Patel',
    company: 'Apex Polymer Solutions',
    legalName: 'Apex Polymers LLP',
    designation: 'Head of Sales & Expansion',
    email: 'a.patel@apexpolymers.com',
    phone: '+91 99099 12345',
    website: 'https://apexpolymers.com',
    city: 'Ahmedabad',
    state: 'Gujarat',
    industry: 'Plastics & Packaging',
    businessType: 'Manufacturer',
    businessModel: 'B2B',
    description: 'Manufacturer of high-barrier multi-layer flexible films, stretch films, and eco-friendly compostable packaging for FMCG clients.',
    leadSource: 'Google Ads',
    dealValue: 680000,
    priority: 'Hot',
    status: 'Hot',
    assignedTo: 'John Doe',
    work: 'started',
    responseSpeed: 'Within 1 hour',
    productsInterested: 'High-barrier flexible films, Bio-degradable shrink wraps',
    qualificationNotes: 'Expanding distribution across North India. Ready to initiate 6-month growth retainer if pilot shows positive ROI.',
    date: '2026-09-16',
    nextFollowUp: '2026-09-20'
  },
  {
    id: 'lead_3',
    name: 'Dr. Neha Sen',
    company: 'Zenith MedTech Labs',
    legalName: 'Zenith Medical Technologies Ltd',
    designation: 'Director of Operations',
    email: 'neha.sen@zenithmedtech.io',
    phone: '+91 97401 88992',
    website: 'https://zenithmedtech.io',
    city: 'Bengaluru',
    state: 'Karnataka',
    industry: 'Medical Devices & Healthcare',
    businessType: 'Manufacturer',
    businessModel: 'B2B',
    description: 'OEM developer of hospital-grade point-of-care diagnostic devices, patient monitoring systems, and laboratory calibration sensors.',
    leadSource: 'Meta Ads',
    dealValue: 320000,
    priority: 'Warm',
    status: 'Contacted',
    assignedTo: 'Mike Brown',
    work: 'not started',
    responseSpeed: 'Same day',
    productsInterested: 'Point-of-Care diagnostic equipment, Calibration monitors',
    qualificationNotes: 'Generates 60+ inquiries/mo from LinkedIn & Meta. Sales team struggling with manual entry and duplicate records.',
    date: '2026-09-15',
    nextFollowUp: '2026-09-21'
  },
  {
    id: 'lead_4',
    name: 'Vikram Singhania',
    company: 'Vanguard CNC Automation',
    legalName: 'Vanguard Machining Systems Pvt Ltd',
    designation: 'Chief Executive Officer',
    email: 'vikram@vanguardcnc.com',
    phone: '+91 94432 77110',
    website: 'https://vanguardcnc.com',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    industry: 'Industrial Automation',
    businessType: 'Manufacturer',
    businessModel: 'B2B',
    description: 'Precision engineering firm building 5-axis CNC machining centers, automated robotic tool changers, and smart shop-floor automation.',
    leadSource: 'TradeIndia',
    dealValue: 950000,
    priority: 'Hot',
    status: 'Hot',
    assignedTo: 'Sarah Connor',
    work: 'started',
    responseSpeed: 'Immediately',
    productsInterested: '5-Axis CNC Milling Centers, Automated Tool Changers',
    qualificationNotes: 'Average order value ₹15L+. High closing rate if quotation delivered within 2 hours. Finalizing contract terms.',
    date: '2026-09-14',
    nextFollowUp: '2026-09-18'
  },
  {
    id: 'lead_5',
    name: 'Pooja Verma',
    company: 'Aura Natural Organics',
    legalName: 'Aura Herbals & Organics Co.',
    designation: 'Brand & Marketing Lead',
    email: 'pooja@auranaturals.co',
    phone: '+91 98290 33445',
    website: 'https://auranaturals.co',
    city: 'Jaipur',
    state: 'Rajasthan',
    industry: 'FMCG & Personal Care',
    businessType: 'Wholesaler',
    businessModel: 'Both',
    description: 'Wholesale producer of certified organic cold-pressed carrier oils, essential herbal extracts, and private-label cosmetics.',
    leadSource: 'Website',
    dealValue: 240000,
    priority: 'Warm',
    status: 'New',
    assignedTo: 'Jane Smith',
    work: 'not started',
    responseSpeed: 'Within 1 hour',
    productsInterested: 'Bulk cold-pressed carrier oils, Private label formulations',
    qualificationNotes: 'Inbound organic website lead. Wants automated qualification bot to filter wholesale inquiries from retail consumers.',
    date: '2026-09-17',
    nextFollowUp: '2026-09-19'
  },
  {
    id: 'lead_6',
    name: 'Harish Mehra',
    company: 'Krypton Solar Technologies',
    legalName: 'Krypton CleanEnergy Pvt Ltd',
    designation: 'Business Development Manager',
    email: 'harish@kryptonsolar.in',
    phone: '+91 98111 67890',
    website: 'https://kryptonsolar.in',
    city: 'New Delhi',
    state: 'Delhi NCR',
    industry: 'Renewable Energy',
    businessType: 'Service Business',
    businessModel: 'B2B',
    description: 'Turnkey EPC contractor executing rooftop solar power systems, captive solar farms, and smart hybrid grid inverters.',
    leadSource: 'WhatsApp',
    dealValue: 180000,
    priority: 'Cold',
    status: 'Contacted',
    assignedTo: 'Mike Brown',
    work: 'not started',
    responseSpeed: 'Same day',
    productsInterested: 'Commercial rooftop solar installations, Grid inverter systems',
    qualificationNotes: 'Budget freeze until next quarter. Keep nurtured via automated WhatsApp industry newsletter and quarterly check-ins.',
    date: '2026-09-12',
    nextFollowUp: '2026-09-25'
  },
  {
    id: 'lead_7',
    name: 'Siddharth Rao',
    company: 'Nexus Cloud ERP Solutions',
    legalName: 'Nexus Techworks India Private Limited',
    designation: 'Co-Founder & VP Sales',
    email: 'siddharth@nexuserp.io',
    phone: '+91 99887 55443',
    website: 'https://nexuserp.io',
    city: 'Hyderabad',
    state: 'Telangana',
    industry: 'Information Technology / SaaS',
    businessType: 'Service Business',
    businessModel: 'B2B',
    description: 'Enterprise B2B SaaS company delivering cloud ERP, predictive inventory control, and AI supply-chain automation for mid-market manufacturers.',
    leadSource: 'Referrals',
    dealValue: 520000,
    priority: 'Hot',
    status: 'Qualified',
    assignedTo: 'Sarah Connor',
    work: 'done',
    responseSpeed: 'Immediately',
    productsInterested: 'AI-driven CRM integration, Automated lead pipeline intelligence',
    qualificationNotes: 'Referred by Apex Polymers. Deal closed and onboarding completed. Ready for production rollout.',
    date: '2026-09-11',
    nextFollowUp: '2026-09-18'
  }
];

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
  syncSeedLeadsToSupabase: () => Promise<void>;
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
  marketingLeads: INITIAL_MARKETING_LEADS,
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

      if (leadsErr) console.warn('Leads fetch notice:', leadsErr.message);
      if (postsErr) console.warn('Posts fetch notice:', postsErr.message);
      if (creativesErr) console.warn('Creatives fetch notice:', creativesErr.message);
      if (campaignsErr) console.warn('Campaigns fetch notice:', campaignsErr.message);
      if (adsErr) console.warn('Ads fetch notice:', adsErr.message);

      set(state => {
        let leads = state.marketingLeads;
        if (leadsData && leadsData.length > 0) {
          leads = leadsData.map((l: any) => {
            const matchingSeed = INITIAL_MARKETING_LEADS.find(s => s.name === l.name || s.company === l.company);
            return {
              id: l.id?.toString() || matchingSeed?.id || `lead_${Date.now()}`,
              name: l.name || matchingSeed?.name || 'New Lead',
              company: l.company || matchingSeed?.company || '',
              date: l.date || matchingSeed?.date || new Date().toISOString().split('T')[0],
              status: l.status || matchingSeed?.status || 'New',
              assignedTo: l.assigned_to || matchingSeed?.assignedTo || '',
              work: l.work || matchingSeed?.work || 'not started',
              legalName: l.legal_name || matchingSeed?.legalName || l.company,
              designation: l.designation || matchingSeed?.designation || 'Business Contact',
              email: l.email || matchingSeed?.email || '',
              phone: l.phone || matchingSeed?.phone || '',
              website: l.website || matchingSeed?.website || '',
              city: l.city || matchingSeed?.city || 'India',
              state: l.state || matchingSeed?.state || '',
              industry: l.industry || matchingSeed?.industry || 'General Industry',
              businessType: l.business_type || matchingSeed?.businessType || 'Manufacturer',
              businessModel: l.business_model || matchingSeed?.businessModel || 'B2B',
              description: l.description || matchingSeed?.description || '',
              leadSource: l.lead_source || l.source || matchingSeed?.leadSource || 'Website',
              dealValue: Number(l.deal_value || l.value || matchingSeed?.dealValue || 250000),
              priority: (l.priority || matchingSeed?.priority || 'Warm') as 'Hot' | 'Warm' | 'Cold',
              responseSpeed: l.response_speed || matchingSeed?.responseSpeed || 'Within 1 hour',
              productsInterested: l.products_interested || matchingSeed?.productsInterested || '',
              qualificationNotes: l.qualification_notes || matchingSeed?.qualificationNotes || '',
              nextFollowUp: l.next_follow_up || matchingSeed?.nextFollowUp || new Date().toISOString().split('T')[0]
            };
          });
        }
        return {
          marketingLeads: leads,
          socialPosts: postsData ? postsData.map(p => ({
            id: p.id, platform: p.platform, content: p.content, scheduledDate: p.scheduled_date, status: p.status, engagement: p.engagement
          })) : state.socialPosts,
          creatives: creativesData ? creativesData.map(c => ({
            id: c.id, title: c.title, type: c.type, status: c.status, assignee: c.assignee, dueDate: c.due_date
          })) : state.creatives,
          campaigns: campaignsData ? campaignsData.map(c => ({
            id: c.id, name: c.name, platform: c.platform, status: c.status, budget: c.budget, spent: c.spent, leads: c.leads
          })) : state.campaigns,
          ads: adsData ? adsData.map(a => ({
            id: a.id, name: a.name, platform: a.platform, status: a.status, spend: a.spend, clicks: a.clicks, conversions: a.conversions
          })) : state.ads,
          isLoading: false
        };
      });
    } catch (err: any) {
      console.error(err);
      set({ error: err.message, isLoading: false });
    }
  },

  syncSeedLeadsToSupabase: async () => {
    try {
      const state = get();
      for (const lead of state.marketingLeads) {
        const fullPayload: any = {
          name: lead.name,
          company: lead.company,
          date: lead.date,
          status: lead.status,
          assigned_to: lead.assignedTo,
          work: lead.work,
          legal_name: lead.legalName,
          designation: lead.designation,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          city: lead.city,
          state: lead.state,
          industry: lead.industry,
          business_type: lead.businessType,
          business_model: lead.businessModel,
          description: lead.description,
          lead_source: lead.leadSource,
          deal_value: lead.dealValue,
          priority: lead.priority,
          response_speed: lead.responseSpeed,
          products_interested: lead.productsInterested,
          qualification_notes: lead.qualificationNotes,
          next_follow_up: lead.nextFollowUp
        };

        const { error } = await supabase.from('marketing_leads').insert([fullPayload]);
        if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
          await supabase.from('marketing_leads').insert([{
            name: lead.name,
            company: lead.company,
            date: lead.date,
            status: lead.status,
            assigned_to: lead.assignedTo,
            work: lead.work
          }]);
        }
      }
      await get().fetchMarketingData();
    } catch (err) {
      console.warn('Sync seed leads warning:', err);
    }
  },

  addMarketingLead: async (lead) => {
    let newId = `lead_${Date.now()}`;
    try {
      const fullPayload: any = {
        name: lead.name,
        company: lead.company,
        date: lead.date,
        status: lead.status,
        assigned_to: lead.assignedTo,
        work: lead.work,
        legal_name: lead.legalName,
        designation: lead.designation,
        email: lead.email,
        phone: lead.phone,
        website: lead.website,
        city: lead.city,
        state: lead.state,
        industry: lead.industry,
        business_type: lead.businessType,
        business_model: lead.businessModel,
        description: lead.description,
        lead_source: lead.leadSource,
        deal_value: lead.dealValue,
        priority: lead.priority,
        response_speed: lead.responseSpeed,
        products_interested: lead.productsInterested,
        qualification_notes: lead.qualificationNotes,
        next_follow_up: lead.nextFollowUp
      };

      let { data, error } = await supabase.from('marketing_leads').insert([fullPayload]).select().single();
      if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
        const basePayload = {
          name: lead.name,
          company: lead.company,
          date: lead.date,
          status: lead.status,
          assigned_to: lead.assignedTo,
          work: lead.work
        };
        const fallbackRes = await supabase.from('marketing_leads').insert([basePayload]).select().single();
        data = fallbackRes.data;
      }
      if (data?.id) {
        newId = data.id.toString();
      }
    } catch (err) {
      console.warn('Supabase insert warning:', err);
    }
    set(state => ({ marketingLeads: [{ ...lead, id: newId }, ...state.marketingLeads] }));
  },
  updateMarketingLead: async (id, lead) => {
    try {
      const fullPayload: any = {};
      if (lead.name !== undefined) fullPayload.name = lead.name;
      if (lead.company !== undefined) fullPayload.company = lead.company;
      if (lead.date !== undefined) fullPayload.date = lead.date;
      if (lead.status !== undefined) fullPayload.status = lead.status;
      if (lead.assignedTo !== undefined) fullPayload.assigned_to = lead.assignedTo;
      if (lead.work !== undefined) fullPayload.work = lead.work;
      if (lead.legalName !== undefined) fullPayload.legal_name = lead.legalName;
      if (lead.designation !== undefined) fullPayload.designation = lead.designation;
      if (lead.email !== undefined) fullPayload.email = lead.email;
      if (lead.phone !== undefined) fullPayload.phone = lead.phone;
      if (lead.website !== undefined) fullPayload.website = lead.website;
      if (lead.city !== undefined) fullPayload.city = lead.city;
      if (lead.state !== undefined) fullPayload.state = lead.state;
      if (lead.industry !== undefined) fullPayload.industry = lead.industry;
      if (lead.businessType !== undefined) fullPayload.business_type = lead.businessType;
      if (lead.businessModel !== undefined) fullPayload.business_model = lead.businessModel;
      if (lead.description !== undefined) fullPayload.description = lead.description;
      if (lead.leadSource !== undefined) fullPayload.lead_source = lead.leadSource;
      if (lead.dealValue !== undefined) fullPayload.deal_value = lead.dealValue;
      if (lead.priority !== undefined) fullPayload.priority = lead.priority;
      if (lead.responseSpeed !== undefined) fullPayload.response_speed = lead.responseSpeed;
      if (lead.productsInterested !== undefined) fullPayload.products_interested = lead.productsInterested;
      if (lead.qualificationNotes !== undefined) fullPayload.qualification_notes = lead.qualificationNotes;
      if (lead.nextFollowUp !== undefined) fullPayload.next_follow_up = lead.nextFollowUp;

      const { error } = await supabase.from('marketing_leads').update(fullPayload).eq('id', id);
      if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
        const basePayload: any = {};
        if (lead.name !== undefined) basePayload.name = lead.name;
        if (lead.company !== undefined) basePayload.company = lead.company;
        if (lead.date !== undefined) basePayload.date = lead.date;
        if (lead.status !== undefined) basePayload.status = lead.status;
        if (lead.assignedTo !== undefined) basePayload.assigned_to = lead.assignedTo;
        if (lead.work !== undefined) basePayload.work = lead.work;
        await supabase.from('marketing_leads').update(basePayload).eq('id', id);
      }
    } catch (err) {
      console.warn('Supabase update warning:', err);
    }
    set(state => ({ marketingLeads: state.marketingLeads.map(l => l.id === id ? { ...l, ...lead } : l) }));
  },
  deleteMarketingLead: async (id) => {
    try {
      await supabase.from('marketing_leads').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete warning:', err);
    }
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
