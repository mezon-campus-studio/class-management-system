import { api } from '@/services/api-client';
import type { Folder, Document, FolderContents } from '../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

const base = (classroomId: string) => `/classrooms/${classroomId}/documents`;

export const documentApi = {
  listRootFolders: (classroomId: string) =>
    api.get<ApiResponse<Folder[]>>(`${base(classroomId)}/folders`).then((r) => r.data.data),

  getFolderContents: (classroomId: string, folderId: string) =>
    api
      .get<ApiResponse<FolderContents>>(`${base(classroomId)}/folders/${folderId}`)
      .then((r) => r.data.data),

  createFolder: (classroomId: string, body: { name: string; parentId?: string }) =>
    api
      .post<ApiResponse<Folder>>(`${base(classroomId)}/folders`, body)
      .then((r) => r.data.data),

  deleteFolder: (classroomId: string, folderId: string) =>
    api.delete(`${base(classroomId)}/folders/${folderId}`),

  uploadDocument: (classroomId: string, file: File, folderId?: string) => {
    const form = new FormData();
    form.append('file', file);
    const url = folderId
      ? `${base(classroomId)}/upload?folderId=${folderId}`
      : `${base(classroomId)}/upload`;
    return api
      .post<ApiResponse<Document>>(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data);
  },

  listDocuments: (classroomId: string, folderId?: string) => {
    const url = folderId
      ? `${base(classroomId)}?folderId=${folderId}`
      : base(classroomId);
    return api.get<ApiResponse<Document[]>>(url).then((r) => r.data.data);
  },

  deleteDocument: (classroomId: string, documentId: string) =>
    api.delete(`${base(classroomId)}/${documentId}`),

  fetchBlob: (classroomId: string, documentId: string, inline = true) =>
    api
      .get(`${base(classroomId)}/${documentId}/content?inline=${inline}`, { responseType: 'blob' })
      .then((r) => r.data as Blob),
};
