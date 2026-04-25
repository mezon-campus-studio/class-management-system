import { useNavigate } from "react-router-dom";
import { useHome } from "@features/home/hooks/useHome";
import { Lock, MoreVertical, ArrowRight } from "lucide-react";
import { Plus } from "lucide-react";
import { ClassPrivacy } from "@shared/domain/enums";


export const HomePage = () => {
  const navigate = useNavigate();
  const { classes, isLoading, error } = useHome();
  const myClasses = classes || [];
console.log("🔍 Dữ liệu 1 lớp học từ Backend:", myClasses[0]);
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
          {myClasses.map((item) => (
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
                  <button className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                    <MoreVertical size={18} />
                  </button>
                </div>
                <p className="text-white/80 text-xs mt-1 truncate opacity-90">
                  {typeof item.owner_user_id}
                </p>

                {/* Avatar chủ sở hữu (Profile pic nhỏ) */}
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
                        item.privacy === "PUBLIC"
                          ? "bg-ink-green-fill text-ink-green-text border border-ink-green-border"
                          : "bg-ink-amber-fill text-ink-amber-text border border-ink-amber-border"
                      }`}
                    >
                      {item.privacy === "PUBLIC" ? "Cộng đồng" : "Nhóm kín"}
                    </span>
                  </div>

                  {/* Meta data */}
                  <div className="flex flex-col gap-2">
                    {item.privacy === "PRIVATE" && (
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
          ))}
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
    </div>
  );
};
