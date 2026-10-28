// src/app/models/sample-profile.ts
// Template gallery thumbnails mate FAKE sample data - user na real data kyay nathi vaprai.
// Aa data actual template layout ma feed thay ne chhoti size ma render thay.

import {
  Profile, TemplateId, DEFAULT_GDPR_CONSENT, DEFAULT_SECTION_ICONS, DEFAULT_SECTION_LABELS,
  SectionIcons, SectionLabels,
} from './profile.model';

// Simple avatar placeholders (SVG data-URIs) for templates that show a photo
const avatar = (bg: string, skin: string, hair: string) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}"/>` +
    `<path d="M14 100c2-24 18-34 36-34s34 10 36 34z" fill="#2b3a55"/>` +
    `<rect x="42" y="52" width="16" height="16" rx="6" fill="${skin}"/>` +
    `<ellipse cx="50" cy="40" rx="17" ry="20" fill="${skin}"/>` +
    `<path d="M32 38c0-16 10-22 20-22 12 0 18 9 16 24-3-8-8-12-18-12-8 0-14 3-18 10z" fill="${hair}"/></svg>`);

export interface TemplateOption {
  id: TemplateId;
  label: string;
}

/** The 6 designs shown in the template gallery (same order as the design sheet). */
export const TEMPLATE_OPTIONS: TemplateOption[] = [
  { id: 'template-four',  label: 'Minimal' },
  { id: 'template-five',  label: 'Professional' },
  { id: 'template-three', label: 'Elegant' },
  { id: 'template-six',   label: 'Botanical' },
  { id: 'template-seven', label: 'Executive' },
  { id: 'template-eight', label: 'Clean' },
  { id: 'template-nine',  label: 'Creative' },
];

/** Font / colours applied when the user picks a template so it looks exactly like the gallery card. */
export const TEMPLATE_PRESETS: Record<TemplateId, {
  font: string; primaryColor: string; accentColor: string; icons: boolean;
}> = {
  'template-one':   { font: 'Segoe UI, sans-serif',    primaryColor: '#111827', accentColor: '#4f46e5', icons: false },
  'template-two':   { font: 'Segoe UI, sans-serif',    primaryColor: '#111827', accentColor: '#16a34a', icons: false },
  'template-three': { font: 'Segoe UI, sans-serif',    primaryColor: '#0f172a', accentColor: '#fbbf24', icons: false },
  'template-four':  { font: "'Roboto Slab', serif",    primaryColor: '#111827', accentColor: '#111827', icons: false },
  'template-five':  { font: "'Merriweather', serif",   primaryColor: '#e5e7eb', accentColor: '#374151', icons: false },
  'template-six':   { font: "'Poppins', sans-serif",   primaryColor: '#111827', accentColor: '#1f5a36', icons: false },
  'template-seven': { font: "'Roboto Slab', serif",    primaryColor: '#1b3448', accentColor: '#1b3448', icons: true  },
  'template-eight': { font: "'Merriweather', serif",   primaryColor: '#1e3a5f', accentColor: '#1e3a5f', icons: false },
  'template-nine':  { font: "'Poppins', sans-serif",   primaryColor: '#16233f', accentColor: '#f7d747', icons: false },
};

/** natural header layout of each design (what the gallery card looks like) */
export const TEMPLATE_HEADER_DEFAULTS: Record<TemplateId, {
  headerAlign: 'left' | 'center'; detailsArrangement: 'stacked' | 'inline' | 'columns'; titlePosition: 'same-line' | 'below';
  headingStyle?: { style: number; capitalization: 'capitalize' | 'uppercase'; icons: 'none' | 'outline' | 'filled' };
}> = {
  'template-one':   { headerAlign: 'left',   detailsArrangement: 'stacked', titlePosition: 'below' },
  'template-two':   { headerAlign: 'left',   detailsArrangement: 'inline',  titlePosition: 'below' },
  'template-three': { headerAlign: 'left',   detailsArrangement: 'stacked', titlePosition: 'below' },
  'template-four':  { headerAlign: 'center', detailsArrangement: 'inline',  titlePosition: 'below' },
  'template-five':  { headerAlign: 'left',   detailsArrangement: 'inline',  titlePosition: 'below' },
  'template-six':   { headerAlign: 'left',   detailsArrangement: 'inline',  titlePosition: 'below' },
  'template-seven': { headerAlign: 'left',   detailsArrangement: 'inline',  titlePosition: 'same-line' },
  'template-eight': { headerAlign: 'left',   detailsArrangement: 'columns', titlePosition: 'same-line' },
  'template-nine':  { headerAlign: 'left',   detailsArrangement: 'stacked', titlePosition: 'below', headingStyle: { style: 0, capitalization: 'capitalize', icons: 'filled' } },
};

const html = (items: string[]) => '<ul>' + items.map((i) => `<li>${i}</li>`).join('') + '</ul>';

const base = {
  gdprConsent: '',
  headerAlign: 'left' as const,
  detailsArrangement: 'stacked' as const,
  detailsSeparator: 'icon' as const,
  iconStyle: 0,
  nameStyle: 'bold' as const,
  titleStyle: 'normal' as const,
  titlePosition: 'below' as const,
  socialLinks: { linkedin: '', github: '', portfolio: '', twitter: '' },
  coreCompetencies: [] as string[],
  interests: [] as string[],
  certificates: [] as string[],
  languages: [] as { name: string; level: number }[],
};

const allIcons = (visible: boolean): SectionIcons =>
  Object.fromEntries(
    (Object.keys(DEFAULT_SECTION_ICONS) as (keyof SectionLabels)[]).map((k) => [
      k, { ...DEFAULT_SECTION_ICONS[k], visible },
    ])
  ) as SectionIcons;

const labels = (over: Partial<SectionLabels>): SectionLabels => ({ ...DEFAULT_SECTION_LABELS, ...over });

// ── Original samples (Classic / Modern / Elegant) ───────────────────────────
const alex: Omit<Profile, 'template'> = {
  ...base,
  fullName: 'Alex Carter',
  professionalTitle: 'Product Designer',
  email: 'alex.carter@example.com',
  phone: '+1 555-123-4567',
  location: 'San Francisco, CA',
  aboutMe:
    'Creative product designer with 5+ years of experience crafting user-centered digital experiences across web and mobile platforms.',
  gdprConsent: DEFAULT_GDPR_CONSENT,
  font: 'Segoe UI, sans-serif',
  education: [
    { degree: 'B.Des. Product Design', institute: 'State University', duration: '2015 - 2019', score: '8.5 CGPA' },
  ],
  coreCompetencies: ['Team Leadership', 'Design Thinking', 'Agile Methodology'],
  technicalSkills: [
    { category: 'Design Tools', items: 'Figma, Sketch, Adobe XD' },
    { category: 'Prototyping', items: 'InVision, Framer' },
  ],
  interests: ['Photography', 'Travel', 'Reading'],
  experience: [
    {
      role: 'Senior Product Designer', company: 'Nova Labs', location: 'San Francisco, CA',
      startDate: '2022-01-01', endDate: '', present: true,
      description: 'Leading design for core product features used by millions of users worldwide.',
    },
    {
      role: 'Product Designer', company: 'Bright Studio', location: 'Austin, TX',
      startDate: '2019-06-01', endDate: '2021-12-01', present: false,
      description: 'Designed and shipped multiple customer-facing features from concept to launch.',
    },
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/alexcarter',
    github: 'https://github.com/alexcarter',
    portfolio: 'https://alexcarter.design',
    twitter: '',
  },
};

// ── Minimal (Emily Carter) ──────────────────────────────────────────────────
const emily: Omit<Profile, 'template'> = {
  ...base,
  fullName: 'Emily Carter',
  professionalTitle: 'Project Manager',
  email: 'emily.carter@email.com',
  phone: '+1 416 555 1842',
  location: 'Toronto, Canada',
  socialLinks: { linkedin: 'linkedin.com/in/emily-carter', github: '', portfolio: '', twitter: '' },
  aboutMe:
    'Project Manager with six years of experience coordinating cross-functional initiatives in technology and healthcare. Skilled in stakeholder alignment, project planning, risk management, and delivery governance across complex programmes.',
  font: TEMPLATE_PRESETS['template-four'].font,
  experience: [
    { role: 'Project Manager', company: 'Northbridge Digital', location: 'Toronto, Canada', startDate: '2021-03-01', endDate: '', present: true,
      description: html(['Managed release plans across product, engineering, and marketing teams.', 'Coordinated stakeholder updates, budgets, and documentation for transformation initiatives.', 'Improved delivery tracking, reducing gaps across concurrent workstreams.']) },
    { role: 'Project Coordinator', company: 'MapleWorks Solutions', location: 'Toronto, Canada', startDate: '2019-02-01', endDate: '2021-02-01', present: false,
      description: html(['Supported schedules, budgets, and documentation for client engagements.', 'Facilitated team meetings and maintained cross-department action logs.']) },
    { role: 'Operations Analyst', company: 'BrightPath Group', location: 'Toronto, Canada', startDate: '2017-06-01', endDate: '2019-01-01', present: false,
      description: html(['Analyzed workflow data to identify service delivery inefficiencies.']) },
  ],
  education: [
    { degree: 'Bachelor of Commerce in Management', institute: 'Toronto Metropolitan University', duration: '2013 – 2017', location: 'Toronto, Canada', score: '' },
    { degree: 'Diploma in Business Administration', institute: 'Algonquin College', duration: '2011 – 2013', location: 'Ottawa, Canada', score: '' },
  ],
  technicalSkills: [{ category: 'Skills', items: 'Project Planning, Stakeholder Management, Risk Management, Agile Delivery, Budget Tracking, Process Improvement, Jira, Microsoft Project' }],
  certificates: ['Project Management Professional (PMP)', 'Certified ScrumMaster (CSM)', 'Google Project Management Certificate'],
  languages: [{ name: 'English', level: 0 }, { name: 'French', level: 0 }],
};

// ── Professional (Camila Rivera) ────────────────────────────────────────────
const camila: Omit<Profile, 'template'> = {
  ...base,
  fullName: 'Camila Rivera',
  professionalTitle: 'Sales Manager',
  email: 'camila.rivera@email.com',
  phone: '+1 305 555 0143',
  location: 'Miami, United States',
  photo: avatar('#d9dde3', '#e8b48f', '#3a2418'),
  socialLinks: { linkedin: 'linkedin.com/in/camila-rivera', github: '', portfolio: '', twitter: '' },
  aboutMe:
    'Results-driven sales professional with 8 years of experience in account growth, client relationships, and pipeline development across B2B markets. Strong track record of exceeding revenue targets and leading high-performing teams.',
  font: TEMPLATE_PRESETS['template-five'].font,
  sectionLabels: labels({ aboutMe: 'Summary', experience: 'Professional Experience' }),
  experience: [
    { role: 'Sales Manager', company: 'BrightPath Business Solutions', location: 'Miami, United States', startDate: '2023-03-01', endDate: '', present: true,
      description: html(['Manage a portfolio of mid-market clients across retail and service sectors.', 'Lead quarterly sales planning and improved team conversion rates by 22%.']) },
    { role: 'Account Manager', company: 'Horizon Office Supply', location: 'Orlando, United States', startDate: '2020-03-01', endDate: '2023-02-01', present: false,
      description: html(['Owned renewal and upsell strategy for key accounts.', 'Delivered tailored product proposals and consistently exceeded quotas.']) },
  ],
  education: [
    { degree: 'Bachelor of Business Administration', institute: 'Florida International University', duration: '2014 – 2018', location: 'Miami, United States', score: '' },
    { degree: 'Associate Degree in Marketing', institute: 'Miami Dade College', duration: '2012 – 2014', location: 'Miami, United States', score: '' },
  ],
  technicalSkills: [{ category: 'Skills', items: 'Account Management, CRM Management, Sales Forecasting, Negotiation, Client Retention, Pipeline Development' }],
  languages: [{ name: 'English', level: 0 }, { name: 'Spanish', level: 4 }],
};

// ── Botanical (Catherine Bale) ──────────────────────────────────────────────
const catherine: Omit<Profile, 'template'> = {
  ...base,
  fullName: 'Catherine Bale',
  professionalTitle: 'Marketing Assistant',
  email: 'c.bale@email.com',
  phone: '+1 417 543 000',
  location: '22611 Pacific Coast Hwy, Malibu, USA',
  photo: avatar('#e7d8d0', '#f0c7a8', '#4a2a1a'),
  socialLinks: { linkedin: 'bale2345', github: '', portfolio: '', twitter: '' },
  aboutMe:
    'To obtain a challenging marketing position with a reputable company where I can utilize my marketing skills and drive sales.',
  font: TEMPLATE_PRESETS['template-six'].font,
  accentColor: TEMPLATE_PRESETS['template-six'].accentColor,
  sectionLabels: labels({ aboutMe: 'Profile', experience: 'Professional Experience' }),
  experience: [
    { role: 'Marketing Manager', company: 'Acme Corporation', location: 'Milwaukee', startDate: '2019-01-01', endDate: '', present: true,
      description: 'Developed and executed marketing strategies to increase brand awareness and drive sales.' },
    { role: 'Marketing Coordinator', company: 'Global Industries', location: 'Grand Island', startDate: '2017-01-01', endDate: '2019-01-01', present: false,
      description: 'Assisted in the development and execution of marketing strategies to promote products and services.' },
  ],
  education: [
    { degree: 'Business Marketing', institute: 'University of Wisconsin', duration: '2014 – 2017', location: 'Milwaukee', score: '' },
  ],
  technicalSkills: [
    { category: 'Market research', items: 'Strong marketing skills with experience in developing marketing strategies and conducting market research.' },
    { category: 'Analytical thinking', items: 'Developed and analyzed data with experience in opportunities and data-driven decisions.' },
    { category: 'Project management', items: 'Experience in managing multiple projects and prioritizing tasks effectively.' },
    { category: 'Tools', items: 'Microsoft Office, Google Analytics, social media platforms.' },
  ],
  certificates: ['Google Analytics Certified', 'HubSpot Inbound Marketing Certified'],
  languages: [{ name: 'English (C2)', level: 0 }, { name: 'Spanish (C2)', level: 0 }],
};

// ── Executive (Vikram Nair) ─────────────────────────────────────────────────
const vikram: Omit<Profile, 'template'> = {
  ...base,
  fullName: 'Vikram Nair',
  professionalTitle: 'Senior Consultant',
  email: 'vikram.nair@email.com',
  phone: '+1 312 555 7842',
  location: 'Chicago, Illinois',
  socialLinks: { linkedin: 'linkedin.com/in/vikram-nair', github: '', portfolio: '', twitter: '' },
  aboutMe:
    'Consulting professional with 7 years of experience delivering strategy, process improvement, and transformation projects for clients in healthcare, retail, and financial services. Skilled at translating analysis into practical recommendations that support measurable operational efficiency.',
  font: TEMPLATE_PRESETS['template-seven'].font,
  primaryColor: TEMPLATE_PRESETS['template-seven'].primaryColor,
  accentColor: TEMPLATE_PRESETS['template-seven'].accentColor,
  sectionLabels: labels({ aboutMe: 'Summary', experience: 'Professional Experience' }),
  sectionIcons: allIcons(true),
  experience: [
    { role: 'Senior Consultant', company: 'Westbridge Advisory', location: 'Chicago, IL', startDate: '2022-09-01', endDate: '', present: true,
      description: html(['Led operating model and process redesign projects across multiple client teams.', 'Managed client workshops, synthesized findings, and developed implementation plans.']) },
    { role: 'Consultant', company: 'BluePeak Consulting', location: 'Dallas, TX', startDate: '2020-08-01', endDate: '2022-09-01', present: false,
      description: html(['Delivered market analysis and business cases for expansion and efficiency initiatives.', 'Built performance reports to support executive decision-making.']) },
  ],
  education: [
    { degree: 'Indiana University Kelley School of Business, MBA', institute: '', duration: '2015 – 2017', location: 'Bloomington, IN', score: '' },
    { degree: 'University of Delhi, Bachelor of Commerce', institute: '', duration: '2011 – 2014', location: 'Delhi, India', score: '' },
  ],
  technicalSkills: [{ category: 'Skills', items: 'Process Improvement, Stakeholder Management, Market Analysis, Financial Modeling, Data Analysis, Executive Presentation' }],
  certificates: ['Lean Six Sigma Green Belt', 'Project Management Professional (PMP)', 'Certified Management Consultant (CMC)'],
  languages: [{ name: 'English', level: 4 }, { name: 'Hindi', level: 5 }],
};

// ── Clean (Rohan K. Patel) ──────────────────────────────────────────────────
const rohan: Omit<Profile, 'template'> = {
  ...base,
  fullName: 'Rohan K. Patel',
  professionalTitle: 'Project Engineer',
  email: 'rohan.patel@email.com',
  phone: '+91 98765 43210',
  location: 'Ahmedabad, India',
  photo: avatar('#e9e9ee', '#c58c66', '#15110e'),
  socialLinks: { linkedin: 'linkedin.com/in/rohan-patel', github: '', portfolio: '', twitter: '' },
  aboutMe:
    'Project Engineer with 6+ years of experience supporting industrial and infrastructure projects in fast-paced engineering environments. Strong background in project coordination, vendor management, technical documentation, and site execution.',
  font: TEMPLATE_PRESETS['template-eight'].font,
  primaryColor: TEMPLATE_PRESETS['template-eight'].primaryColor,
  accentColor: TEMPLATE_PRESETS['template-eight'].accentColor,
  sectionLabels: labels({ aboutMe: 'Summary', experience: 'Professional Experience' }),
  experience: [
    { role: 'Project Engineer', company: 'Adani Infrastructure', location: 'Ahmedabad, India', startDate: '2022-01-01', endDate: '', present: true,
      description: html(['Lead project coordination activities for industrial infrastructure projects.', 'Managed vendor coordination, schedules and technical documentation.']) },
    { role: 'Mechanical Engineer', company: 'Larsen & Toubro', location: 'Vadodara, India', startDate: '2017-07-01', endDate: '2021-12-01', present: false,
      description: html(['Coordinated inspections and contractor activities to meet delivery targets.']) },
  ],
  education: [
    { degree: 'Bachelor of Engineering in Mechanical Engineering', institute: 'Gujarat Technological University', duration: '2013 – 2017', location: 'Ahmedabad, India', score: '' },
    { degree: 'Diploma in Mechanical Engineering', institute: 'Government Polytechnic Ahmedabad', duration: '2010 – 2013', location: 'Ahmedabad, India', score: '' },
  ],
  technicalSkills: [{ category: 'Skills', items: 'Project Coordination, Mechanical Systems, Technical Documentation, Vendor Management, Quality Assurance, Site Execution' }],
  certificates: ['AutoCAD Professional Certificate', 'Primavera P6 Fundamentals', 'Occupational Health and Safety'],
  languages: [{ name: 'English', level: 0 }, { name: 'Hindi', level: 0 }, { name: 'Gujarati', level: 0 }],
};

// ── Creative (Parth Modi) ───────────────────────────────────────────────────
const parth: Omit<Profile, 'template'> = {
  ...base,
  fullName: 'Parth Modi',
  professionalTitle: 'A web artisan, crafting digital delights.',
  email: 'parthmodi9494@gmail.com',
  phone: '+91-9033511367',
  location: 'Gandhinagar, Gujarat, India',
  socialLinks: { linkedin: 'https://linkedin.com/in/parthmodi', github: 'https://github.com/parthmodi', portfolio: 'www.parthmodi.in', twitter: 'https://twitter.com/parthmodi' },
  aboutMe:
    'As a seasoned frontend developer, I bring forth extensive expertise in crafting dynamic and intuitive user interfaces. With over 7+ years of hands-on experience, I have honed my skills in leveraging various technologies and frameworks to deliver exceptional web and mobile applications. My passion for frontend development is evident in my ability to create robust, responsive, and user-friendly interfaces that meet the highest standards of quality and aesthetics.',
  font: TEMPLATE_PRESETS['template-nine'].font,
  primaryColor: TEMPLATE_PRESETS['template-nine'].primaryColor,
  accentColor: TEMPLATE_PRESETS['template-nine'].accentColor,
  experience: [
    { role: 'Software Developer Engineer III', company: 'Toothsi', location: 'Mumbai, Maharashtra, India', startDate: '2022-06-01', endDate: '', present: true,
      description: 'Utilising the power of Next.js and React, I contributed to the smooth development of high-performance and SEO-friendly web interfaces for both web and mobile applications. My responsibilities included overseeing the entire teeth scan booking journey and improving website speed and Core Web Vitals metrics.' },
    { role: 'Senior Software Developer', company: 'Intech Creative Services', location: 'Gandhinagar, Gujarat, India', startDate: '2021-05-01', endDate: '2022-06-01', present: false,
      description: 'Played a pivotal role in the frontend development team at INTECH\'s mainstream client DPWorld, a global leader in logistics and supply chain solutions.' },
    { role: 'Software Developer', company: 'Encora Inc.', location: 'Ahmedabad, Gujarat, India', startDate: '2019-03-01', endDate: '2021-05-01', present: false,
      description: 'Served as a frontend developer for Encora, working on projects for Nebraska Furniture Mart (NFM), a renowned retailer in the furniture and home decor industry.' },
  ],
  education: [
    { degree: 'Bachelor of Mechatronics Engineering', institute: 'Gujarat Technological University', duration: '2011 – 2015', location: '', score: '7.10 CGPA' },
  ],
  coreCompetencies: ['Team Leadership', 'Cross-Functional Collaboration', 'Emotional Intelligence', 'Time Management', 'Continuous Learning'],
  technicalSkills: [
    { category: 'Web Technologies', items: 'HTML5, CSS3, JavaScript (ES6+), Typescript' },
    { category: 'Frontend Frameworks', items: 'React.js, Next.js, Angular.js' },
    { category: 'Testing', items: 'Jasmine, Mocha, Cypress' },
  ],
  interests: ['Coffee', 'Music', 'Reading', 'Gaming', 'Travel'],
};

const SAMPLES: Record<TemplateId, Omit<Profile, 'template'>> = {
  'template-one': alex,
  'template-two': alex,
  'template-three': alex,
  'template-four': emily,
  'template-five': camila,
  'template-six': catherine,
  'template-seven': vikram,
  'template-eight': rohan,
  'template-nine': parth,
};

export function getSampleProfile(template: TemplateId): Profile {
  const p = TEMPLATE_PRESETS[template];
  const sample = SAMPLES[template];
  return {
    font: p.font, primaryColor: p.primaryColor, accentColor: p.accentColor,
    ...sample,
    ...TEMPLATE_HEADER_DEFAULTS[template],
    template,
  } as Profile;
}
