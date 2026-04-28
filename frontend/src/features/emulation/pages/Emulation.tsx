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
import { Modal } from "@shared/components/ui/Modal";

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
      <div className="flex justify-between items-center bg-surface p-3 rounded-xl shadow-sm border border-rule">
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
        <button className="bg-ink-green-text text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90">
          nội quy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* DANH SÁCH TỔ */}
        <div className="bg-surface p-4 rounded-2xl border border-rule shadow-sm h-fit">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest">
              Danh sách tổ
            </p>

            {canEdit && (
              <div className="flex gap-1">
                <button
                  onClick={() => changeTeamCount(data.teamCount - 1)}
                  className="p-1 hover:bg-ink-red-fill text-ink-red-text rounded border border-ink-red-border transition-colors"
                  title="Bớt 1 tổ"
                >
                  <Minus size={12} />
                </button>
                <button
                  onClick={() => changeTeamCount(data.teamCount + 1)}
                  className="p-1 hover:bg-ink-green-fill text-ink-green-text rounded border border-ink-green-border transition-colors"
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
                    ? "bg-surface-2 border-rule-md text-ink-1 shadow-inner"
                    : "bg-surface border-transparent text-ink-2 hover:bg-surface-2"
                }`}
              >
                Tổ {i + 1}
              </button>
            ))}
          </div>

          {/* PHẦN HIỂN THỊ THÀNH VIÊN TRONG TỔ (MỚI) */}
          <div className="pt-4 border-t border-rule">
            <p className="text-[10px] font-black text-ink-3 uppercase tracking-widest mb-3">
              Thành viên Tổ {selectedTeam}
            </p>
            <div className="space-y-2 min-h-[50px]">
              {currentTeamMembers.length > 0 ? (
                currentTeamMembers.map((member, idx) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-sm font-medium text-ink-1">
                      {idx + 1}. {member.name}
                    </span>
                    {/* Nút xóa thành viên khỏi tổ */}
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveMember(member.id, member.name);
                        }}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-ink-3 hover:text-ink-red-text p-2 transition-all"
                      >
                        <X size={14} />{" "}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-ink-3 italic">
                  Chưa có thành viên
                </p>
              )}
            </div>
          </div>

          {canEdit && (
            <button
              onClick={handleOpenAddMember}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2 border-2 border-dashed border-rule rounded-xl text-ink-3 hover:border-ink-blue-border hover:text-ink-blue-text transition-all text-xs font-bold"
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
      <Modal 
        isOpen={showMemberModal} 
        onClose={() => setShowMemberModal(false)} 
        title={`Thêm học sinh vào Tổ ${selectedTeam}`}
      >
        <div className="flex flex-col gap-1">
          {members.length > 0 ? (
                members.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMember(m.id, m.name)} // Click để thêm
                    className="p-3 hover:bg-ink-blue-fill rounded-xl cursor-pointer flex justify-between items-center group transition-colors"
                  >
                    <span className="text-sm font-medium text-ink-1">
                      {m.name}
                    </span>
                    <Plus
                      size={14}
                      className="text-ink-blue-text opacity-0 group-hover:opacity-100"
                    />
                  </div>
                ))
              ) : (
                <p className="text-center p-4 text-xs text-ink-3 italic">
                  Không có học sinh khả dụng
                </p>
              )}
            </div>
        </div>
      </Modal>

      {/* MODAL GHI ĐIỂM */}
      <Modal 
        isOpen={showPointModal} 
        onClose={() => { setShowPointModal(false); setPointForm({ content: "", points: 0 }); }} 
        title={`Ghi điểm Tổ ${selectedTeam}`}
      >
        <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-ink-3 uppercase mb-1 block">
                  Nội dung
                </label>
                <input
                  type="text"
                  className="w-full border border-rule rounded-xl p-3 text-sm focus:ring-2 focus:ring-ink-blue-text outline-none transition-all"
                  placeholder="Ví dụ: Phát biểu xây dựng bài..."
                  value={pointForm.content}
                  onChange={(e) =>
                    setPointForm({ ...pointForm, content: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-ink-3 uppercase mb-1 block">
                  Số điểm (+ cộng, - trừ)
                </label>
                <input
                  type="text" // Dùng text để kiểm soát chuỗi "-" tốt hơn trên mobile
                  inputMode="text"
                  className="w-full border border-rule rounded-xl p-3 text-sm focus:ring-2 focus:ring-ink-blue-text outline-none transition-all"
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
                  className="flex-1 py-3 bg-surface-2 text-ink-2 rounded-xl font-bold text-sm hover:bg-surface-3 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitPoint}
                  className="flex-1 py-3 bg-ink-blue-text text-white rounded-xl font-bold text-sm shadow-lg shadow-ink-blue-fill hover:opacity-90 transition-all"
                >
                  Xác nhận
                </button>
              </div>
            </div>
            </div>
      </Modal>
    </div>
  );
};
