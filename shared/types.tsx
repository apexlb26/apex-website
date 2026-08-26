export type Locale = "en" | "ar";

export type AP_IconName =
  | "brain" | "layers" | "nodes" | "database" | "code" | "flow"
  | "briefcase" | "compass" | "grid" | "chart" | "shield"
  | "arrow-up-right" | "arrow-right" | "menu" | "graduation" | "leaf"
  | "check" | "search" | "calendar" | "message" | "lock" | "globe"
  | "spark" | "mail" | "box"
  | "shield-check" | "sparkles" | "users" | "bulb" | "rocket"
  | "cloud" | "trend-up" | "upload-cloud" | "pin" | "building" | "chevron-down"
  | "check-circle" | "sliders" | "share" | "sitemap" | "play";

export type NavItem = {
  label: string;
  href: string;
};

export type Principle = {
  icon: AP_IconName;
  title: string;
  body: string;
};

export type TrustStat = {
  value: string;
  label: string;
};

export type TrustContent = {
  eyebrow: string;
  clients: string[];
  stats: TrustStat[];
};

export type HeroContent = {
  eyebrow: string;
  lines: [string, string, string];
  highlight?: string;
  architecture?: string[];
  architectureCards?: string[];
  image?: string;
  imageAlt?: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  principles: Principle[];
};

export type AboutContent = {
  eyebrow: string;
  statement: string;
  body: string;
};

export type SolutionKey = "ai" | "legacy" | "integration" | "data" | "software" | "workflow" | "cloud";

export type SolutionItem = {
  key: SolutionKey;
  number: string;
  icon: AP_IconName;
  title: string;
  body: string;
};

export type SolutionsContent = {
  pageEyebrow?: string;
  pageTitle?: string;
  pageHighlight?: string;
  pageAccent?: string;
  pageBody?: string;
  pageItems?: SolutionItem[];
  exploreLabel?: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  items: SolutionItem[];
};

export type IndustryKey = "education" | "service" | "environment";

export type IndustryItem = {
  key: IndustryKey;
  number: string;
  icon: AP_IconName;
  title: string;
  body: string;
  bullets: string[];
  image?: string;
  learnMore?: string;
};

export type IndustryStat = {
  value: string;
  label: string;
  icon?: AP_IconName;
};

export type IndustriesContent = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  openDoorTitle: string;
  openDoorBody: string;
  openDoorCta: string;
  learnMoreLabel?: string;
  pageEyebrow?: string;
  exploreLabel?: string;
  pageOpenDoorTitle?: string;
  pageOpenDoorBody?: string;
  pageOpenDoorCta?: string;
  pageTitle?: string;
  pageHighlight?: string;
  pageBody?: string;
  stats?: IndustryStat[];
  startTitle?: string;
  startBody?: string;
  startCta?: string;
  qualities?: Principle[];
  items: IndustryItem[];
};

export type CaseFact = {
  icon: AP_IconName;
  title: string;
  body: string;
};

export type CaseStudyContent = {
  eyebrow: string;
  title: string;
  intro: string;
  client: string;
  clientLogo: string;
  screenshot: string;
  headline: string;
  body: string;
  capabilities: string[];
  facts: CaseFact[];
  modalTitle: string;
  modalBody: string;
  projectScope: string;
  businessNeed: string;
  delivered: string;
  whyItMatters: string;
  cta: string;
};

export type MethodStep = {
  number: string;
  icon: AP_IconName;
  title: string;
  body: string;
};

export type MethodContent = {
  eyebrow: string;
  highlight?: string;
  stepCta?: string;
  title: string;
  body: string;
  principles: Principle[];
  steps: MethodStep[];
  ctaTitle: string;
  ctaHighlight: string;
  ctaBodyLead?: string;
  ctaBody: string;
  cta: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type FooterContent = {
  legal: string;
  tagline?: string;
  body?: string;
  columns?: FooterColumn[];
  newsletterTitle?: string;
  newsletterBody?: string;
  legalLinks?: FooterLink[];
};

export type InsightPost = {
  category: string;
  title: string;
  body: string;
  date: string;
  readTime: string;
  image?: string;
  href?: string;
};

export type ProductHighlight = {
  title: string;
  body: string;
  icon?: AP_IconName;
};

export type ProductItem = {
  name: string;
  category: string;
  body: string;
  features: string[];
  icon?: AP_IconName;
  cta?: string;
};

export type ProductStat = {
  value: string;
  label: string;
};

export type ProductsPageContent = {
  eyebrow: string;
  title: string;
  highlight: string;
  body: string;
  secondaryBody: string;
  primaryCta: string;
  secondaryCta: string;
  suiteEyebrow: string;
  suiteTitle: string;
  suiteBody: string;
  emptyTitle: string;
  emptyBody: string;
  ecosystemEyebrow: string;
  ecosystemTitle: string;
  ecosystemBody: string;
  heroHighlights?: ProductHighlight[];
  heroImage?: string;
  heroImageAlt?: string;
  items?: ProductItem[];
  flowEyebrow?: string;
  flowTitle?: string;
  flowOrder?: string[];
  flowOutcome?: string[];
  deployEyebrow?: string;
  deployTitle?: string;
  deployBody?: string;
  deployItems?: ProductHighlight[];
  deployCardTitle?: string;
  deployCardBody?: string;
  deployCardCta?: string;
  featuredEyebrow?: string;
  featuredName?: string;
  featuredCategory?: string;
  featuredBody?: string;
  featuredCapabilitiesLabel?: string;
  featuredCapabilities?: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  ctaTitle?: string;
  ctaBody?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  trustEyebrow?: string;
  clients?: string[];
  stats?: ProductStat[];
};

export type BlogFeatured = {
  label: string;
  title: string;
  body: string;
  cta: string;
  statValue?: string;
  statLabel?: string;
  badge?: string;
  image?: string;
};

export type BlogMilestone = {
  date: string;
  title: string;
  body: string;
  icon?: AP_IconName;
};

export type BlogUpdate = {
  category: string;
  date: string;
  title: string;
  body: string;
  cta?: string;
  image?: string;
  href?: string;
};

export type BlogsPageContent = {
  subscribePlaceholder?: string;
  subscribeCta?: string;
  privacyNote?: string;
  featured?: BlogFeatured;
  updates?: BlogUpdate[];
  milestonesTitle?: string;
  milestonesCta?: string;
  milestones?: BlogMilestone[];
  bottomEyebrow?: string;
  bottomTitle?: string;
  bottomBody?: string;
  insightsEyebrow?: string;
  insightsTitle?: string;
  insightsBody?: string;
  insightsCta?: string;
  posts?: InsightPost[];
  eyebrow: string;
  title: string;
  highlight: string;
  body: string;
  subscribeTitle: string;
  subscribeBody: string;
  featuredLabel: string;
  emptyTitle: string;
  emptyBody: string;
  categories: string[];
};


export type ContactContent = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  replyNote: string;
  nameLabel: string;
  emailLabel: string;
  companyLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  sendingLabel: string;
  privacyNote: string;
  successTitle: string;
  successBody: string;
  successCta: string;
};

export type SocialContent = {
  /** Full wa.me URL. Optional override; normally leave blank and set whatsappNumber. */
  whatsapp: string;
  /** Phone number in any readable format, e.g. "+961 79 453 181". */
  whatsappNumber?: string;
  /** Message prefilled in the WhatsApp composer. */
  whatsappMessage?: string;
  linkedin: string;
  instagram: string;
  whatsappLabel: string;
  chatbotLabel: string;
  chatbotTitle: string;
  chatbotSubtitle: string;
};

export type CareerValue = {
  title: string;
  body: string;
  icon?: AP_IconName;
};

export type CareerRole = {
  title: string;
  type: string;
  location: string;
  summary: string;
  icon?: AP_IconName;
};

export type CareerStat = {
  value: string;
  label: string;
  icon?: AP_IconName;
};

export type CareerStep = {
  title: string;
  body: string;
};

export type CareerFormLabels = {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  locationLabel: string;
  locationPlaceholder: string;
  roleLabel: string;
  rolePlaceholder: string;
  roleGeneralOption: string;
  linkedinLabel: string;
  linkedinPlaceholder: string;
  resumeLabel: string;
  resumeDropTitle: string;
  resumeDropBrowse: string;
  resumeReplace: string;
  resumeHint: string;
  coverLabel: string;
  coverPlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
  errorResumeMissing: string;
  errorResumeType: string;
  errorResumeSize: string;
  errorGeneric: string;
};

export type CareersPageContent = {
  eyebrow: string;
  title: string;
  highlight: string;
  body: string;
  primaryCta: string;
  secondaryCta?: string;
  valuesEyebrow: string;
  valuesTitle: string;
  values: CareerValue[];
  rolesEyebrow: string;
  rolesTitle: string;
  rolesBody: string;
  emptyTitle: string;
  emptyBody: string;
  roles: CareerRole[];
  heroImage?: string;
  heroStats?: CareerStat[];
  viewAllLabel?: string;
  applyEyebrow?: string;
  applyTitle?: string;
  applyBody?: string;
  applyNote?: string;
  processEyebrow?: string;
  processTitle?: string;
  steps?: CareerStep[];
  closingTitle?: string;
  closingBody?: string;
  closingCta?: string;
  viewRoleLabel?: string;
  heroImageAlt?: string;
  form?: CareerFormLabels;
};

export type SiteMeta = {
  title: string;
  description: string;
};

export type SiteContent = {
  locale: Locale;
  direction: "ltr" | "rtl";
  meta: SiteMeta;
  nav: NavItem[];
  hero: HeroContent;
  about: AboutContent;
  solutions: SolutionsContent;
  industries: IndustriesContent;
  caseStudy: CaseStudyContent;
  method: MethodContent;
  footer: FooterContent;
  products: ProductsPageContent;
  blogs: BlogsPageContent;
  careers: CareersPageContent;
  social: SocialContent;
  contact?: ContactContent;
  trust?: TrustContent;
};

export type ContactRequest = {
  name: string;
  email: string;
  company?: string;
  message: string;
};

export type ContactResponse =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type SubscribeRequest = {
  email: string;
};

export type SubscribeResponse =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type CmsEnvelope<T> = {
  data: T;
  locale: Locale;
  source: "cms" | "fallback-json";
  updatedAt?: string;
};

export type AdminSessionPayload = {
  email: string;
  exp: number;
};

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminLoginResponse =
  | { ok: true }
  | { ok: false; error: string };

export type AdminLogoutResponse = { ok: true };

export type AdminContentGetResponse =
  | { ok: true; locale: Locale; content: SiteContent }
  | { ok: false; error: string };

export type AdminContentUpdateRequest = {
  locale: Locale;
  content: SiteContent;
};

export type AdminSaveResult = {
  mode: "local-json" | "github";
  updatedAt: string;
  commitSha?: string;
};

export type AdminContentUpdateResponse =
  | ({ ok: true } & AdminSaveResult)
  | { ok: false; error: string };

export type AdminMediaUploadResult = {
  path: string;
  mode: "local-json" | "github";
};

export type AdminMediaResponse =
  | ({ ok: true } & AdminMediaUploadResult)
  | { ok: false; error: string };
