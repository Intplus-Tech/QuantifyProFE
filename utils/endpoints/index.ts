export const auth = {
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",
  refresh: "/auth/refresh-token",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  changePassword: "/auth/change-password",
  verifyEmail: "/auth/verify-email",
  resendVerificationEmail: "/auth/resend-verification-email",
};

export const user = {
  profile: "/users/me",
  updateProfile: (id: string) => `/users/${id}`,
  professionalDetails: "/users/me/professional-details",
  securityPreferences: "/users/me/security-preferences",
};

export const Credits = {
  creditPricind: "/credits/pricing",
  creditBalance: "/credits/balance",
  creditHistory: "/credits/history",
  creditUsage: "/credits/usage",
  creditUsageProviders: "/credits/usage/providers",
  addCredits: "/credits/add",
};

export const documents = {
  process: "/documents/process",
  estimate: "/documents/estimate",
  jobs: "/documents/jobs",
  jobDetails: (id: string) => `/documents/jobs/${id}`,
  cancelJob: (id: string) => `/documents/jobs/${id}/cancel`,
  retryJob: (id: string) => `/documents/jobs/${id}/retry`,
};

export const plans = {
  list: "/plans",
  create: "/plans",
  byCategory: (category: string) => `/plans/category/${category}`,
  all: "/plans",
  details: (id: string) => `/plans/${id}`,
  update: (id: string) => `/plans/${id}`,
  delete: (id: string) => `/plans/${id}`,
};

export const company = {
  profile: "/company",
  updateProfile: "/company",
  transferOwnership: "/company/transfer-ownership",
  locations: {
    add: "/company/locations",
    update: (id: string) => `/company/locations/${id}`,
    delete: (id: string) => `/company/locations/${id}`,
  },
  team: {
    list: "/company/team",
    invite: "/company/team/invite",
    resendInvitation: (id: string) => `/company/team/invitations/${id}/resend`,
    updateMember: (id: string) => `/company/team/${id}`,
    removeMember: (id: string) => `/company/team/${id}`,
  },
  rolePermissions: {
    list: "/company/role-permissions",
    update: "/company/role-permissions",
  },
  billing: {
    info: "/company/billing",
    changePlan: "/company/billing/plan",
    history: "/company/billing/history",
    paymentMethods: "/company/billing/payment-methods",
    addPaymentMethod: "/company/billing/payment-methods",
    setPrimaryPaymentMethod: (id: string) =>
      `/company/billing/payment-methods/${id}/primary`,
    removePaymentMethod: (id: string) =>
      `/company/billing/payment-methods/${id}`,
    subscribe: "/company/billing/subscribe",
    verify: "/company/billing/verify",
    cancel: "/company/billing/cancel",
    usage: "/company/billing/usage",
    invoicePdf: (id: string) => `/company/billing/invoices/${id}/pdf`,
  },
  sessions: {
    list: "/company/sessions",
    terminate: (id: string) => `/company/sessions/${id}`,
  },
};

export const library = {
  categories: {
    list: "/library/categories",
    create: "/library/categories",
    update: (id: string) => `/library/categories/${id}`,
    delete: (id: string) => `/library/categories/${id}`,
  },
  items: {
    list: "/library/items",
    create: "/library/items",
    details: (id: string) => `/library/items/${id}`,
    update: (id: string) => `/library/items/${id}`,
    delete: (id: string) => `/library/items/${id}`,
  },
};

export const support = {
  createTicket: "/support/tickets",
  listTickets: "/support/tickets",
  ticketDetails: (id: string) => `/support/tickets/${id}`,
};

export const clients = {
  list: "/clients",
  stats: "/clients/stats",
  details: (id: string) => `/clients/${id}`,
  create: "/clients",
  update: (id: string) => `/clients/${id}`,
  delete: (id: string) => `/clients/${id}`,
  projects: (id: string) => `/v1/clients/${id}/projects`,
};

export const projects = {
  list: "/projects",
  create: "/projects",
  details: (id: string) => `/projects/${id}`,
  update: (id: string) => `/projects/${id}`,
  delete: (id: string) => `/projects/${id}`,
  archive: (id: string) => `/projects/${id}/archive`,
  dashboard: (id: string) => `/projects/${id}/dashboard`,
  updateThumbnail: (id: string) => `/projects/${id}/thumbnail`,
  boqReportPreview: (id: string) => `/projects/${id}/boq-report-preview`,
  saveBoqRowToLibrary: (id: string) => `/projects/${id}/boq/save-to-library`,
  listByCompany: (companyId: string) => `/projects/company/${companyId}`,
  activity: (id: string) => `/projects/${id}/activity`,
  members: {
    list: (projectId: string) => `/projects/${projectId}/members`,
    add: (projectId: string) => `/projects/${projectId}/members`,
    update: (projectId: string, memberId: string) =>
      `/projects/${projectId}/members/${memberId}`,
    remove: (projectId: string, memberId: string) =>
      `/projects/${projectId}/members/${memberId}`,
  },
};

export const template = {
  list: "/templates",
  create: "/templates",
  details: (id: string) => `/templates/${id}`,
  update: (id: string) => `/templates/${id}`,
  delete: (id: string) => `/templates/${id}`,
};

export const bim = {
  upload: "/bim/upload",
  status: (urn: string) => `/bim/status/${urn}`,
  generateBoq: (urn: string) => `/bim/boq/${urn}`,
  jobs: "/bim/jobs",
  jobDetails: (jobId: string) => `/bim/jobs/${jobId}`,
  updateJob: (jobId: string) => `/bim/jobs/${jobId}`,
  jobPdf: (jobId: string) => `/bim/jobs/${jobId}/pdf`,
  createProject: (jobId: string) => `/bim/jobs/${jobId}/create-project`,
};

export const uploads = {
  upload: "/uploads",
  uploadFile: "uploads/{id}",
  getUploads: (id: string) => `/uploads/${id}`,
};

export const pdfBoq = {
  generate: "/pdf-boq/generate",
  jobs: "/pdf-boq/jobs",
  jobDetails: (jobId: string) => `/pdf-boq/jobs/${jobId}`,
  updateJob: (jobId: string) => `/pdf-boq/jobs/${jobId}`,
  jobPdf: (jobId: string) => `/pdf-boq/jobs/${jobId}/pdf`,
  createProject: (jobId: string) => `/pdf-boq/jobs/${jobId}/create-project`,
};

export const dashboard = {
  summary: "/dashboard",
};

export const ApiEndpoints = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
  auth,
  user,
  Credits,
  documents,
  plans,
  company,
  library,
  support,
  clients,
  projects,
  bim,
  pdfBoq,
  uploads,
  template,
  dashboard,
};
