import React, { useState } from "react";
import { useHome } from "@features/home/hooks/useHome";
import { X } from "lucide-react";

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({ isOpen, onClose }) => {
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PUBLIC");
  
  const { createClassMutation, isCreating } = useHome(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

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
    // 1. px-4 để Modal không dính sát mép màn hình mobile
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      {/* 2. w-full giúp co giãn, max-w-md giới hạn trên desktop */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        
        {/* Header Modal - Thêm nút X để mobile dễ bấm */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg md:text-xl font-black text-gray-800 tracking-tight">Tạo lớp học mới</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {/* Tên lớp */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Tên lớp học</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-gray-800" 
              placeholder="VD: Lập trình .NET nâng cao"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>

          {/* Mô tả */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Mô tả (Không bắt buộc)</label>
            <textarea 
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all min-h-[100px] resize-none text-gray-800" 
              placeholder="Nhập mô tả ngắn gọn về mục tiêu lớp học..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Trạng thái */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Chế độ hiển thị</label>
            <div className="relative">
                <select 
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white outline-none appearance-none transition-all text-gray-800 cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                >
                <option value="PUBLIC">🌐 Cộng đồng (Công khai)</option>
                <option value="PRIVATE">🔒 Nhóm kín (Yêu cầu mã)</option>
                </select>
                {/* Arrow icon cho select custom */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
            </div>
          </div>

          {/* Nút hành động - Trên mobile ưu tiên full width hoặc dàn hàng ngang rộng */}
          <div className="flex items-center gap-3 mt-4">
            <button 
              type="button" 
              className="flex-1 py-3.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all text-sm md:text-base" 
              onClick={onClose} 
              disabled={isCreating}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className={`flex-[2] py-3.5 ${isCreating ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all text-sm md:text-base`}
              disabled={isCreating}
            >
              {isCreating ? "ĐANG XỬ LÝ..." : "TẠO LỚP NGAY"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};