export interface TemplateWorkItem {
  item: string;
  unit: string;
  quantity: number | null;
  rate: number;
  total: number;
}

export interface TemplateSection {
  sectionName: string;
  workItems: TemplateWorkItem[];
}

export interface TemplateBoqResult {
  projectTitle: string;
  sections: TemplateSection[];
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  boqCount: number;
  boqResult: TemplateBoqResult;
  keyFeatures: string[];
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTemplateRequest {
  sourceProjectId?: string;
  name: string;
  description: string;
  icon?: string;
  boqResult: TemplateBoqResult;
  keyFeatures?: string[];
  tags?: string[];
}
