import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Folder as FolderIcon, File, Upload, ChevronRight } from 'lucide-react';
import { documentApi } from '../api';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import type { Folder, Document } from '../types';

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

const formatSize = (bytes: number | null) =>
  bytes == null
    ? ''
    : bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function DocumentPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([{ id: null, name: 'Trang chủ' }]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const loadContents = (folderId: string | null) => {
    if (!classroomId) return;
    setLoading(true);
    if (folderId === null) {
      Promise.all([
        documentApi.listRootFolders(classroomId),
        documentApi.listDocuments(classroomId),
      ])
        .then(([fols, docs]) => {
          setFolders(fols);
          setDocuments(docs);
        })
        .catch((err) => alert(err?.response?.data?.message ?? 'Có lỗi xảy ra'))
        .finally(() => setLoading(false));
    } else {
      documentApi
        .getFolderContents(classroomId, folderId)
        .then((contents) => {
          setFolders(contents.subFolders);
          setDocuments(contents.documents);
        })
        .catch((err) => alert(err?.response?.data?.message ?? 'Có lỗi xảy ra'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadContents(currentFolderId);
  }, [classroomId, currentFolderId]);

  const navigateTo = (folder: Folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumb((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const navigateToBreadcrumb = (item: BreadcrumbItem) => {
    const idx = breadcrumb.findIndex((b) => b.id === item.id);
    setBreadcrumb(breadcrumb.slice(0, idx + 1));
    setCurrentFolderId(item.id);
  };

  const handleCreateFolder = async () => {
    if (!classroomId || !folderName.trim()) return;
    setCreatingFolder(true);
    try {
      const newFolder = await documentApi.createFolder(classroomId, {
        name: folderName,
        parentId: currentFolderId ?? undefined,
      });
      setFolders((prev) => [...prev, newFolder]);
      setFolderName('');
      setShowCreateFolder(false);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!classroomId || !confirm('Xóa thư mục này?')) return;
    try {
      await documentApi.deleteFolder(classroomId, folderId);
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !classroomId) return;
    setUploading(true);
    try {
      const doc = await documentApi.uploadDocument(
        classroomId,
        file,
        currentFolderId ?? undefined,
      );
      setDocuments((prev) => [doc, ...prev]);
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!classroomId || !confirm('Xóa tài liệu này?')) return;
    try {
      await documentApi.deleteDocument(classroomId, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-ink-1 mb-2">Tài liệu</h1>
          <nav className="flex items-center gap-1 text-sm text-ink-3">
            {breadcrumb.map((item, i) => (
              <span key={item.id ?? 'root'} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={12} />}
                <button
                  onClick={() => navigateToBreadcrumb(item)}
                  className={
                    i === breadcrumb.length - 1
                      ? 'text-ink-1 font-medium'
                      : 'hover:text-ink-2 transition-colors'
                  }
                >
                  {item.name}
                </button>
              </span>
            ))}
          </nav>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateFolder((v) => !v)}
            className="btn btn-secondary btn-sm gap-1.5"
          >
            <Plus size={14} /> Tạo thư mục
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-primary btn-sm gap-1.5"
          >
            <Upload size={14} /> {uploading ? 'Đang tải...' : 'Tải lên'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {showCreateFolder && (
        <div className="card card-body mb-4 flex items-center gap-3">
          <div className="input-field flex-1">
            <input
              type="text"
              placeholder="Tên thư mục..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="input-field"
              autoFocus
            />
          </div>
          <button
            onClick={handleCreateFolder}
            disabled={creatingFolder || !folderName.trim()}
            className="btn btn-primary btn-sm"
          >
            {creatingFolder ? 'Đang tạo...' : 'Tạo'}
          </button>
          <button
            onClick={() => {
              setShowCreateFolder(false);
              setFolderName('');
            }}
            className="btn btn-ghost btn-sm"
          >
            Hủy
          </button>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse text-center py-10 text-ink-3">Đang tải...</div>
      ) : (
        <>
          {folders.length > 0 && (
            <div className="mb-6">
              <p className="text-label mb-3">Thư mục</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="card card-body flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-shadow group relative p-4"
                    onClick={() => navigateTo(folder)}
                  >
                    <FolderIcon size={32} style={{ color: 'var(--warm-400)' }} />
                    <p className="text-sm font-medium text-ink-1 text-center truncate w-full">
                      {folder.name}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}
                      className="absolute top-2 right-2 btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      style={{ color: 'var(--red-text)' }}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {documents.length > 0 && (
            <div>
              <p className="text-label mb-3">Tài liệu</p>
              <div className="card overflow-hidden">
                <div className="divide-y" style={{ borderColor: 'var(--rule)' }}>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors cursor-pointer"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <File size={18} className="shrink-0 text-ink-3" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-1 truncate">{doc.name}</p>
                        <p className="text-xs text-ink-3 mt-0.5">
                          {formatSize(doc.fileSize)}
                          {doc.fileSize != null && ' · '}
                          {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                        className="btn btn-ghost btn-sm text-xs shrink-0"
                        style={{ color: 'var(--red-text)' }}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {folders.length === 0 && documents.length === 0 && (
            <div className="text-center py-20 text-ink-3">
              <FolderIcon size={40} className="mx-auto mb-3 opacity-30" />
              <p>Chưa có dữ liệu</p>
            </div>
          )}
        </>
      )}

      {previewDoc && classroomId && (
        <DocumentPreviewModal
          classroomId={classroomId}
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
