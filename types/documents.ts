export interface ProcessDocumentInput {
  uploadedFileId: string;
  documentType: string;
  operationTypes: string[];
  preferredProvider?: string;
  documentHint?: string;
}

export interface EstimateDocumentInput {
  operationTypes: string[];
  pageCount: number;
}

export interface BoqRequest {
  urn: string;
  documentHint?: string;
  viewIndex?: number;
}

export interface BoqResponse {
  urn: string;
  modelGuid: string;
  viewName: string;
  rawItemCount: number;
  filteredItemCount: number;
  boq: string;
  boqData: Record<string, any>;
  generatedAt: string;
}
