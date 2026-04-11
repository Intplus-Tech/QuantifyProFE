export interface FileUploadResponse {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  provider: string;
  cloudId: string;
  uploadedBy: string;
  metadata: {
    format: string;
    width: number;
    height: number;
    bytes: number;
  };
  createdAt: string;
  updatedAt: string;
  timestamp?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  timestamp: string;
}
