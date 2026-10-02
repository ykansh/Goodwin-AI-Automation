import { create } from 'zustand';
import { supabase } from './supabase';

export type BrandType = 'Goodwin Batteries' | 'Goodwin Grow AI' | string;
export type ContentType = 'Post' | 'Reel' | 'Story' | 'Carousel';
export type CreativeStatus = 'Idea' | 'In Progress' | 'Ready' | 'Approved' | 'Needs Revision';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Under Review' | 'Rejected';
export type PostingStatus = 'Pending' | 'Scheduled' | 'Posted';
export type PlatformType = 'Instagram' | 'Facebook' | 'LinkedIn' | 'Google Business';

export interface CalendarEntry {
  id: string;
  projectId?: string;
  projectName?: string;
  brand: BrandType;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // e.g. "Friday"
  occasion: string; // Festival / Occasion / Content Topic
  contentType: ContentType;
  contentBrief: string; // Content Idea / Brief
  caption: string;
  creativeStatus: CreativeStatus;
  approvalStatus: ApprovalStatus;
  scheduledTime: string; // e.g. "10:30 AM" or "2026-10-24 10:30 AM"
  platforms: PlatformType[];
  assignedTo: string;
  postingStatus: PostingStatus;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_CALENDAR_KEY = 'goodwin_marketing_calendar_v2';

// Helper to compute day name from date string
export const getDayOfWeekName = (dateStr: string): string => {
  try {
    const d = new Date(dateStr + 'T12:00:00Z');
    return d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  } catch {
    return 'Monday';
  }
};

// Comprehensive in-advance 2026 calendar dataset: Indian festivals, national days, industry occasions, brand campaigns
export const INITIAL_CALENDAR_ENTRIES: CalendarEntry[] = [
  // ── JAN 2026 ──
  {
    id: 'cal_01',
    brand: 'Goodwin Grow AI',
    date: '2026-01-02',
    dayOfWeek: 'Friday',
    occasion: 'New Year Automation Resolutions',
    contentType: 'Carousel',
    contentBrief: '5 Manual Business Operations to Automate in 2026. Highlighting lead response lag, invoicing bottlenecks, inventory sync, and HR attendance receipt generation.',
    caption: '🚀 Welcome to 2026! If your team is still spending 15+ hours a week copying data between WhatsApp, Excel, and CRM, you are burning capital.\n\nHere are 5 core workflows leading Indian enterprises are automating with Goodwin Grow AI this quarter 👇\n\n1️⃣ Instant WhatsApp Lead Capture & Routing\n2️⃣ Automated GST Invoicing & Payment Reminders\n3️⃣ Real-Time Project Milestone Tracking\n4️⃣ Biometric & QR Attendance Receipts\n5️⃣ Smart Inventory & Supply Chain Reordering\n\nReady to transform your business operations into an autonomous engine? Click the link in bio to book a 1-on-1 architecture call!\n\n#GoodwinGrowAI #BusinessAutomation #DigitalTransformation #IndianMSME #AIforBusiness #WorkflowAutomation',
    creativeStatus: 'Approved',
    approvalStatus: 'Approved',
    scheduledTime: '2026-01-02 10:00 AM',
    platforms: ['Instagram', 'LinkedIn', 'Facebook'],
    assignedTo: 'Ansh Chourasiya',
    postingStatus: 'Posted',
    createdAt: '2026-01-01T08:00:00.000Z',
    updatedAt: '2026-01-02T10:05:00.000Z'
  },
  {
    id: 'cal_02',
    brand: 'Goodwin Batteries',
    date: '2026-01-14',
    dayOfWeek: 'Wednesday',
    occasion: 'Makar Sankranti & Pongal (Harvest Festival)',
    contentType: 'Post',
    contentBrief: 'Harvesting Endless Energy Visual. A vibrant kite soaring in bright sunshine above a modern Indian household powered by Goodwin Solar Ready Tubular Batteries.',
    caption: '🪁 May the festival of Makar Sankranti bring boundless energy, prosperity, and joy into your home!\n\nJust like the sun transitions to bring brighter and longer days, Goodwin Batteries ensures your home and enterprise never experience a single second of blackout.\n\n✨ Pure Sine Wave Inverter Batteries\n✨ 99.98% Pure Electrolyte Lead Alloy\n✨ Backed by Pan-India Quick Support Warranty\n\nWishing you and your family a very Happy Makar Sankranti, Pongal & Uttarayan! ☀️🌾\n\n#GoodwinBatteries #MakarSankranti2026 #HappyPongal #EndlessEnergy #InverterBattery #MakeInIndia #SolarEnergy',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-01-14 09:30 AM',
    platforms: ['Instagram', 'Facebook', 'Google Business'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Scheduled',
    createdAt: '2026-01-05T09:00:00.000Z',
    updatedAt: '2026-01-05T09:00:00.000Z'
  },
  {
    id: 'cal_03',
    brand: 'Goodwin Batteries',
    date: '2026-01-26',
    dayOfWeek: 'Monday',
    occasion: 'Republic Day (77th Republic Day of India)',
    contentType: 'Post',
    contentBrief: 'Tricolor Patriotic Battery Motif. Highlighting indigenous manufacturing, self-reliant India (Atmanirbhar Bharat), and powering critical infrastructure across 18 states.',
    caption: '🇮🇳 Saluting the Spirit of a Resilient, Self-Reliant Nation!\n\nOn India\'s 77th Republic Day, Goodwin Batteries reaffirms its commitment to engineering heavy-duty, long-lasting power storage solutions 100% crafted in India, for India.\n\nFrom remote farming tube-wells to bustling urban enterprise servers, we take pride in keeping the pulse of the nation running uninterrupted.\n\nHappy Republic Day to all citizens! Jai Hind! 🇮🇳✨\n\n#RepublicDay2026 #MakeInIndia #AtmanirbharBharat #GoodwinBatteries #PoweringIndia #ProudlyIndian',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-01-26 08:30 AM',
    platforms: ['Instagram', 'Facebook', 'LinkedIn', 'Google Business'],
    assignedTo: 'Ansh Chourasiya',
    postingStatus: 'Scheduled',
    createdAt: '2026-01-05T09:30:00.000Z',
    updatedAt: '2026-01-05T09:30:00.000Z'
  },

  // ── FEB 2026 ──
  {
    id: 'cal_04',
    brand: 'Goodwin Batteries',
    date: '2026-02-18',
    dayOfWeek: 'Wednesday',
    occasion: 'World Battery Day (Industry Special Day)',
    contentType: 'Reel',
    contentBrief: 'Factory Floor Teardown Reel. 30-second macro reel showing spine casting, tubular gauntlet filling, and automated acid circulation. Text hook: "What makes a battery last 7+ years?"',
    caption: '🔋 Today is #WorldBatteryDay — the most important day on our calendar!\n\nEver wondered why regular batteries die within 2 years while Goodwin Tall Tubular batteries power through 7+ years of intense Indian power cuts?\n\n🔬 The 3 Secrets Behind Goodwin Reliability:\n1️⃣ High-Pressure Die Cast Spine (Spine density resists acid corrosion 3x longer)\n2️⃣ Low Antimony Alloy (Drastically reduces water evaporation by 65%)\n3️⃣ Heavy-Duty Ceramic Vent Plugs (Zero fume leakage & easy water level monitoring)\n\nDrop a "POWER" in the comments for our free Battery Life Extension Guide! 💡\n\n#WorldBatteryDay2026 #GoodwinBatteries #BatteryTechnology #TubularBattery #EnergyStorage #MadeInIndia #EngineeringExcellence',
    creativeStatus: 'In Progress',
    approvalStatus: 'Under Review',
    scheduledTime: '2026-02-18 11:00 AM',
    platforms: ['Instagram', 'Facebook', 'LinkedIn'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Pending',
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-01-12T11:00:00.000Z'
  },
  {
    id: 'cal_05',
    brand: 'Goodwin Grow AI',
    date: '2026-02-28',
    dayOfWeek: 'Saturday',
    occasion: 'National Science Day',
    contentType: 'Carousel',
    contentBrief: 'Demystifying Agentic AI vs Traditional Software. Explaining how autonomous reasoning loops replace hard-coded rigid scripts in business operations.',
    caption: '🔬 On #NationalScienceDay, we celebrate the relentless pursuit of intelligent systems.\n\nFor decades, business software was rigid: if A happened, do B. But modern markets are unpredictable. Leads arrive at midnight, inventory fluctuates, customer requirements change instantly.\n\nSwipe through to see how Agentic AI architectures are redefining operational velocity for businesses in 2026 ➡️\n\nSwipe 1: Deterministic code vs Autonomous Agents\nSwipe 2: Real-time context retrieval via RAG & Vector Memory\nSwipe 3: 10x throughput without adding headcount\n\nDiscover how Goodwin Grow AI builds enterprise systems that learn and adapt. Link in bio!\n\n#NationalScienceDay #ArtificialIntelligence #AgenticAI #MachineLearning #TechInnovation #GoodwinGrowAI',
    creativeStatus: 'Idea',
    approvalStatus: 'Pending',
    scheduledTime: '2026-02-28 10:30 AM',
    platforms: ['LinkedIn', 'Instagram'],
    assignedTo: 'Ansh Chourasiya',
    postingStatus: 'Pending',
    createdAt: '2026-01-15T12:00:00.000Z',
    updatedAt: '2026-01-15T12:00:00.000Z'
  },

  // ── MAR 2026 ──
  {
    id: 'cal_06',
    brand: 'Goodwin Grow AI',
    date: '2026-03-08',
    dayOfWeek: 'Sunday',
    occasion: 'International Women\'s Day',
    contentType: 'Post',
    contentBrief: 'Spotlight on Women Tech Leaders & Operators. Celebrating female entrepreneurs, engineers, and ops directors scaling Indian manufacturing with modern tech.',
    caption: '💜 To the women engineering the systems of tomorrow, leading boardrooms, and shaping industrial innovation across India — Happy International Women\'s Day!\n\nAt Goodwin Grow AI, we salute the trailblazing women entrepreneurs who leverage AI and automation to scale enterprises fearlessly.\n\nHere\'s to breaking barriers, accelerating growth, and inspiring the next generation of women in STEM. 🚀\n\n#InternationalWomensDay #IWD2026 #WomenInTech #WomenEntrepreneurs #GoodwinGrowAI #Leadership',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-03-08 09:00 AM',
    platforms: ['LinkedIn', 'Instagram', 'Facebook'],
    assignedTo: 'Sarah Connor',
    postingStatus: 'Scheduled',
    createdAt: '2026-01-18T10:00:00.000Z',
    updatedAt: '2026-01-18T10:00:00.000Z'
  },
  {
    id: 'cal_07',
    brand: 'Goodwin Batteries',
    date: '2026-03-15',
    dayOfWeek: 'Sunday',
    occasion: 'Pre-Summer Power Preparedness Campaign (Promotional)',
    contentType: 'Carousel',
    contentBrief: 'Beat the 45°C Heatwave: 4 Warning Signs Your Inverter Battery Won\'t Survive Summer. Educational carousel promoting the Goodwin Pre-Summer Health Check & Upgrade Offer.',
    caption: '☀️ Summer temperatures in India are forecasted to hit 44°C+. Are you prepared for 4-hour daily load shedding?\n\nDon\'t wait for your ceiling fan to stop spinning at 2 AM to realize your old battery is dead. Check these 4 red flags today:\n\n⚠️ Bulging sides or acid leak on top cover\n⚠️ Backup time reduced to less than 45 minutes\n⚠️ Inverter fan running continuously on charging\n⚠️ Water level dropping every 2-3 weeks\n\nUpgrade to Goodwin Ultra Heavy Tall Tubular Battery before April 1st and get FREE home delivery + comprehensive warranty inspection!\n\n📞 Call our helpline or DM "SUMMER" for dealer location near you.\n\n#SummerPreparedness #InverterBattery #LoadShedding #GoodwinBatteries #HomeBackup #TubularBattery #PowerBackup',
    creativeStatus: 'In Progress',
    approvalStatus: 'Approved',
    scheduledTime: '2026-03-15 11:30 AM',
    platforms: ['Instagram', 'Facebook', 'Google Business'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Pending',
    createdAt: '2026-01-20T11:00:00.000Z',
    updatedAt: '2026-01-20T11:00:00.000Z'
  },
  {
    id: 'cal_08',
    brand: 'Goodwin Batteries',
    date: '2026-03-24',
    dayOfWeek: 'Tuesday',
    occasion: 'Holi - Festival of Colors',
    contentType: 'Post',
    contentBrief: 'Vibrant Colors Bursting Around a Glowing Goodwin Battery. Headline: "Add Colors to Your Celebration, Never Darkness to Your Home."',
    caption: '🎨 Let the colors of joy, prosperity, and laughter illuminate your home this Holi!\n\nWhen celebrations are at their peak, make sure your music never stops and your festive lights never flicker. Goodwin Batteries powers your sweetest family moments with rock-solid backup.\n\nWishing you and your loved ones a very Happy, Safe & Colorful Holi! 🌈✨\n\n#HappyHoli2026 #FestivalOfColors #GoodwinBatteries #UninterruptedJoy #HoliHai #MadeInIndia',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-03-24 08:30 AM',
    platforms: ['Instagram', 'Facebook', 'Google Business'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Scheduled',
    createdAt: '2026-01-22T10:00:00.000Z',
    updatedAt: '2026-01-22T10:00:00.000Z'
  },

  // ── APR 2026 ──
  {
    id: 'cal_09',
    brand: 'Goodwin Grow AI',
    date: '2026-04-01',
    dayOfWeek: 'Wednesday',
    occasion: 'New Financial Year Kickoff (FY 2026-27)',
    contentType: 'Carousel',
    contentBrief: 'New Financial Year Blueprint: How to eliminate 90% of operational leakage in FY 2026-27. Slide breakdown on cash collection, lead response speed, and inventory visibility.',
    caption: '📊 Happy New Financial Year FY 2026-27!\n\nToday marks day 1 of the new fiscal calendar. Before setting your Q1 revenue targets, audit your operational bottlenecks:\n\n📉 Are outstanding receivables sitting past 45 days?\n📉 Are marketing leads taking over 2 hours to receive a response?\n📉 Is stock data out of sync across your branches?\n\nCompanies partnering with Goodwin Grow AI cut administrative overhead by 70% while improving on-time order fulfillment to 99.4%.\n\nMake FY26 the year your operations become your strongest competitive advantage. Explore our AI ERP suite at the link in bio! 📈\n\n#FY2026 #NewFinancialYear #BusinessOperations #EnterpriseERP #GoodwinGrowAI #AutomationStrategy #IndianIndustry',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-04-01 09:30 AM',
    platforms: ['LinkedIn', 'Instagram', 'Facebook'],
    assignedTo: 'Ansh Chourasiya',
    postingStatus: 'Scheduled',
    createdAt: '2026-01-25T14:00:00.000Z',
    updatedAt: '2026-01-25T14:00:00.000Z'
  },
  {
    id: 'cal_10',
    brand: 'Goodwin Batteries',
    date: '2026-04-22',
    dayOfWeek: 'Wednesday',
    occasion: 'World Earth Day (Sustainability & Green Energy)',
    contentType: 'Carousel',
    contentBrief: 'Closed-Loop Circular Economy at Goodwin: How 98.5% of Every Battery is Recycled. Educational post highlighting environmental responsibility and solar integration.',
    caption: '🌍 Powering Today Without Compromising Tomorrow.\n\nOn #EarthDay2026, we\'re proud to share that over 98.5% of the lead and polypropylene used in Goodwin batteries is reclaimed and recycled through certified green smelters.\n\n🌱 Our Eco-Commitments:\n♻️ Zero Lead Leakage in manufacturing ecosystems\n☀️ 100% Solar Inverter Compatibility across all tubular ranges\n💧 Low Antimony formulation reducing water wastage by half\n\nSwitching to green, solar-ready energy backup is the smartest step for your home and our planet. Choose clean, choose Goodwin.\n\n#WorldEarthDay #Sustainability #CleanEnergy #SolarBattery #GoodwinBatteries #GreenManufacturing #CircularEconomy',
    creativeStatus: 'In Progress',
    approvalStatus: 'Pending',
    scheduledTime: '2026-04-22 10:00 AM',
    platforms: ['Instagram', 'LinkedIn', 'Facebook'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Pending',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z'
  },

  // ── MAY 2026 ──
  {
    id: 'cal_11',
    brand: 'Goodwin Grow AI',
    date: '2026-05-11',
    dayOfWeek: 'Monday',
    occasion: 'National Technology Day (India)',
    contentType: 'Reel',
    contentBrief: 'Behind the Scenes Tech Stack Reel. Showcase of Goodwin Grow AI\'s modern cloud architecture: Supabase Realtime, React 19, custom agentic workflows, and sub-100ms sync.',
    caption: '💻 Happy #NationalTechnologyDay!\n\nTechnology isn\'t about using buzzwords — it\'s about building tools that solve deep, real-world friction for hardworking businesses.\n\nFrom a tiny workshop in Gujarat to an automotive assembly in Pune, software should empower operators, eliminate paperwork, and let founders focus on scaling.\n\nHere is a 30-second look into how we engineer Goodwin Grow AI for speed, uptime, and effortless usability. ⚡️\n\n#NationalTechnologyDay2026 #GoodwinGrowAI #TechStack #IndianTech #SaaS #BuildInIndia #EngineeringExcellence',
    creativeStatus: 'Idea',
    approvalStatus: 'Pending',
    scheduledTime: '2026-05-11 11:00 AM',
    platforms: ['Instagram', 'LinkedIn'],
    assignedTo: 'Ansh Chourasiya',
    postingStatus: 'Pending',
    createdAt: '2026-02-05T12:00:00.000Z',
    updatedAt: '2026-02-05T12:00:00.000Z'
  },

  // ── JUN 2026 ──
  {
    id: 'cal_12',
    brand: 'Goodwin Grow AI',
    date: '2026-06-27',
    dayOfWeek: 'Saturday',
    occasion: 'World MSME Day',
    contentType: 'Carousel',
    contentBrief: 'The MSME Growth Playbook: How Indian Small & Medium Enterprises Are Outcompeting Giants Using Autonomous Workflows. Case studies & metrics.',
    caption: '🏭 Micro, Small & Medium Enterprises are the undeniable backbone of the Indian economic miracle.\n\nOn #WorldMSMEDay, we honor the 63 million MSMEs driving 30% of India\'s GDP.\n\nSwipe through to see how forward-thinking manufacturers are using AI to:\n👉 Slash lead-to-quote turnaround from 48 hours to 9 minutes\n👉 Reduce overdue customer receivables by 38%\n👉 Prevent factory line downtime with predictive maintenance alerts\n\nYour business doesn\'t need a 50-person IT team to run like an enterprise. You just need the right engine.\n\n#WorldMSMEDay #IndianMSME #MakeInIndia #GoodwinGrowAI #BusinessGrowth #ManufacturingTech',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-06-27 10:00 AM',
    platforms: ['LinkedIn', 'Instagram', 'Facebook'],
    assignedTo: 'Ansh Chourasiya',
    postingStatus: 'Scheduled',
    createdAt: '2026-02-10T11:00:00.000Z',
    updatedAt: '2026-02-10T11:00:00.000Z'
  },

  // ── JUL 2026 ──
  {
    id: 'cal_13',
    brand: 'Goodwin Batteries',
    date: '2026-07-10',
    dayOfWeek: 'Friday',
    occasion: 'Monsoon Heavy Power Check Campaign (Promotional)',
    contentType: 'Story',
    contentBrief: 'Monsoon Safety Checklist. Graphic cards warning against lightning surges, damp inverter locations, and heavy monsoon power cuts across coastal and northern belts.',
    caption: '🌧️ Monsoon Thunderstorms Arriving? Protect Your Home Inverter with These 3 Rules!\n\n1. Ensure inverter is elevated off damp floor tiles.\n2. Verify ceramic vent plugs are clean and properly sealed.\n3. Never leave exposed wires near rainwater runoff.\n\nExperience unyielding power through heavy monsoon storms with Goodwin Heavy Duty Tubular batteries! ⚡️\n\n#MonsoonCare #BatterySafety #GoodwinBatteries #PowerBackup #Monsoon2026',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-07-10 12:00 PM',
    platforms: ['Instagram', 'Facebook'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Scheduled',
    createdAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z'
  },

  // ── AUG 2026 ──
  {
    id: 'cal_14',
    brand: 'Goodwin Batteries',
    date: '2026-08-15',
    dayOfWeek: 'Saturday',
    occasion: 'Independence Day (80th Year of Freedom)',
    contentType: 'Post',
    contentBrief: 'Grand Tricolor Power Visual: Celebrating 80 Years of India\'s Independence with Unstoppable Energy across 18 States.',
    caption: '🇮🇳 80 Years of Freedom. 80 Years of Progress. Unstoppable India.\n\nOn this momentous 80th Independence Day, Goodwin Batteries salutes the nation that never sleeps and never stops building.\n\nWe are proud to power Indian homes, hospitals, schools, and industries with dependable energy storage engineered right here on Indian soil.\n\nHappy Independence Day! Vande Mataram! 🇮🇳✨\n\n#IndependenceDay2026 #80thIndependenceDay #GoodwinBatteries #MakeInIndia #VandeMataram #AtmanirbharBharat',
    creativeStatus: 'Approved',
    approvalStatus: 'Approved',
    scheduledTime: '2026-08-15 08:00 AM',
    platforms: ['Instagram', 'Facebook', 'LinkedIn', 'Google Business'],
    assignedTo: 'Ansh Chourasiya',
    postingStatus: 'Scheduled',
    createdAt: '2026-02-20T10:00:00.000Z',
    updatedAt: '2026-02-20T10:00:00.000Z'
  },
  {
    id: 'cal_15',
    brand: 'Goodwin Batteries',
    date: '2026-08-28',
    dayOfWeek: 'Friday',
    occasion: 'Raksha Bandhan (Celebration of Protection & Trust)',
    contentType: 'Post',
    contentBrief: 'Rakhi & Battery Protection Metaphor. Just as a sacred thread promises lifelong protection, Goodwin promises lifelong power security for your family.',
    caption: '🧵 The Sacred Bond of Trust and Protection.\n\nThis Raksha Bandhan, celebrate the promise of being there for each other through thick and thin.\n\nAt Goodwin, we make that same promise to your home: continuous, dependable power backup that protects your family’s comfort and security without fail.\n\nWishing everyone a warm and joyful Happy Raksha Bandhan! 💖✨\n\n#RakshaBandhan2026 #BondOfProtection #GoodwinBatteries #TrustedPower #HappyRakhi',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-08-28 09:00 AM',
    platforms: ['Instagram', 'Facebook'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Scheduled',
    createdAt: '2026-02-22T10:00:00.000Z',
    updatedAt: '2026-02-22T10:00:00.000Z'
  },

  // ── SEP 2026 ──
  {
    id: 'cal_16',
    brand: 'Goodwin Batteries',
    date: '2026-09-09',
    dayOfWeek: 'Wednesday',
    occasion: 'World EV Day (Electric Mobility & Future Batteries)',
    contentType: 'Carousel',
    contentBrief: 'The Evolution of High-Density Energy Storage: From Inverters to Commercial EV Fleets. Educational breakdown of battery cycle life and thermal stability.',
    caption: '⚡️ Happy #WorldEVDay!\n\nAs India embarks on its fastest-ever transition toward electrified mobility and green decentralized grids, heavy-duty battery technology sits right at the center of the revolution.\n\nSwipe to understand how thermal dissipation, cycle life, and fast-charging tolerances determine the lifespan of modern energy storage systems ➡️\n\nThe future of energy is durable, clean, and reliable. Goodwin is proud to engineer it.\n\n#WorldEVDay #CleanMobility #EnergyStorage #BatteryTech #GoodwinBatteries #ElectricVehicles',
    creativeStatus: 'In Progress',
    approvalStatus: 'Under Review',
    scheduledTime: '2026-09-09 11:00 AM',
    platforms: ['LinkedIn', 'Instagram'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Pending',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'cal_17',
    brand: 'Goodwin Grow AI',
    date: '2026-09-15',
    dayOfWeek: 'Tuesday',
    occasion: 'Engineers Day (M. Visvesvaraya Birth Anniversary)',
    contentType: 'Reel',
    contentBrief: 'Salute to the Problem Solvers. Fast-paced montage honoring mechanical, electrical, and software engineers driving India forward.',
    caption: '🛠️ "It is better to work out than to rust out." — Sir M. Visvesvaraya\n\nTo the engineers who calculate tolerances down to the micron, debug production pipelines at 3 AM, and write the algorithms that power modern commerce — Happy #EngineersDay!\n\nAt Goodwin, engineering isn\'t just a department; it\'s our philosophy.\n\nTag an engineer who makes impossible things run smoothly! 👇\n\n#EngineersDay2026 #EngineeringExcellence #GoodwinGrowAI #GoodwinBatteries #MVisvesvaraya #Builders',
    creativeStatus: 'Approved',
    approvalStatus: 'Approved',
    scheduledTime: '2026-09-15 09:30 AM',
    platforms: ['Instagram', 'LinkedIn', 'Facebook'],
    assignedTo: 'Ansh Chourasiya',
    postingStatus: 'Scheduled',
    createdAt: '2026-03-05T12:00:00.000Z',
    updatedAt: '2026-03-05T12:00:00.000Z'
  },

  // ── OCT 2026 (Festive Season) ──
  {
    id: 'cal_18',
    brand: 'Goodwin Batteries',
    date: '2026-10-02',
    dayOfWeek: 'Friday',
    occasion: 'Gandhi Jayanti & Swachh Bharat Divas',
    contentType: 'Post',
    contentBrief: 'Clean Energy & Self-Sufficiency Tribute. Inspiring quote on self-reliance and local manufacturing excellence.',
    caption: '🕊️ "The future depends on what you do today." — Mahatma Gandhi\n\nOn Gandhi Jayanti, we honor the timeless values of truth, self-reliance, and sustainable living.\n\nGoodwin Batteries continues to invest in zero-emission green recycling, clean energy storage, and self-sufficient Indian manufacturing.\n\nHappy Gandhi Jayanti to all! 🙏🇮🇳\n\n#GandhiJayanti #MahatmaGandhi #SwachhBharat #SelfReliance #GoodwinBatteries #CleanEnergy',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-10-02 08:30 AM',
    platforms: ['Instagram', 'Facebook', 'LinkedIn'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Posted',
    createdAt: '2026-09-28T08:00:00.000Z',
    updatedAt: '2026-10-02T08:35:00.000Z'
  },
  {
    id: 'cal_19',
    brand: 'Goodwin Batteries',
    date: '2026-10-11',
    dayOfWeek: 'Sunday',
    occasion: 'Navratri - 9 Days of Pure Power & Celebration',
    contentType: 'Carousel',
    contentBrief: '9 Days of Divine Energy: Celebrate Navratri with Zero Power Interruptions. Festive offer announcement & dealer locator.',
    caption: '🌸 Shubh Navratri! May Maa Durga bless your home with strength, vibrant health, and infinite positive energy!\n\nAs you illuminate your prayer rooms and dance through the joyous nights of Garba, ensure your home celebrations never face a power cut.\n\n🔋 Goodwin Tall Tubular Inverter Batteries:\n⚡️ Instant 8ms Auto-Switching\n⚡️ Extended 6 to 10 Hours of Continuous Backup\n⚡️ Special Festive Exchange Bonus at all authorized dealers\n\nVisit your nearest dealer today or call 1800-GOODWIN! 🪔✨\n\n#Navratri2026 #HappyNavratri #GarbaNights #GoodwinBatteries #FestiveEnergy #InverterBattery #DurgaPuja',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-10-11 08:00 AM',
    platforms: ['Instagram', 'Facebook', 'Google Business'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Scheduled',
    createdAt: '2026-09-30T10:00:00.000Z',
    updatedAt: '2026-09-30T10:00:00.000Z'
  },
  {
    id: 'cal_20',
    brand: 'Goodwin Batteries',
    date: '2026-10-20',
    dayOfWeek: 'Tuesday',
    occasion: 'Dussehra (Vijayadashami)',
    contentType: 'Post',
    contentBrief: 'Triumph of Reliability Over Darkness. Dramatic visual showing light conquering dark shadows with Goodwin battery in the center.',
    caption: '🏹 Celebrating the Eternal Triumph of Good over Evil, Light over Darkness!\n\nOn the auspicious day of Vijayadashami, destroy power failures, dim lights, and interrupted work with the unbeatable power of Goodwin Batteries.\n\nWishing you and your family victory, prosperity, and bright happiness this Dussehra! ✨\n\n#Dussehra2026 #Vijayadashami #GoodwinBatteries #TriumphOfLight #PowerOverDarkness #HappyDussehra',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-10-20 09:00 AM',
    platforms: ['Instagram', 'Facebook', 'Google Business'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Scheduled',
    createdAt: '2026-09-30T11:00:00.000Z',
    updatedAt: '2026-09-30T11:00:00.000Z'
  },
  {
    id: 'cal_21',
    brand: 'Goodwin Batteries',
    date: '2026-10-29',
    dayOfWeek: 'Thursday',
    occasion: 'Shubh Dhanteras Mega Exchange & Festive Gold Offers',
    contentType: 'Reel',
    contentBrief: 'Festive Dhanteras Buying Guide. Why buying heavy inverter batteries on Dhanteras brings auspicious long-term Lakshmi to your enterprise & home.',
    caption: '🪙 Bring Home the True Gold Standard of Power this Dhanteras!\n\nOn this sacred day of wealth and prosperity, invest in uninterrupted peace of mind for your family and business.\n\n✨ DHANTERAS SPECIAL FESTIVE OFFER ✨\nBring in your old battery of ANY brand and receive:\n💰 Up to ₹3,500 Instant Exchange Discount\n🛡️ Additional 6 Months Extended Warranty FREE\n🚚 Free Same-Day Home Delivery & Installation\n\nVisit your nearest Goodwin authorized outlet today! Happy Dhanteras! 🪔\n\n#Dhanteras2026 #ShubhDhanteras #DhanterasOffers #GoodwinBatteries #InverterExchange #FestiveDiscounts #DhanterasShopping',
    creativeStatus: 'In Progress',
    approvalStatus: 'Approved',
    scheduledTime: '2026-10-29 09:00 AM',
    platforms: ['Instagram', 'Facebook', 'Google Business'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Pending',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'cal_22',
    brand: 'Goodwin Batteries',
    date: '2026-10-31',
    dayOfWeek: 'Saturday',
    occasion: 'Diwali - The Grand Festival of Lights',
    contentType: 'Post',
    contentBrief: 'Grand Diwali Visual: A magnificent Indian home bathed in warm diyas and fairy lights with headline: "Zero Flicker. Zero Blackout. Pure Radiance with Goodwin."',
    caption: '🪔✨ Shubh Deepawali from the Goodwin Family to Yours! ✨🪔\n\nMay this festival of lights illuminate your lives with abundant health, prosperity, and joyous celebrations.\n\nWhile you light diyas and share sweets with loved ones, let Goodwin take care of the power. With heavy-duty tubular technology that outlasts the longest load-shedding, we guarantee zero flickers this Diwali night.\n\nHave a safe, vibrant, and prosperous Diwali! 🎆🌟\n\n#Diwali2026 #HappyDiwali #Deepawali #FestivalOfLights #GoodwinBatteries #ZeroBlackout #MadeInIndia #Celebrations',
    creativeStatus: 'Approved',
    approvalStatus: 'Approved',
    scheduledTime: '2026-10-31 08:00 AM',
    platforms: ['Instagram', 'Facebook', 'LinkedIn', 'Google Business'],
    assignedTo: 'Ansh Chourasiya',
    postingStatus: 'Scheduled',
    createdAt: '2026-10-01T11:00:00.000Z',
    updatedAt: '2026-10-01T11:00:00.000Z'
  },

  // ── NOV 2026 ──
  {
    id: 'cal_23',
    brand: 'Goodwin Batteries',
    date: '2026-11-06',
    dayOfWeek: 'Friday',
    occasion: 'Chhath Puja (Homage to the Sun God Surya)',
    contentType: 'Post',
    contentBrief: 'Sun God Surya Arghya Scene with Solar Battery Iconography. Emphasizing solar tubular batteries for rural and agricultural India.',
    caption: '🌅 Saluting the Infinite Power of Lord Surya on the sacred festival of Chhath Puja!\n\nJust as the Sun God bestows life and limitless energy upon the universe, Goodwin Solar Tubular batteries harness and store every ray of daylight to power your homes through the night.\n\nWarmest wishes on Chhath Puja to all devotees! ☀️🙏\n\n#ChhathPuja2026 #ChhathPooja #SuryaDev #SolarBattery #GoodwinBatteries #SolarPower #MadeInIndia',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-11-06 07:30 AM',
    platforms: ['Instagram', 'Facebook'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Scheduled',
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-01T12:00:00.000Z'
  },
  {
    id: 'cal_24',
    brand: 'Goodwin Grow AI',
    date: '2026-11-20',
    dayOfWeek: 'Friday',
    occasion: 'Black Friday & Cyber Week for Indian B2B SaaS',
    contentType: 'Carousel',
    contentBrief: 'Stop Paying for 7 Disconnected Software Subscriptions: The All-in-One Enterprise ERP Upgrade for Indian Businesses.',
    caption: '⚡️ Tired of paying ₹40,000/month across 6 different disjointed tools (CRM, invoicing, attendance app, inventory spreadsheet)?\n\nThis Cyber Week, consolidate your entire business stack under one unified, autonomous command center.\n\nSwipe to compare the cost and headache of fragmented apps vs Goodwin Grow AI ➡️\n\nLock in grandfathered enterprise pricing before Dec 31. Book your free demo at the link in bio! 🚀\n\n#CyberWeek #B2BSoftware #EnterpriseERP #GoodwinGrowAI #CostOptimization #BusinessSaaS',
    creativeStatus: 'Idea',
    approvalStatus: 'Pending',
    scheduledTime: '2026-11-20 10:30 AM',
    platforms: ['LinkedIn', 'Instagram'],
    assignedTo: 'Ansh Chourasiya',
    postingStatus: 'Pending',
    createdAt: '2026-10-01T13:00:00.000Z',
    updatedAt: '2026-10-01T13:00:00.000Z'
  },

  // ── DEC 2026 ──
  {
    id: 'cal_25',
    brand: 'Goodwin Batteries',
    date: '2026-12-14',
    dayOfWeek: 'Monday',
    occasion: 'National Energy Conservation Day',
    contentType: 'Carousel',
    contentBrief: '5 Practical Ways to Cut Your Electricity Bill by 22% Using Modern High-Efficiency Inverters. Infographic slides.',
    caption: '💡 Save Energy, Save Money, Save the Future.\n\nToday is #NationalEnergyConservationDay. Did you know an outdated, inefficient inverter battery can waste up to 25% of grid power during every charge cycle?\n\nHere are 5 tips to optimize your energy footprint:\n1️⃣ Use Grade-A Pure Sine Wave inverters to avoid phantom heat losses.\n2️⃣ Switch to Goodwin low-resistance tubular batteries with 93%+ charge acceptance.\n3️⃣ Clean solar panels bi-weekly to prevent 18% dust generation loss.\n4️⃣ Disconnect appliances drawing standby vampire load.\n5️⃣ Check terminal tightness twice a year.\n\nConserve energy, power progress. 🌱\n\n#EnergyConservationDay #SaveElectricity #EnergyEfficiency #GoodwinBatteries #GoGreen #SustainableLiving',
    creativeStatus: 'Ready',
    approvalStatus: 'Approved',
    scheduledTime: '2026-12-14 10:00 AM',
    platforms: ['LinkedIn', 'Instagram', 'Facebook'],
    assignedTo: 'Vikram Mehta',
    postingStatus: 'Scheduled',
    createdAt: '2026-10-01T14:00:00.000Z',
    updatedAt: '2026-10-01T14:00:00.000Z'
  },
  {
    id: 'cal_26',
    brand: 'Goodwin Grow AI',
    date: '2026-12-25',
    dayOfWeek: 'Friday',
    occasion: 'Christmas Day',
    contentType: 'Post',
    contentBrief: 'Festive Warmth & Year-End Gratitude. Celebrating clients, partners, and our community.',
    caption: '🎄 Warmest Holiday Greetings from Goodwin Grow AI!\n\nMay the spirit of Christmas fill your homes with peace, warmth, and boundless joy.\n\nTo all our incredible enterprise partners, clients, and hardworking teams across India: thank you for making 2026 an extraordinary year of transformation. Here’s to dreaming bigger and building bolder in 2027! 🎁✨\n\n#MerryChristmas2026 #HappyHolidays #GoodwinGrowAI #Gratitude #SeasonOfJoy',
    creativeStatus: 'Approved',
    approvalStatus: 'Approved',
    scheduledTime: '2026-12-25 09:00 AM',
    platforms: ['Instagram', 'LinkedIn', 'Facebook'],
    assignedTo: 'Sarah Connor',
    postingStatus: 'Scheduled',
    createdAt: '2026-10-01T15:00:00.000Z',
    updatedAt: '2026-10-01T15:00:00.000Z'
  },
  {
    id: 'cal_27',
    brand: 'Goodwin Grow AI',
    date: '2026-12-31',
    dayOfWeek: 'Thursday',
    occasion: 'New Year\'s Eve 2027 Countdown',
    contentType: 'Reel',
    contentBrief: '2026 Year in Review Video: 10 Million Operations Automated, 4,000+ Business Hours Saved, Zero Downtime.',
    caption: '🥂 Counting down to 2027!\n\n2026 was the year Indian enterprises stopped tolerating broken spreadsheets and embraced automated velocity.\n\n📈 Over 10M workflows executed\n📈 99.98% cloud uptime across 18 states\n📈 4,200+ hours saved for business owners\n\nWe are just getting started. Get ready for what’s coming in 2027! 🚀\n\n#NewYearsEve #Welcome2027 #YearInReview #GoodwinGrowAI #BuildingTheFuture #IndianTech',
    creativeStatus: 'In Progress',
    approvalStatus: 'Pending',
    scheduledTime: '2026-12-31 06:00 PM',
    platforms: ['Instagram', 'LinkedIn', 'Facebook'],
    assignedTo: 'Ansh Chourasiya',
    postingStatus: 'Pending',
    createdAt: '2026-10-01T15:30:00.000Z',
    updatedAt: '2026-10-01T15:30:00.000Z'
  }
];

// Helper to load from local storage
const loadLocalCalendar = (): CalendarEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_CALENDAR_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load local marketing calendar', e);
  }
  return INITIAL_CALENDAR_ENTRIES;
};

const saveLocalCalendar = (entries: CalendarEntry[]) => {
  try {
    localStorage.setItem(STORAGE_CALENDAR_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save local marketing calendar', e);
  }
};

interface MarketingCalendarState {
  entries: CalendarEntry[];
  selectedBrandFilter: string; // 'all' | 'Goodwin Batteries' | 'Goodwin Grow AI' | projectId
  selectedContentTypeFilter: string; // 'all' | ContentType
  selectedPlatformFilter: string; // 'all' | PlatformType
  selectedStatusFilter: string; // 'all' | PostingStatus
  searchQuery: string;
  isLoading: boolean;

  // Actions
  fetchEntries: () => Promise<void>;
  addEntry: (entry: Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt' | 'dayOfWeek'>) => Promise<CalendarEntry>;
  updateEntry: (id: string, updates: Partial<CalendarEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  togglePostingStatus: (id: string) => Promise<void>;
  setSelectedBrandFilter: (brand: string) => void;
  setSelectedContentTypeFilter: (type: string) => void;
  setSelectedPlatformFilter: (platform: string) => void;
  setSelectedStatusFilter: (status: string) => void;
  setSearchQuery: (query: string) => void;
  seedProjectEntries: (projectId: string, projectName: string, companyName?: string) => Promise<void>;
}

export const useMarketingCalendarStore = create<MarketingCalendarState>((set, get) => ({
  entries: loadLocalCalendar(),
  selectedBrandFilter: 'all',
  selectedContentTypeFilter: 'all',
  selectedPlatformFilter: 'all',
  selectedStatusFilter: 'all',
  searchQuery: '',
  isLoading: false,

  fetchEntries: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('marketing_calendar')
        .select('*')
        .order('date', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const remoteEntries: CalendarEntry[] = data.map((item: any) => ({
          id: item.id,
          projectId: item.project_id || undefined,
          projectName: item.project_name || '',
          brand: item.brand || 'Goodwin Batteries',
          date: item.date,
          dayOfWeek: item.day_of_week || getDayOfWeekName(item.date),
          occasion: item.occasion || '',
          contentType: (item.content_type as ContentType) || 'Post',
          contentBrief: item.content_brief || '',
          caption: item.caption || '',
          creativeStatus: (item.creative_status as CreativeStatus) || 'Idea',
          approvalStatus: (item.approval_status as ApprovalStatus) || 'Pending',
          scheduledTime: item.scheduled_time || '',
          platforms: Array.isArray(item.platforms) ? item.platforms : ['Instagram', 'Facebook'],
          assignedTo: item.assigned_to || '',
          postingStatus: (item.posting_status as PostingStatus) || 'Pending',
          tags: Array.isArray(item.tags) ? item.tags : [],
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString(),
        }));

        set((state) => {
          // Merge remote with local entries
          const remoteIds = new Set(remoteEntries.map((e) => e.id));
          const unsyncedLocal = state.entries.filter((e) => !remoteIds.has(e.id));
          const combined = [...unsyncedLocal, ...remoteEntries].sort((a, b) => a.date.localeCompare(b.date));
          saveLocalCalendar(combined);
          return { entries: combined, isLoading: false };
        });
      } else {
        // Keep local cache if remote table does not exist or is empty
        const current = get().entries;
        if (current.length === 0) {
          saveLocalCalendar(INITIAL_CALENDAR_ENTRIES);
          set({ entries: INITIAL_CALENDAR_ENTRIES, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      }
    } catch (e) {
      console.warn('Supabase marketing calendar fetch skipped, using local cache:', e);
      set({ isLoading: false });
    }
  },

  addEntry: async (input) => {
    const now = new Date().toISOString();
    const dayOfWeek = getDayOfWeekName(input.date);
    const newEntry: CalendarEntry = {
      ...input,
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'cal_' + Date.now(),
      dayOfWeek,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const updated = [...state.entries, newEntry].sort((a, b) => a.date.localeCompare(b.date));
      saveLocalCalendar(updated);
      return { entries: updated };
    });

    // Cloud sync in background
    try {
      await supabase.from('marketing_calendar').insert([{
        id: newEntry.id,
        project_id: newEntry.projectId || null,
        project_name: newEntry.projectName || '',
        brand: newEntry.brand,
        date: newEntry.date,
        day_of_week: newEntry.dayOfWeek,
        occasion: newEntry.occasion,
        content_type: newEntry.contentType,
        content_brief: newEntry.contentBrief,
        caption: newEntry.caption,
        creative_status: newEntry.creativeStatus,
        approval_status: newEntry.approvalStatus,
        scheduled_time: newEntry.scheduledTime,
        platforms: newEntry.platforms,
        assigned_to: newEntry.assignedTo,
        posting_status: newEntry.postingStatus,
        created_at: newEntry.createdAt,
        updated_at: newEntry.updatedAt,
      }]);
    } catch (e) {
      // ignore
    }

    return newEntry;
  },

  updateEntry: async (id, updates) => {
    const now = new Date().toISOString();
    set((state) => {
      const updated = state.entries.map((entry) => {
        if (entry.id !== id) return entry;
        const newDate = updates.date || entry.date;
        const newDayOfWeek = updates.date ? getDayOfWeekName(newDate) : entry.dayOfWeek;
        return {
          ...entry,
          ...updates,
          date: newDate,
          dayOfWeek: newDayOfWeek,
          updatedAt: now,
        };
      }).sort((a, b) => a.date.localeCompare(b.date));
      saveLocalCalendar(updated);
      return { entries: updated };
    });

    // Background sync to Supabase
    try {
      const dbPayload: any = { updated_at: now };
      if (updates.date !== undefined) {
        dbPayload.date = updates.date;
        dbPayload.day_of_week = getDayOfWeekName(updates.date);
      }
      if (updates.brand !== undefined) dbPayload.brand = updates.brand;
      if (updates.occasion !== undefined) dbPayload.occasion = updates.occasion;
      if (updates.contentType !== undefined) dbPayload.content_type = updates.contentType;
      if (updates.contentBrief !== undefined) dbPayload.content_brief = updates.contentBrief;
      if (updates.caption !== undefined) dbPayload.caption = updates.caption;
      if (updates.creativeStatus !== undefined) dbPayload.creative_status = updates.creativeStatus;
      if (updates.approvalStatus !== undefined) dbPayload.approval_status = updates.approvalStatus;
      if (updates.scheduledTime !== undefined) dbPayload.scheduled_time = updates.scheduledTime;
      if (updates.platforms !== undefined) dbPayload.platforms = updates.platforms;
      if (updates.assignedTo !== undefined) dbPayload.assigned_to = updates.assignedTo;
      if (updates.postingStatus !== undefined) dbPayload.posting_status = updates.postingStatus;
      if (updates.projectId !== undefined) dbPayload.project_id = updates.projectId || null;
      if (updates.projectName !== undefined) dbPayload.project_name = updates.projectName || '';

      await supabase.from('marketing_calendar').update(dbPayload).eq('id', id);
    } catch (e) {
      // ignore
    }
  },

  deleteEntry: async (id) => {
    set((state) => {
      const updated = state.entries.filter((entry) => entry.id !== id);
      saveLocalCalendar(updated);
      return { entries: updated };
    });

    try {
      await supabase.from('marketing_calendar').delete().eq('id', id);
    } catch (e) {
      // ignore
    }
  },

  togglePostingStatus: async (id) => {
    const entry = get().entries.find((e) => e.id === id);
    if (!entry) return;

    let nextStatus: PostingStatus = 'Pending';
    if (entry.postingStatus === 'Pending') nextStatus = 'Scheduled';
    else if (entry.postingStatus === 'Scheduled') nextStatus = 'Posted';
    else nextStatus = 'Pending';

    await get().updateEntry(id, { postingStatus: nextStatus });
  },

  setSelectedBrandFilter: (brand) => set({ selectedBrandFilter: brand }),
  setSelectedContentTypeFilter: (type) => set({ selectedContentTypeFilter: type }),
  setSelectedPlatformFilter: (platform) => set({ selectedPlatformFilter: platform }),
  setSelectedStatusFilter: (status) => set({ selectedStatusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  seedProjectEntries: async (projectId, projectName, companyName) => {
    const currentYear = new Date().getFullYear();
    const displayName = companyName ? `${companyName} (${projectName})` : projectName;
    const sampleMilestones: Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt' | 'dayOfWeek'>[] = [
      {
        projectId,
        projectName,
        brand: displayName,
        date: `${currentYear}-10-15`,
        occasion: `${projectName} — Official Feature Drop & Client Spotlight`,
        contentType: 'Carousel',
        contentBrief: `Milestone carousel showcasing the latest project deliverable, technical specs, and client value metric for ${displayName}.`,
        caption: `🚀 Big Milestone Alert for ${displayName}!\n\nWe are thrilled to roll out the latest phase of ${projectName}. Delivering high-reliability workflows, real-time sync, and scalable architecture.\n\nSwipe to see key operational metrics and client feedback ➡️\n\n#${projectName.replace(/\\s+/g, '')} #ProjectMilestone #ClientSuccess #GoodwinGrow`,
        creativeStatus: 'In Progress',
        approvalStatus: 'Approved',
        scheduledTime: `${currentYear}-10-15 11:00 AM`,
        platforms: ['LinkedIn', 'Instagram'],
        assignedTo: 'Ansh Chourasiya',
        postingStatus: 'Scheduled'
      },
      {
        projectId,
        projectName,
        brand: displayName,
        date: `${currentYear}-10-31`,
        occasion: `Diwali Client Festivities & Gratitude — ${projectName}`,
        contentType: 'Post',
        contentBrief: `Custom Diwali greeting card branded for ${displayName} celebrating the team partnership and festive goodwill.`,
        caption: `🪔 Wishing our esteemed partners at ${displayName} a sparkling, joyous, and prosperous Diwali!\n\nMay this festival of lights illuminate your path with triumph and continued success.\n\n#HappyDiwali #FestiveSeason #Partnership #GoodwinGrow`,
        creativeStatus: 'Ready',
        approvalStatus: 'Approved',
        scheduledTime: `${currentYear}-10-31 09:30 AM`,
        platforms: ['Instagram', 'Facebook', 'LinkedIn'],
        assignedTo: 'Sarah Connor',
        postingStatus: 'Scheduled'
      }
    ];

    for (const m of sampleMilestones) {
      await get().addEntry(m);
    }
  }
}));
