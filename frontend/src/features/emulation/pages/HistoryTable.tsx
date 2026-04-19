import React from "react";
import type { CompetitionHistory } from "@features/emulation/types";

interface EmulationHistoryProps {
  selectedTeam: number;
  history: CompetitionHistory[];
  canEdit: boolean;
  onOpenPointModal: () => void;
}

export const HistoryTable = ({
  selectedTeam,
  history,
  canEdit,
  onOpenPointModal,
}: EmulationHistoryProps) => {
  const filteredHistory = history.filter((h) => h.teamId === selectedTeam);

  return (
    <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px] md:min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold italic text-slate-700">Lịch sử</h3>
          <p className="text-[10px] text-slate-400 md:hidden">Tổ {selectedTeam}</p>
        </div>
        {canEdit && (
          <button
            onClick={onOpenPointModal}
            className="text-[10px] md:text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-2 rounded-lg transition-all active:scale-95 shadow-sm"
          >
            + Ghi điểm
          </button>
        )}
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm border-collapse">
          {/* Header chỉ hiện trên Tablet/Desktop */}
          <thead className="hidden md:table-header-group bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 w-32">Ngày tháng</th>
              <th className="px-6 py-3">Chi tiết thay đổi</th>
              <th className="px-6 py-3 text-center w-24">Điểm</th>
              <th className="px-6 py-3 w-40">Người thực hiện</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 md:divide-slate-50">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group flex flex-col md:table-row p-4 md:p-0">
                  
                  {/* Mobile Row 1: Ngày và Điểm */}
                  <td className="md:table-cell md:px-6 md:py-4 flex justify-between items-center mb-1 md:mb-0">
                    <span className="text-[10px] md:text-xs text-slate-400 md:text-slate-500 font-medium uppercase md:capitalize">
                      {log.date}
                    </span>
                    {/* Điểm hiện ở cuối hàng trên Mobile */}
                    <span className={`md:hidden text-[11px] font-black px-2 py-0.5 rounded-md ${
                        log.points >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                      }`}>
                      {log.points >= 0 ? `+${log.points}` : log.points}
                    </span>
                  </td>

                  {/* Chi tiết thay đổi */}
                  <td className="md:table-cell md:px-6 md:py-4 mb-2 md:mb-0">
                    <span className="text-sm text-slate-700 font-bold md:font-semibold line-clamp-2 md:line-clamp-1 group-hover:line-clamp-none transition-all">
                      {log.content}
                    </span>
                  </td>

                  {/* Điểm (Chỉ hiện trên Desktop ở cột riêng) */}
                  <td className="hidden md:table-cell md:px-6 md:py-4 text-center">
                    <span className={`text-xs font-black px-2 py-1 rounded-md ${
                        log.points >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                      }`}>
                      {log.points >= 0 ? `+${log.points}` : log.points}
                    </span>
                  </td>

                  {/* Người thực hiện */}
                  <td className="md:table-cell md:px-6 md:py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[9px] md:text-[10px] font-bold text-indigo-500 uppercase border border-indigo-100">
                        {log.actor.charAt(0)}
                      </div>
                      <span className="text-[11px] md:text-xs font-bold text-slate-500 md:text-slate-600 truncate italic md:not-italic">
                        {log.actor}
                      </span>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-20 text-center text-slate-400 text-xs italic">
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};