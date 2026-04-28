import { useNavigate } from "react-router-dom";
import { useHome } from "@features/home/hooks/useHome";
import { Lock, MoreVertical, ArrowRight, LogOut, Edit2, Trash2, Plus, AlertTriangle } from "lucide-react";
import { ClassPrivacy } from "@shared/domain/enums";
import { useAuth } from "@features/auth";
import React, { useState } from "react";
import type { ClassItems } from "@features/home/types";

export const HomePage = () => {
  const navigate = useNavigate();
  const { classes, isLoading, error, deleteClassMutation, leaveClassMutation, updateClassMutation } = useHome();
  const { user } = useAuth(); //lấy thông tin user đang đăng nhập
  const myClasses = classes || [];
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "delete" | "leave" | null;
    classId: number | null;
  }>({ isOpen: false, type: null, classId: null });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    classId: number | null;
    name: string;
    description: string;
  }>({ isOpen: false, classId: null, name: "", description: "" });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleMenu = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Chặn sự kiện click truyền ra ngoài thẻ Card (ngăn chuyển trang)
    setOpenMenuId(openMenuId === id ? null : id); // Bấm lại thì đóng, bấm thẻ khác thì mở
  };

  const handleEdit = (e: React.MouseEvent, item: ClassItems) => {
    e.stopPropagation();
    setOpenMenuId(null);
    // Đổ dữ liệu hiện tại của lớp vào form và mở form lên
    setEditModal({
      isOpen: true,
      classId: item.id,
      name: item.name,
      description: item.description || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editModal.classId) return;
    
    // Ràng buộc không cho để trống tên lớp
    if (!editModal.name.trim()) {
      alert("Tên lớp không được để trống!");
      return;
    }

    setIsProcessing(true);
    try {
      await updateClassMutation(editModal.classId, {
        name: editModal.name,
        description: editModal.description,
      });
      alert("✅ Cập nhật lớp thành công!");
      // Đóng modal sau khi lưu xong
      setEditModal({ isOpen: false, classId: null, name: "", description: "" });
    } catch (err: unknown) {
      alert("❌ Lỗi khi cập nhật lớp: " + err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setOpenMenuId(null);
    // Bật form xác nhận XÓA
    setConfirmModal({ isOpen: true, type: "delete", classId: id });
  };

  const handleLeave = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setOpenMenuId(null);
    // Bật form xác nhận RỜI
    setConfirmModal({ isOpen: true, type: "leave", classId: id });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.classId || !confirmModal.type) return;
    
    setIsProcessing(true);
    try {
      if (confirmModal.type === "delete") {
        await deleteClassMutation(confirmModal.classId);
      } else if (confirmModal.type === "leave") {
        await leaveClassMutation(confirmModal.classId);
      }
      // Đóng modal sau khi xong
      setConfirmModal({ isOpen: false, type: null, classId: null });
    } catch (err: unknown) {
      alert("❌ Có lỗi xảy ra: " + err);
    } finally {
      setIsProcessing(false);
    }
  };

console.log("Dữ liệu 1 lớp học từ Backend:", myClasses[0]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* 1. Trạng thái đang tải (Loading) */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ink-blue-text"></div>
          <p className="mt-4 text-ink-2 text-sm italic font-medium">
            Đang đồng bộ dữ liệu lớp học...
          </p>
        </div>
      )}

      {/* 2. Trạng thái có danh sách lớp */}
      {!isLoading && myClasses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myClasses.map((item) => {
            // KIỂM TRA QUYỀN ADMIN: So sánh ID người dùng đang đăng nhập với ID người tạo lớp
            // (Nếu Backend dùng user_id thì đổi user?.id thành user?.user_id nhé)
            const isAdmin = String(user?.id) === String(item.owner_user_id);

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/class/${item.id}`)}
                className="group bg-surface border border-rule rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col h-[260px]"
              >
                {/* Banner lớp học - Cao 100px */}
                <div
                  className={`relative h-[100px] p-4 ${
                    item.privacy === ClassPrivacy.PUBLIC
                      ? "bg-gradient-to-br from-ink-blue-text to-blue-500"
                      : "bg-gradient-to-br from-ink-1 to-slate-900"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-bold text-lg leading-tight truncate pr-6 group-hover:underline">
                      {item.name}
                    </h3>
                    
                    {/* KHU VỰC MENU 3 CHẤM */}
                    <div className="relative">
                      <button 
                        onClick={(e) => handleToggleMenu(e, item.id)}
                        className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* DROPDOWN MENU */}
                      {openMenuId === item.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-surface border border-rule rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                          {isAdmin ? (
                            <>
                              <button 
                                onClick={(e) => handleEdit(e, item)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-ink-1 hover:bg-surface-2 transition-colors text-left"
                              >
                                <Edit2 size={15} /> Chỉnh sửa
                              </button>
                              <button 
                                onClick={(e) => handleDelete(e, item.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-bold text-ink-red-text hover:bg-ink-red-fill transition-colors text-left"
                              >
                                <Trash2 size={15} /> Xóa lớp
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={(e) => handleLeave(e, item.id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm font-bold text-ink-red-text hover:bg-ink-red-fill transition-colors text-left"
                            >
                              <LogOut size={15} /> Rời lớp
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-white/80 text-xs mt-1 truncate opacity-90">
                    {item.owner_display_name || "Giáo viên"}
                  </p>

                  {/* Avatar chủ sở hữu */}
                  <div className="absolute -bottom-6 right-4 w-12 h-12 rounded-full bg-surface shadow-md flex items-center justify-center border-4 border-surface overflow-hidden">
                    <div className="w-full h-full bg-ink-blue-fill flex items-center justify-center text-ink-blue-text font-bold text-sm">
                      {item.owner_user_id ? String(item.owner_user_id).charAt(0) : "G"}
                    </div>
                  </div>
                </div>

                {/* Nội dung bên dưới banner */}
                <div className="p-4 pt-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Badge Trạng thái */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider ${
                          item.privacy === ClassPrivacy.PUBLIC
                            ? "bg-ink-green-fill text-ink-green-text border border-ink-green-border"
                            : "bg-ink-amber-fill text-ink-amber-text border border-ink-amber-border"
                        }`}
                      >
                        {item.privacy === ClassPrivacy.PUBLIC ? "Cộng đồng" : "Nhóm kín"}
                      </span>
                    </div>

                    {/* Meta data */}
                    <div className="flex flex-col gap-2">
                      {item.privacy === ClassPrivacy.PRIVATE && (
                        <div className="flex items-center gap-2 text-xs text-ink-amber-text font-medium">
                          <Lock size={14} />
                          <span>Chờ duyệt</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nút vào lớp chân thẻ */}
                  <div className="pt-3 border-t border-rule flex justify-end">
                    <span className="text-xs font-bold text-ink-blue-text flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      VÀO LỚP <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Trạng thái trống (Empty State) - Hiện khi user chưa join lớp nào */}
      {!isLoading && myClasses.length === 0 && !error && (
        <div className="w-full flex flex-col items-center justify-center py-24">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-ink-blue-fill rounded-full flex items-center justify-center">
              <span className="text-6xl">🏫</span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-surface p-2 rounded-full shadow-lg border border-rule">
              <Plus className="text-ink-blue-text" size={24} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-ink-1">
            Bắt đầu hành trình học tập
          </h2>
          <p className="text-ink-2 mt-2 text-center max-w-sm font-medium">
            Bạn chưa tham gia lớp học nào. Hãy sử dụng tính năng trên Header để
            tham gia hoặc tạo lớp mới.
          </p>
        </div>
      )}

      {/* 4. Trạng thái lỗi (Error) */}
      {error && (
        <div className="text-center py-20 bg-ink-red-fill rounded-2xl border border-ink-red-border mx-4">
          <p className="text-ink-red-text font-bold text-lg">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-surface border border-ink-red-border text-ink-red-text rounded-lg hover:bg-ink-red-fill transition-colors shadow-sm text-sm font-bold"
          >
            THỬ LẠI
          </button>
        </div>
      )}

      {/* FORM XÁC NHẬN (CONFIRM MODAL) */}
      {confirmModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-1/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation(); 
            setConfirmModal({ isOpen: false, type: null, classId: null });
          }}
        >
          <div 
            className="bg-surface w-full max-w-sm rounded-2xl shadow-xl border border-rule overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Chặn click xuyên qua nền
          >
            <div className="p-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                confirmModal.type === "delete" ? "bg-ink-red-fill text-ink-red-text" : "bg-ink-amber-fill text-ink-amber-text"
              }`}>
                <AlertTriangle size={24} />
              </div>
              
              <h3 className="text-lg font-bold text-ink-1 mb-2">
                {confirmModal.type === "delete" ? "Xóa lớp học" : "Rời khỏi lớp học"}
              </h3>
              
              <p className="text-ink-2 text-sm">
                {confirmModal.type === "delete" 
                  ? "Bạn có chắc chắn muốn xóa lớp học này không? Toàn bộ dữ liệu của lớp sẽ bị xóa vĩnh viễn và không thể khôi phục." 
                  : "Bạn có chắc chắn muốn rời khỏi lớp học này? Bạn sẽ không thể xem tài liệu của lớp trừ khi tham gia lại."}
              </p>
            </div>

            <div className="px-6 py-4 bg-surface-2 flex items-center justify-end gap-3 border-t border-rule">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: null, classId: null })}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-bold text-ink-2 hover:bg-surface border border-rule rounded-lg transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 ${
                  confirmModal.type === "delete" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-amber-600 hover:bg-amber-700"
                } disabled:opacity-70`}
              >
                {isProcessing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {confirmModal.type === "delete" ? "Xóa lớp" : "Rời lớp"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*FORM CHỈNH SỬA LỚP HỌC (EDIT MODAL) */}
      {editModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-1/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation(); 
            setEditModal({ ...editModal, isOpen: false });
          }}
        >
          <div 
            className="bg-surface w-full max-w-md rounded-2xl shadow-xl border border-rule overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-rule flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Edit2 size={16} />
              </div>
              <h3 className="text-lg font-bold text-ink-1">Chỉnh sửa lớp học</h3>
            </div>
            
            {/* Body (Form nhập liệu) */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink-1 mb-1">
                  Tên lớp <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={editModal.name}
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  className="w-full px-3 py-2 border border-rule-md rounded-lg focus:ring-2 focus:ring-ink-blue-text focus:border-ink-blue-text outline-none transition-all bg-surface text-ink-1" 
                  placeholder="Nhập tên lớp..." 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-1 mb-1">
                  Mô tả
                </label>
                <textarea 
                  value={editModal.description}
                  onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                  className="w-full px-3 py-2 border border-rule-md rounded-lg focus:ring-2 focus:ring-ink-blue-text focus:border-ink-blue-text outline-none transition-all bg-surface text-ink-1" 
                  rows={3} 
                  placeholder="Thêm mô tả cho lớp học..."
                ></textarea>
              </div>
            </div>

            {/* Footer (Nút bấm) */}
            <div className="px-6 py-4 bg-surface-2 flex items-center justify-end gap-3 border-t border-rule">
              <button
                onClick={() => setEditModal({ ...editModal, isOpen: false })}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-bold text-ink-2 hover:bg-surface border border-rule rounded-lg transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              
              <button
                onClick={handleSaveEdit}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
              >
                {isProcessing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

