export interface TemplateBoqResult {
  projectTitle: string;
  sections: Array<{
    sectionName: string;
    workItems: Array<{
      item: string;
      unit: string;
      quantity: number;
      rate: number;
      total: number;
    }>;
  }>;
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  icon: string;
  type: "system" | "organization";
  boqCount?: number;
  boqResult?: TemplateBoqResult;
  keyFeatures?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  icon: string;
  type?: "system" | "organization";
  sourceProjectId?: string;
  keyFeatures?: string[];
  tags?: string[];
  boqResult?: TemplateBoqResult;
}
