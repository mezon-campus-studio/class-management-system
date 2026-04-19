import React, { useState } from "react";
import { Plus, Minus, UserPlus, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEmulation } from "@features/emulation/hooks/useEmulation";
import { FilterSelect } from "@features/emulation/pages/FilterSelect";
import { RankingTable } from "@features/emulation/pages/RankingTable";
import { HistoryTable } from "@features/emulation/pages/HistoryTable";
// import { useAuth } from "@features/auth";
import { classDiagramAPI } from "@features/classDiagram/api";
import { emulationAPI } from "@features/emulation/api"; // Giả sử bạn có API này

export const Emulation = () => {
  const { classId } = useParams<{ classId: string }>();
  const { data, isLoading, filters, setFilters, changeTeamCount, refresh } =
    useEmulation(classId!);
  const [selectedTeam, setSelectedTeam] = useState(1);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);

  const [showPointModal, setShowPointModal] = useState(false);
  const [pointForm, setPointForm] = useState<{
    content: string;
    points: number | string;
  }>({
    content: "",
    points: 0,
  });

  // Kiểm tra quyền chỉnh sửa (Ví dụ: role là 'teacher' hoặc 'admin')
  // const { user } = useAuth();
  // TODO: Fetch ClassMember data for current user in this classId
  // const currentMember: ClassMember = await fetchCurrentClassMember(classId, user.id);
  // const canEdit = currentMember?.role === "ADMIN" || currentMember?.permissions.includes("DIAGRAM_EDIT");
  const canEdit = true;

  if (isLoading || !data)
    return <div className="p-10 text-center">Đang tải...</div>;

  const handleOpenAddMember = async () => {
    const res = await classDiagramAPI.getMembers(classId!);
    setMembers(res);
    setShowMemberModal(true);
  };

  const currentTeamMembers = data?.teams?.[selectedTeam] || [];

  // Nhấn vào tên học sinh để thêm vào tổ
  const handleSelectMember = async (studentId: string, studentName: string) => {
    try {
      await emulationAPI.addMemberToTeam(classId!, selectedTeam, studentId);
      alert(`Đã thêm ${studentName} vào Tổ ${selectedTeam}`);
      setShowMemberModal(false);
      refresh(); // Tải lại dữ liệu trang để cập nhật sĩ số/lịch sử
    } catch (error) {
      console.error("Lỗi khi thêm thành viên:", error);
      alert("Lỗi khi thêm thành viên");
    }
  };

  // Hàm xử lý xóa học sinh khỏi tổ
  const handleRemoveMember = async (studentId: string, studentName: string) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${studentName} khỏi Tổ ${selectedTeam}?`,
      )
    )
      return;

    try {
      await emulationAPI.removeMemberFromTeam(
        classId!,
        selectedTeam,
        studentId,
      );
      alert(`Đã xóa ${studentName} khỏi Tổ ${selectedTeam}`);
      refresh(); // Load lại dữ liệu để cập nhật danh sách
    } catch (error) {
      console.error("Lỗi khi xóa thành viên:", error);
      alert("Lỗi khi xóa thành viên");
    }
  };

  // 2. Hàm xử lý điểm
  const handleSubmitPoint = async () => {
    const pointsToSubmit = Number(pointForm.points);
    if (!pointForm.content) return alert("Vui lòng nhập nội dung!");

    if (isNaN(pointsToSubmit) || pointsToSubmit === 0) {
      return alert("Số điểm không hợp lệ!");
    }

    try {
      await emulationAPI.addPoints(
        classId!,
        selectedTeam,
        pointForm.content,
        pointsToSubmit,
      );
      alert(`Đã cập nhật điểm cho Tổ ${selectedTeam}`);
      setShowPointModal(false);
      setPointForm({ content: "", points: 0 }); // Reset form
      refresh(); // Load lại lịch sử và bảng xếp hạng
    } catch (error) {
      console.error("Lỗi nhập điểm", error);
      alert("Lỗi nhập điểm");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* THANH BỘ LỌC */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
        <div className="flex gap-4">
          <FilterSelect
            label="Tuần"
            val={filters.week}
            onChange={(v) => setFilters({ week: v })}
            options={[1, 2, 3, 4]}
          />
          <FilterSelect
            label="Tháng"
            val={filters.month}
            onChange={(v) => setFilters({ month: v })}
            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
          />
        </div>
        <button className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90">
          nội quy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* DANH SÁCH TỔ */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Danh sách tổ
            </p>

            {canEdit && (
              <div className="flex gap-1">
                <button
                  onClick={() => changeTeamCount(data.teamCount - 1)}
                  className="p-1 hover:bg-red-50 text-red-500 rounded border border-red-100 transition-colors"
                  title="Bớt 1 tổ"
                >
                  <Minus size={12} />
                </button>
                <button
                  onClick={() => changeTeamCount(data.teamCount + 1)}
                  className="p-1 hover:bg-green-50 text-green-500 rounded border border-green-100 transition-colors"
                  title="Thêm 1 tổ"
                >
                  <Plus size={12} />
                </button>
              </div>
            )}
          </div>

          {/* CÁC NÚT CHỌN TỔ */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 mb-4">
            {Array.from({ length: data.teamCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedTeam(i + 1)}
                className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                  selectedTeam === i + 1
                    ? "bg-slate-100 border-slate-300 text-slate-900 shadow-inner"
                    : "bg-white border-transparent text-slate-500 hover:bg-slate-50"
                }`}
              >
                Tổ {i + 1}
              </button>
            ))}
          </div>

          {/* PHẦN HIỂN THỊ THÀNH VIÊN TRONG TỔ (MỚI) */}
          <div className="pt-4 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Thành viên Tổ {selectedTeam}
            </p>
            <div className="space-y-2 min-h-[50px]">
              {currentTeamMembers.length > 0 ? (
                currentTeamMembers.map((member, idx) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {idx + 1}. {member.name}
                    </span>
                    {/* Nút xóa thành viên khỏi tổ */}
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMember(member.id, member.name);
                        }}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-slate-400 hover:text-red-500 p-2 transition-all"
                      >
                        <X size={14} />{" "}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Chưa có thành viên
                </p>
              )}
            </div>
          </div>

          {canEdit && (
            <button
              onClick={handleOpenAddMember}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all text-xs font-bold"
            >
              <UserPlus size={14} />
              Thêm TV vào Tổ {selectedTeam}
            </button>
          )}
        </div>

        {/* LỊCH SỬ THAY ĐỔI */}
        <HistoryTable
          selectedTeam={selectedTeam}
          history={data.history}
          canEdit={canEdit}
          onOpenPointModal={() => setShowPointModal(true)}
        />
      </div>

      <RankingTable title="Xếp hạng tuần" rows={data.weeklyRanking} />
      <RankingTable
        title="Xếp hạng tháng"
        rows={data.monthlyRanking}
        isMonthly
      />

      {/* MODAL */}
      {showMemberModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">
                Thêm học sinh vào Tổ {selectedTeam}
              </h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto p-2">
              {members.length > 0 ? (
                members.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMember(m.id, m.name)} // Click để thêm
                    className="p-3 hover:bg-indigo-50 rounded-xl cursor-pointer flex justify-between items-center group transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {m.name}
                    </span>
                    <Plus
                      size={14}
                      className="text-indigo-500 opacity-0 group-hover:opacity-100"
                    />
                  </div>
                ))
              ) : (
                <p className="text-center p-4 text-xs text-slate-400 italic">
                  Không có học sinh khả dụng
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL GHI ĐIỂM */}
      {showPointModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-5 bg-indigo-600 rounded-full"></span>
              Ghi điểm Tổ {selectedTeam}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase mb-1 block">
                  Nội dung
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ví dụ: Phát biểu xây dựng bài..."
                  value={pointForm.content}
                  onChange={(e) =>
                    setPointForm({ ...pointForm, content: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase mb-1 block">
                  Số điểm (+ cộng, - trừ)
                </label>
                <input
                  type="text" // Dùng text để kiểm soát chuỗi "-" tốt hơn trên mobile
                  inputMode="text"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ví dụ: 10 hoặc -5"
                  // Hiển thị: Nếu là 0 thì trống, nếu không thì hiện giá trị đang có (số hoặc chuỗi "-")
                  value={pointForm.points === 0 ? "" : pointForm.points}
                  onChange={(e) => {
                    const val = e.target.value;

                    // Logic chặn người dùng nhập chữ, chỉ cho phép số và một dấu "-" duy nhất
                    if (val === "" || val === "-" || !isNaN(Number(val))) {
                      setPointForm({
                        ...pointForm,
                        points: val, // Lưu trực tiếp string vào state, không cần Number() ở đây
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmitPoint();
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPointModal(false);
                    setPointForm({ content: "", points: 0 });
                  }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitPoint}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
