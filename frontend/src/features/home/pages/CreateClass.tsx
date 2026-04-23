import React, { useState } from "react";
import { useHome } from "@features/home/hooks/useHome";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose }) => {
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PUBLIC");
  
  // Lấy đúng tên biến từ useHome bản hoàn chỉnh mình vừa gửi
  const { createClassMutation, isCreating } = useHome(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Đã nhấn nút tạo lớp với tên:", className);
    
    if (!className.trim()) {
        console.log("Tên lớp trống, không chạy tiếp!");
        return;
    }

    try {
      await createClassMutation({
        className: className, 
        description: description,
        status: status
      });
    
      setClassName("");
      setDescription("");
      setStatus("PUBLIC");
      onClose();
    } catch (error) {
      console.error("Lỗi khi tạo lớp:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in">
        <h2 className="text-xl font-bold mb-4 font-serif text-ink-1">Tạo lớp học mới</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-ink-2">Tên lớp</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="VD: Lập trình .NET nâng cao"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-ink-2">Mô tả</label>
            <textarea 
              className="input-field min-h-[80px]" 
              placeholder="Nhập mô tả ngắn gọn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-ink-2">Trạng thái</label>
            <select 
              className="input-field"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PUBLIC">Cộng đồng (Public)</option>
              <option value="PRIVATE">Nhóm kín (Private)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-rule">
            <button 
              type="button" 
              className="px-4 py-2 text-ink-2 hover:bg-surface-2 rounded-lg transition-colors" 
              onClick={onClose} 
              disabled={isCreating}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isCreating}
            >
              {isCreating ? "Đang tạo..." : "Tạo lớp ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};