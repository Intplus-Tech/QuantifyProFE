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
    bytes: number;
    width?: number;
    height?: number;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
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
