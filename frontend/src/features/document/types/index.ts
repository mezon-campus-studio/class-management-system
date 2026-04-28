export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdById: string;
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  folderId: string | null;
  contentType: string | null;
  fileSize: number | null;
  uploadedById: string;
  createdAt: string;
}

export interface FolderContents {
  folder: Folder;
  subFolders: Folder[];
  documents: Document[];
}
