export interface WorkItem {
  item: string;
  specification: string;
  unit: string;
  quantity: number;
  notes: string;
}

export interface Section {
  sectionName: string;
  workItems: WorkItem[];
}

export interface BoqResult {
  projectTitle: string;
  sections: Section[];
  generalNotes: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  userId: string;
  companyId: string;
  status: string;
  source: string;
  sourceJobId: string;
  boqResult: BoqResult;
  libraryItems: string[];
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  grossFloorArea?: number;
  buildingType?: string;
  completionStatus?: number;
  estimateTotal?: number;
  currency?: string;
  projectCode?: string;
  projectType?: string;
  projectLocation?: string;
  clientName?: string;
  duration?: number;
}

export interface ProjectDashboardSummary {
  projectId: string;
  name: string;
  status: string;
  buildingType: string;
  completionStatus: number;
  grossFloorArea: number;
  estimateTotal: number;
  costPerSqm: number;
  currency: string;
  costDistribution: {
    sectionName: string;
    amount: number;
  }[];
}

export interface ProjectThumbnailResponse {
  _id: string;
  name: string;
  thumbnailUrl: string;
  status: string;
}

export interface BoqReportSection {
  sectionName: string;
  subtotal: number;
  rows: {
    itemCode: string;
    description: string;
    specification?: string;
    unit: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
}

export interface BoqReportPreview {
  referenceNumber: string;
  generatedAt: string;
  company: {
    name: string;
    logo: string;
    address: string;
  };
  project: {
    projectId: string;
    name: string;
    description: string;
    clientName: string;
    projectCode: string;
    projectType: string;
    projectLocation: string;
    status: string;
    currency: string;
    grossFloorArea: number;
    buildingType: string;
    duration: number;
  };
  executiveSummary: {
    grandTotal: number;
    costPerSqm: number;
    sectionCount: number;
    costDistribution: {
      sectionName: string;
      amount: number;
      percentage: number;
    }[];
    resourceAllocation: {
      labour: number;
      material: number;
      machinery: number;
    };
  };
  sections: BoqReportSection[];
  termsAndNotes: string;
}

export interface SaveBoqRowRequest {
  sectionIndex: number;
  rowIndex: number;
  categoryId: string;
  baseRate: number;
  markupPercentage: number;
  state: string;
  country: string;
}

export interface SaveBoqRowResponse {
  _id: string;
  itemCode: string;
  description: string;
  unit: string;
  baseRate: number;
  markupPercentage: number;
  finalRate: number;
  state: string;
  country: string;
}

export interface BimUploadResponse {
  urn: string;
  objectKey: string;
  bucketKey: string;
  translationStatus: string;
}

export interface BimTranslationStatus {
  urn: string;
  status: string;
  progress: string;
  derivatives: any[];
}

export interface BimJob {
  _id: string;
  urn: string;
  originalFilename: string;
  fileType: string;
  status: string;
  viewName?: string;
  rawItemCount?: number;
  filteredItemCount?: number;
  thumbnailUrl?: string;
  viewIndex?: number;
  createdAt: string;
  result?: {
    projectTitle: string;
    sections: any[];
  };
}

export interface BimSection {
  sectionName: string;
  workItems: BimWorkItem[];
  rows?: any[];
}

export interface BimWorkItem {
  item: string;
  specification?: string | null;
  unit?: string;
  quantity?: number | null;
  rate?: number;
  total?: number;
  notes?: string | null;
}

export interface BimJobUpdateRequest {
  projectTitle?: string;
  sections?: BimSection[];
  generalNotes?: string;
}

export interface PdfBoqGenerateResponse {
  jobId: string;
  status: string;
}

export interface PdfBoqJob {
  _id: string;
  originalFilename: string;
  status: string;
  createdAt: string;
  result?: {
    projectTitle: string;
    templateVersion?: string;
    generalNotes?: string;
    sections: BimSection[];
  };
}

export interface PdfBoqCreateProjectRequest {
  name: string;
  description: string;
  companyId?: string;
  clientId?: string;
  clientName?: string;
  projectCode?: string;
  projectType?: string;
  projectLocation?: string;
  drawingType?: string[];
  source?: string;
  sourceJobId?: string;
  boqResult?: any;
  libraryItems?: string[];
}

export interface PdfBoqCreateProjectResponse {
  _id: string;
  name: string;
  description: string;
  source: string;
  sourceJobId: string;
  status: string;
  clientName: string;
  projectCode: string;
  projectType: string;
  projectLocation: string;
  boqResult: any;
  createdAt: string;
}

export interface MultiBoqFileItem {
  originalFilename: string;
  fileType: string;
  status: string;
}

export interface MultiBoqJob {
  _id: string;
  status: string;
  embeddingStatus: string;
  files: MultiBoqFileItem[];
  createdAt: string;
  result?: any;
  errorMessage?: string;
}

export interface MultiBoqGenerateResponse {
  jobId: string;
}
export interface ProjectMember {
  _id: string;
  projectId: string;
  userId: string;
  role: string;
  status: string;
  invitedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddProjectMemberRequest {
  userId: string;
  role: string;
}

export interface UpdateProjectMemberRequest {
  role: string;
}

export interface ProjectActivity {
  _id: string;
  projectId: string;
  action: string;
  description: string;
  performedBy: string;
  performedByName: string;
  metadata?: any;
  createdAt: string;
}
