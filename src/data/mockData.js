/**
 * DATASTRAW SMART ROSTER MANAGEMENT SYSTEM
 * Comprehensive Seed Dataset:
 * - 36 Employees
 * - 4 Operational Pods (Alpha, Beta, Gamma, Delta)
 * - 4 Dedicated Pod Leads
 * - 4 Operational Processes (CS, ACC, RET, NDR)
 * - 15 Client Brands:
 *    - 12 Single-Resource Brands (80%)
 *    - 3 Multi-Resource Brands (20%)
 * - Process-Specific Operating Calendars (365-day, Daily w/o holidays, Standard Business)
 * - Public Holidays & Pre-approved Planned Leaves
 */

export const PODS = [
  {
    id: 'pod-alpha',
    name: 'Pod Alpha (Scale D2C)',
    lead_id: 'emp-01',
    lead_name: 'Aisha Sharma',
    color: '#0284c7', // Sky Blue
    description: 'High-volume consumer brands and rapid omni-channel scaling.'
  },
  {
    id: 'pod-beta',
    name: 'Pod Beta (Lifestyle & Fashion)',
    lead_id: 'emp-10',
    lead_name: 'Rohan Verma',
    color: '#8b5cf6', // Violet
    description: 'Premium apparel, sustainable fashion, and lifestyle merchandising.'
  },
  {
    id: 'pod-gamma',
    name: 'Pod Gamma (Health & Wellness)',
    lead_id: 'emp-19',
    lead_name: 'Priya Patel',
    color: '#10b981', // Emerald
    description: 'Nutraceuticals, organic supplements, and pet health products.'
  },
  {
    id: 'pod-delta',
    name: 'Pod Delta (Tech & Home Goods)',
    lead_id: 'emp-28',
    lead_name: 'Vikram Malhotra',
    color: '#f59e0b', // Amber
    description: 'Smart consumer electronics, home automation, and kitchenware.'
  }
];

export const PROCESSES = [
  {
    id: 'CS',
    code: 'CS',
    name: 'Customer Support',
    description: 'Frontline live chat, email resolution, and omnichannel ticket triage.',
    color: '#0284c7' // Blue
  },
  {
    id: 'ACC',
    code: 'ACC',
    name: 'Abandoned Cart Conversions',
    description: 'Outbound recovery, WhatsApp nudges, and promotional discount recovery.',
    color: '#8b5cf6' // Violet
  },
  {
    id: 'RET',
    code: 'RET',
    name: 'Customer Retention & VIP',
    description: 'High-LTV subscription retention, proactive churn prevention, and VIP tier care.',
    color: '#10b981' // Green
  },
  {
    id: 'NDR',
    code: 'NDR',
    name: 'Non-Delivery Report Management',
    description: 'Courier escalation, address re-verification, and RTO reduction workflows.',
    color: '#f59e0b' // Amber
  }
];

export const EMPLOYEES = [
  // -------------------------------------------------------------
  // POD ALPHA: 9 EMPLOYEES (emp-01 to emp-09)
  // -------------------------------------------------------------
  {
    id: 'emp-01',
    name: 'Aisha Sharma',
    email: 'aisha.sharma@datastraw.io',
    role: 'Pod Lead',
    pod_id: 'pod-alpha',
    skills: ['CS', 'ACC', 'RET', 'NDR'],
    weekly_off_preference: 0, // Sunday
    weekly_offs_quota: 4,
    avatar_color: '#0284c7'
  },
  {
    id: 'emp-02',
    name: 'Kabir Mehta',
    email: 'kabir.mehta@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-alpha',
    skills: ['CS', 'ACC', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#0ea5e9'
  },
  {
    id: 'emp-03',
    name: 'Ananya Rao',
    email: 'ananya.rao@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-alpha',
    skills: ['CS', 'ACC', 'RET'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#38bdf8'
  },
  {
    id: 'emp-04',
    name: 'Devansh Joshi',
    email: 'devansh.joshi@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-alpha',
    skills: ['CS', 'NDR'],
    weekly_off_preference: 6, // Saturday
    weekly_offs_quota: 4,
    avatar_color: '#06b6d4'
  },
  {
    id: 'emp-05',
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@datastraw.io',
    role: 'Senior Specialist',
    pod_id: 'pod-alpha',
    skills: ['CS', 'ACC', 'RET', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#0284c7'
  },
  {
    id: 'emp-06',
    name: 'Arjun Nair',
    email: 'arjun.nair@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-alpha',
    skills: ['ACC', 'RET'],
    weekly_off_preference: 1, // Monday
    weekly_offs_quota: 4,
    avatar_color: '#0369a1'
  },
  {
    id: 'emp-07',
    name: 'Tanvi Deshmukh',
    email: 'tanvi.deshmukh@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-alpha',
    skills: ['NDR', 'RET'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#075985'
  },
  {
    id: 'emp-08',
    name: 'Rishi Kapoor',
    email: 'rishi.kapoor@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-alpha',
    skills: ['CS', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#0c4a6e'
  },
  {
    id: 'emp-09',
    name: 'Meera Iyer',
    email: 'meera.iyer@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-alpha',
    skills: ['CS', 'ACC'],
    weekly_off_preference: 6,
    weekly_offs_quota: 4,
    avatar_color: '#38bdf8'
  },

  // -------------------------------------------------------------
  // POD BETA: 9 EMPLOYEES (emp-10 to emp-18)
  // -------------------------------------------------------------
  {
    id: 'emp-10',
    name: 'Rohan Verma',
    email: 'rohan.verma@datastraw.io',
    role: 'Pod Lead',
    pod_id: 'pod-beta',
    skills: ['CS', 'ACC', 'RET', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#8b5cf6'
  },
  {
    id: 'emp-11',
    name: 'Pooja Hegde',
    email: 'pooja.hegde@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-beta',
    skills: ['CS', 'ACC', 'RET', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#a78bfa'
  },
  {
    id: 'emp-12',
    name: 'Aditya Sen',
    email: 'aditya.sen@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-beta',
    skills: ['CS', 'ACC', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#7c3aed'
  },
  {
    id: 'emp-13',
    name: 'Kavya Menon',
    email: 'kavya.menon@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-beta',
    skills: ['CS', 'RET', 'NDR'],
    weekly_off_preference: 6,
    weekly_offs_quota: 4,
    avatar_color: '#6d28d9'
  },
  {
    id: 'emp-14',
    name: 'Manish Pandey',
    email: 'manish.pandey@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-beta',
    skills: ['CS', 'ACC'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#c4b5fd'
  },
  {
    id: 'emp-15',
    name: 'Neha Singhal',
    email: 'neha.singhal@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-beta',
    skills: ['ACC', 'RET'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#8b5cf6'
  },
  {
    id: 'emp-16',
    name: 'Karan Chawla',
    email: 'karan.chawla@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-beta',
    skills: ['CS', 'NDR'],
    weekly_off_preference: 2, // Tuesday
    weekly_offs_quota: 4,
    avatar_color: '#7c3aed'
  },
  {
    id: 'emp-17',
    name: 'Divya Nambiar',
    email: 'divya.nambiar@datastraw.io',
    role: 'Senior Specialist',
    pod_id: 'pod-beta',
    skills: ['CS', 'ACC', 'RET', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#5b21b6'
  },
  {
    id: 'emp-18',
    name: 'Varun Grover',
    email: 'varun.grover@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-beta',
    skills: ['CS', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#a78bfa'
  },

  // -------------------------------------------------------------
  // POD GAMMA: 9 EMPLOYEES (emp-19 to emp-27)
  // -------------------------------------------------------------
  {
    id: 'emp-19',
    name: 'Priya Patel',
    email: 'priya.patel@datastraw.io',
    role: 'Pod Lead',
    pod_id: 'pod-gamma',
    skills: ['CS', 'ACC', 'RET', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#10b981'
  },
  {
    id: 'emp-20',
    name: 'Siddharth Basu',
    email: 'siddharth.basu@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-gamma',
    skills: ['CS', 'ACC', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#34d399'
  },
  {
    id: 'emp-21',
    name: 'Ritika Sharma',
    email: 'ritika.sharma@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-gamma',
    skills: ['CS', 'RET'],
    weekly_off_preference: 6,
    weekly_offs_quota: 4,
    avatar_color: '#059669'
  },
  {
    id: 'emp-22',
    name: 'Nikhil Saxena',
    email: 'nikhil.saxena@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-gamma',
    skills: ['CS', 'ACC', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#047857'
  },
  {
    id: 'emp-23',
    name: 'Ishaan Gupta',
    email: 'ishaan.gupta@datastraw.io',
    role: 'Senior Specialist',
    pod_id: 'pod-gamma',
    skills: ['CS', 'ACC'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#10b981'
  },
  {
    id: 'emp-24',
    name: 'Bhavna Reddy',
    email: 'bhavna.reddy@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-gamma',
    skills: ['CS', 'ACC', 'RET'],
    weekly_off_preference: 3, // Wednesday
    weekly_offs_quota: 4,
    avatar_color: '#065f46'
  },
  {
    id: 'emp-25',
    name: 'Kunal Ghosh',
    email: 'kunal.ghosh@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-gamma',
    skills: ['NDR', 'CS'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#6ee7b7'
  },
  {
    id: 'emp-26',
    name: 'Shreya Roy',
    email: 'shreya.roy@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-gamma',
    skills: ['RET', 'ACC'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#34d399'
  },
  {
    id: 'emp-27',
    name: 'Deepak Agarwal',
    email: 'deepak.agarwal@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-gamma',
    skills: ['CS', 'NDR'],
    weekly_off_preference: 6,
    weekly_offs_quota: 4,
    avatar_color: '#059669'
  },

  // -------------------------------------------------------------
  // POD DELTA: 9 EMPLOYEES (emp-28 to emp-36)
  // -------------------------------------------------------------
  {
    id: 'emp-28',
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@datastraw.io',
    role: 'Pod Lead',
    pod_id: 'pod-delta',
    skills: ['CS', 'ACC', 'RET', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#f59e0b'
  },
  {
    id: 'emp-29',
    name: 'Payal Sengupta',
    email: 'payal.sengupta@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-delta',
    skills: ['CS', 'ACC', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#fbbf24'
  },
  {
    id: 'emp-30',
    name: 'Gaurav Bhasin',
    email: 'gaurav.bhasin@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-delta',
    skills: ['CS', 'RET', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#d97706'
  },
  {
    id: 'emp-31',
    name: 'Aakanksha Jain',
    email: 'aakanksha.jain@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-delta',
    skills: ['CS', 'ACC', 'RET'],
    weekly_off_preference: 6,
    weekly_offs_quota: 4,
    avatar_color: '#b45309'
  },
  {
    id: 'emp-32',
    name: 'Rohit Namboodiri',
    email: 'rohit.namboodiri@datastraw.io',
    role: 'Senior Specialist',
    pod_id: 'pod-delta',
    skills: ['CS', 'NDR'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#f59e0b'
  },
  {
    id: 'emp-33',
    name: 'Simran Walia',
    email: 'simran.walia@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-delta',
    skills: ['CS', 'RET'],
    weekly_off_preference: 4, // Thursday
    weekly_offs_quota: 4,
    avatar_color: '#fcd34d'
  },
  {
    id: 'emp-34',
    name: 'Farhan Zaidi',
    email: 'farhan.zaidi@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-delta',
    skills: ['NDR', 'ACC'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#92400e'
  },
  {
    id: 'emp-35',
    name: 'Jaspreet Kaur',
    email: 'jaspreet.kaur@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-delta',
    skills: ['CS', 'ACC'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#f59e0b'
  },
  {
    id: 'emp-36',
    name: 'Tushar Dixit',
    email: 'tushar.dixit@datastraw.io',
    role: 'Operations Specialist',
    pod_id: 'pod-delta',
    skills: ['CS', 'NDR', 'RET'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#d97706'
  }
];

export const BRANDS = [
  // -------------------------------------------------------------
  // 12 SINGLE-RESOURCE BRANDS (~80% of 15 Brands)
  // Each has ONE dedicated employee handling all processes
  // -------------------------------------------------------------
  {
    id: 'brand-01',
    code: 'GLOW',
    name: 'GlowAura Skincare',
    pod_id: 'pod-alpha',
    is_single_resource: true,
    color: '#0284c7',
    description: 'Clean clinical dermo-cosmetics with high daily inquiry volume.'
  },
  {
    id: 'brand-02',
    code: 'BEAN',
    name: 'BeanCraft Specialty Coffee',
    pod_id: 'pod-alpha',
    is_single_resource: true,
    color: '#0ea5e9',
    description: 'Artisanal single-origin beans and cold-brew subscription box.'
  },
  {
    id: 'brand-03',
    code: 'URBN',
    name: 'UrbanKicks Footwear',
    pod_id: 'pod-alpha',
    is_single_resource: true,
    color: '#38bdf8',
    description: 'Gen-Z streetwear sneakers with high NDR exchange spikes.'
  },
  {
    id: 'brand-04',
    code: 'NUTRI',
    name: 'NutriPulse Superfoods',
    pod_id: 'pod-beta',
    is_single_resource: true,
    color: '#8b5cf6',
    description: 'Ayurvedic effervescent nutrition and plant-based protein blends.'
  },
  {
    id: 'brand-05',
    code: 'LUMI',
    name: 'Lumina Smart Lighting',
    pod_id: 'pod-beta',
    is_single_resource: true,
    color: '#a78bfa',
    description: 'IoT ambient smart strips and automated home circadian bulbs.'
  },
  {
    id: 'brand-06',
    code: 'ARTI',
    name: 'Artisanal Living',
    pod_id: 'pod-beta',
    is_single_resource: true,
    color: '#7c3aed',
    description: 'Handcrafted stoneware ceramics and organic linen homeware.'
  },
  {
    id: 'brand-07',
    code: 'PETS',
    name: 'PureBite Pet Nutrition',
    pod_id: 'pod-gamma',
    is_single_resource: true,
    color: '#10b981',
    description: 'Freeze-dried raw pet treats with mandatory fresh batch dispatch tracking.'
  },
  {
    id: 'brand-08',
    code: 'VELOX',
    name: 'Velox Esports Gear',
    pod_id: 'pod-gamma',
    is_single_resource: true,
    color: '#059669',
    description: 'Custom mechanical keyboards and esports low-latency peripherals.'
  },
  {
    id: 'brand-09',
    code: 'SILK',
    name: 'Silk & Saffron Luxury',
    pod_id: 'pod-gamma',
    is_single_resource: true,
    color: '#34d399',
    description: 'Ultra-luxury saffron serums and botanical anti-aging elixirs.'
  },
  {
    id: 'brand-10',
    code: 'PEAK',
    name: 'PeakDrift Technical Apparel',
    pod_id: 'pod-delta',
    is_single_resource: true,
    color: '#f59e0b',
    description: 'All-weather mountain trekking gear and thermal activewear.'
  },
  {
    id: 'brand-11',
    code: 'ZEN',
    name: 'ZenGarden Bonsai & Plants',
    pod_id: 'pod-delta',
    is_single_resource: true,
    color: '#fbbf24',
    description: 'Live bonsai shipping, moisture guarantees, and plant wellness chat.'
  },
  {
    id: 'brand-12',
    code: 'CLEAN',
    name: 'SparkleClean Living',
    pod_id: 'pod-delta',
    is_single_resource: true,
    color: '#d97706',
    description: 'Zero-plastic household laundry sheets and probiotic surface cleansers.'
  },

  // -------------------------------------------------------------
  // 3 MULTI-RESOURCE BRANDS (~20% of 15 Brands)
  // Assigned to 2 or 3 employees with shared or separate processes
  // -------------------------------------------------------------
  {
    id: 'brand-13',
    code: 'AURA',
    name: 'AuraFit Activewear (Scale)',
    pod_id: 'pod-alpha',
    is_single_resource: false,
    color: '#0284c7',
    description: 'High-volume international activewear; multi-agent team across CS, ACC, NDR.'
  },
  {
    id: 'brand-14',
    code: 'NOVA',
    name: 'NovaGlow Electronics',
    pod_id: 'pod-gamma',
    is_single_resource: false,
    color: '#10b981',
    description: 'High-ticket audio devices; 2 agents sharing CS and dedicated ACC.'
  },
  {
    id: 'brand-15',
    code: 'PRIME',
    name: 'PrimeWave Direct Logistics',
    pod_id: 'pod-delta',
    is_single_resource: false,
    color: '#f59e0b',
    description: '3-agent team with overlapping 365-day CS and dedicated NDR/Retention.'
  }
];

export const BRAND_PROCESS_RULES = [
  // Brand 1: GlowAura Skincare (Single Resource: emp-02)
  // CS is 365 days; ACC/NDR operates Mon-Sat
  { id: 'bp-01-cs', brand_id: 'brand-01', process_id: 'CS', operating_calendar: '365_days', min_headcount: 1, weekend_min_headcount: 1 },
  { id: 'bp-01-acc', brand_id: 'brand-01', process_id: 'ACC', operating_calendar: 'daily_no_holidays', min_headcount: 1, weekend_min_headcount: 1 },
  { id: 'bp-01-ndr', brand_id: 'brand-01', process_id: 'NDR', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 },

  // Brand 2: BeanCraft Coffee (Single Resource: emp-03)
  { id: 'bp-02-cs', brand_id: 'brand-02', process_id: 'CS', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 },
  { id: 'bp-02-acc', brand_id: 'brand-02', process_id: 'ACC', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 },

  // Brand 3: UrbanKicks (Single Resource: emp-04)
  { id: 'bp-03-cs', brand_id: 'brand-03', process_id: 'CS', operating_calendar: 'daily_no_holidays', min_headcount: 1, weekend_min_headcount: 1 },
  { id: 'bp-03-ndr', brand_id: 'brand-03', process_id: 'NDR', operating_calendar: 'daily_no_holidays', min_headcount: 1, weekend_min_headcount: 1 },

  // Brand 4: NutriPulse (Single Resource: emp-11)
  { id: 'bp-04-cs', brand_id: 'brand-04', process_id: 'CS', operating_calendar: '365_days', min_headcount: 1, weekend_min_headcount: 1 },
  { id: 'bp-04-acc', brand_id: 'brand-04', process_id: 'ACC', operating_calendar: 'daily_no_holidays', min_headcount: 1, weekend_min_headcount: 1 },

  // Brand 5: Lumina Smart Lighting (Single Resource: emp-12)
  { id: 'bp-05-cs', brand_id: 'brand-05', process_id: 'CS', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 },

  // Brand 6: Artisanal Living (Single Resource: emp-13)
  { id: 'bp-06-cs', brand_id: 'brand-06', process_id: 'CS', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 },

  // Brand 7: PureBite Pet Care (Single Resource: emp-20)
  { id: 'bp-07-cs', brand_id: 'brand-07', process_id: 'CS', operating_calendar: 'daily_no_holidays', min_headcount: 1, weekend_min_headcount: 1 },
  { id: 'bp-07-ndr', brand_id: 'brand-07', process_id: 'NDR', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 },

  // Brand 8: Velox Gaming (Single Resource: emp-21)
  { id: 'bp-08-cs', brand_id: 'brand-08', process_id: 'CS', operating_calendar: 'daily_no_holidays', min_headcount: 1, weekend_min_headcount: 1 },

  // Brand 9: Silk & Saffron (Single Resource: emp-22)
  { id: 'bp-09-cs', brand_id: 'brand-09', process_id: 'CS', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 },
  { id: 'bp-09-ret', brand_id: 'brand-09', process_id: 'RET', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 },

  // Brand 10: PeakDrift Apparel (Single Resource: emp-29)
  { id: 'bp-10-cs', brand_id: 'brand-10', process_id: 'CS', operating_calendar: 'daily_no_holidays', min_headcount: 1, weekend_min_headcount: 1 },

  // Brand 11: ZenGarden (Single Resource: emp-30)
  { id: 'bp-11-cs', brand_id: 'brand-11', process_id: 'CS', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 },

  // Brand 12: SparkleClean (Single Resource: emp-31)
  { id: 'bp-12-cs', brand_id: 'brand-12', process_id: 'CS', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 },

  // Brand 13: AuraFit Activewear (MULTI-RESOURCE: 3 employees: emp-05, emp-06, emp-07)
  // CS requires min 2 headcount and 365-day operation!
  { id: 'bp-13-cs', brand_id: 'brand-13', process_id: 'CS', operating_calendar: '365_days', min_headcount: 2, weekend_min_headcount: 1 },
  { id: 'bp-13-acc', brand_id: 'brand-13', process_id: 'ACC', operating_calendar: 'daily_no_holidays', min_headcount: 1, weekend_min_headcount: 1 },
  { id: 'bp-13-ndr', brand_id: 'brand-13', process_id: 'NDR', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 },

  // Brand 14: NovaGlow Electronics (MULTI-RESOURCE: 2 employees: emp-23, emp-24)
  { id: 'bp-14-cs', brand_id: 'brand-14', process_id: 'CS', operating_calendar: '365_days', min_headcount: 1, weekend_min_headcount: 1 },
  { id: 'bp-14-acc', brand_id: 'brand-14', process_id: 'ACC', operating_calendar: 'daily_no_holidays', min_headcount: 1, weekend_min_headcount: 0 },

  // Brand 15: PrimeWave Logistics (MULTI-RESOURCE: 3 employees: emp-32, emp-33, emp-34)
  { id: 'bp-15-cs', brand_id: 'brand-15', process_id: 'CS', operating_calendar: '365_days', min_headcount: 1, weekend_min_headcount: 1 },
  { id: 'bp-15-ndr', brand_id: 'brand-15', process_id: 'NDR', operating_calendar: '365_days', min_headcount: 1, weekend_min_headcount: 1 },
  { id: 'bp-15-ret', brand_id: 'brand-15', process_id: 'RET', operating_calendar: 'standard_business', min_headcount: 1, weekend_min_headcount: 0 }
];

export const EMPLOYEE_ASSIGNMENTS = [
  // 12 SINGLE-RESOURCE BRAND ASSIGNMENTS (1 Dedicated Specialist Per Brand)
  { id: 'assign-01', employee_id: 'emp-02', brand_id: 'brand-01', process_id: 'CS', is_primary: true },
  { id: 'assign-02', employee_id: 'emp-02', brand_id: 'brand-01', process_id: 'ACC', is_primary: true },
  { id: 'assign-03', employee_id: 'emp-02', brand_id: 'brand-01', process_id: 'NDR', is_primary: true },

  { id: 'assign-04', employee_id: 'emp-03', brand_id: 'brand-02', process_id: 'CS', is_primary: true },
  { id: 'assign-05', employee_id: 'emp-03', brand_id: 'brand-02', process_id: 'ACC', is_primary: true },

  { id: 'assign-06', employee_id: 'emp-04', brand_id: 'brand-03', process_id: 'CS', is_primary: true },
  { id: 'assign-07', employee_id: 'emp-04', brand_id: 'brand-03', process_id: 'NDR', is_primary: true },

  { id: 'assign-08', employee_id: 'emp-11', brand_id: 'brand-04', process_id: 'CS', is_primary: true },
  { id: 'assign-09', employee_id: 'emp-11', brand_id: 'brand-04', process_id: 'ACC', is_primary: true },

  { id: 'assign-10', employee_id: 'emp-12', brand_id: 'brand-05', process_id: 'CS', is_primary: true },

  { id: 'assign-11', employee_id: 'emp-13', brand_id: 'brand-06', process_id: 'CS', is_primary: true },

  { id: 'assign-12', employee_id: 'emp-20', brand_id: 'brand-07', process_id: 'CS', is_primary: true },
  { id: 'assign-13', employee_id: 'emp-20', brand_id: 'brand-07', process_id: 'NDR', is_primary: true },

  { id: 'assign-14', employee_id: 'emp-21', brand_id: 'brand-08', process_id: 'CS', is_primary: true },

  { id: 'assign-15', employee_id: 'emp-22', brand_id: 'brand-09', process_id: 'CS', is_primary: true },
  { id: 'assign-16', employee_id: 'emp-22', brand_id: 'brand-09', process_id: 'RET', is_primary: true },

  { id: 'assign-17', employee_id: 'emp-29', brand_id: 'brand-10', process_id: 'CS', is_primary: true },

  { id: 'assign-18', employee_id: 'emp-30', brand_id: 'brand-11', process_id: 'CS', is_primary: true },

  { id: 'assign-19', employee_id: 'emp-31', brand_id: 'brand-12', process_id: 'CS', is_primary: true },

  // 3 MULTI-RESOURCE BRANDS ASSIGNMENTS
  // Brand 13: AuraFit Activewear (emp-05 CS/General, emp-06 ACC/CS, emp-07 NDR/RET)
  { id: 'assign-20', employee_id: 'emp-05', brand_id: 'brand-13', process_id: 'CS', is_primary: true },
  { id: 'assign-21', employee_id: 'emp-06', brand_id: 'brand-13', process_id: 'CS', is_primary: true },
  { id: 'assign-22', employee_id: 'emp-06', brand_id: 'brand-13', process_id: 'ACC', is_primary: true },
  { id: 'assign-23', employee_id: 'emp-07', brand_id: 'brand-13', process_id: 'NDR', is_primary: true },

  // Brand 14: NovaGlow Electronics (emp-23 CS/ACC, emp-24 CS/RET)
  { id: 'assign-24', employee_id: 'emp-23', brand_id: 'brand-14', process_id: 'CS', is_primary: true },
  { id: 'assign-25', employee_id: 'emp-23', brand_id: 'brand-14', process_id: 'ACC', is_primary: true },
  { id: 'assign-26', employee_id: 'emp-24', brand_id: 'brand-14', process_id: 'CS', is_primary: true },

  // Brand 15: PrimeWave Logistics (emp-32 CS/NDR, emp-33 CS/RET, emp-34 NDR/ACC)
  { id: 'assign-27', employee_id: 'emp-32', brand_id: 'brand-15', process_id: 'CS', is_primary: true },
  { id: 'assign-28', employee_id: 'emp-32', brand_id: 'brand-15', process_id: 'NDR', is_primary: true },
  { id: 'assign-29', employee_id: 'emp-33', brand_id: 'brand-15', process_id: 'CS', is_primary: true },
  { id: 'assign-30', employee_id: 'emp-33', brand_id: 'brand-15', process_id: 'RET', is_primary: true },
  { id: 'assign-31', employee_id: 'emp-34', brand_id: 'brand-15', process_id: 'NDR', is_primary: true }
];

export const PUBLIC_HOLIDAYS_2026 = [
  { id: 'ph-01', date: '2026-01-26', name: 'Republic Day', description: 'National Holiday' },
  { id: 'ph-02', date: '2026-03-25', name: 'Holi', description: 'Festival Holiday' },
  { id: 'ph-03', date: '2026-08-15', name: 'Independence Day', description: 'National Holiday' },
  { id: 'ph-04', date: '2026-10-02', name: 'Gandhi Jayanti', description: 'National Holiday' },
  { id: 'ph-05', date: '2026-11-01', name: 'Regional State Day', description: 'State Holiday (Observed in Nov)' },
  { id: 'ph-06', date: '2026-11-14', name: 'Diwali Festival', description: 'Major Holiday (Observed in Nov)' },
  { id: 'ph-07', date: '2026-12-25', name: 'Christmas Day', description: 'Global Holiday' }
];

export const INITIAL_LEAVES = [
  // Sample planned leaves for November 2026 testing
  {
    id: 'leave-01',
    employee_id: 'emp-02', // GlowAura Single Resource! (Will test conflict / backup substitution in P5/P9)
    start_date: '2026-11-10',
    end_date: '2026-11-11',
    leave_type: 'planned_leave',
    status: 'approved',
    reason: 'Family wedding commitment'
  },
  {
    id: 'leave-02',
    employee_id: 'emp-06', // AuraFit ACC specialist (multi-resource brand)
    start_date: '2026-11-18',
    end_date: '2026-11-19',
    leave_type: 'planned_leave',
    status: 'approved',
    reason: 'Personal medical leave'
  },
  {
    id: 'leave-03',
    employee_id: 'emp-23', // NovaGlow Senior Specialist
    start_date: '2026-11-05',
    end_date: '2026-11-06',
    leave_type: 'planned_leave',
    status: 'approved',
    reason: 'Travel and relocation'
  }
];

export const INITIAL_COMP_OFFS = [
  {
    id: 'comp-01',
    employee_id: 'emp-05',
    date: '2026-11-16',
    earned_reason: 'Worked on Diwali Festival mandatory 365-day shift (2026-11-14)',
    status: 'approved'
  }
];
