import { httpClient } from '../../client/http-client';

export interface Document {
  id: string;
  projectId?: string;
  title?: string;
  content?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDocumentRequest {
  title: string;
  content?: string;
  type?: string;
  projectId?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  type?: string;
}

export interface DocumentsResponse {
  items: Document[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const documentsApi = {
  async getDocuments(): Promise<Document[]> {
    return httpClient.get<Document[]>('/documents');
  },

  async getDocument(id: string): Promise<Document> {
    return httpClient.get<Document>(`/documents/${id}`);
  },

  async createDocument(data: CreateDocumentRequest): Promise<Document> {
    return httpClient.post<Document>('/documents', data);
  },

  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    return httpClient.put<Document>(`/documents/${id}`, data);
  },

  async deleteDocument(id: string): Promise<void> {
    return httpClient.delete<void>(`/documents/${id}`);
  },

  async getProjectDocuments(projectId: string): Promise<Document[]> {
    return httpClient.get<Document[]>(`/projects/${projectId}/documents`);
  },

  async createDocumentV2(data: CreateDocumentRequest): Promise<Document> {
    return httpClient.post<Document>('/documents/v2', data);
  },

  async getDocumentById(id: string): Promise<Document> {
    return httpClient.get<Document>(`/documents/${id}`);
  },

  async updateDocumentById(id: string, data: UpdateDocumentRequest): Promise<Document> {
    return httpClient.put<Document>(`/documents/${id}`, data);
  },

  async deleteDocumentById(id: string): Promise<void> {
    return httpClient.delete<void>(`/documents/${id}`);
  },
};
