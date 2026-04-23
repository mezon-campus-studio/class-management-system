import React from "react";
import type { TeamRanking } from "@features/emulation/types";
import Rank1 from "@assets/rank1.png";
import Rank2 from "@assets/rank2.png";
import Rank3 from "@assets/rank3.png";

interface RankingTableProps {
  title: string;
  rows: TeamRanking[];
  isMonthly?: boolean;
}

export const RankingTable = ({ title, rows, isMonthly }: RankingTableProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return Rank1;
      case 2:
        return Rank2;
      case 3:
        return Rank3;
      default:
        return null;
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-rule shadow-sm overflow-hidden">
      <div className="p-4 border-b border-rule bg-surface">
        <h3 className="text-sm font-bold text-ink-1 italic">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-ink-3 font-bold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-6 py-3 text-center w-20">Hạng</th>
              {isMonthly &&
                ["T1", "T2", "T3", "T4"].map((t) => (
                  <th key={t} className="px-4 py-3 text-center">
                    {t}
                  </th>
                ))}
              {/* CHỈNH Ở ĐÂY: Thêm text-center để tiêu đề Tổ nằm giữa */}
              <th className="px-6 py-3 text-center">Tổ</th>
              <th className="px-6 py-3 text-right">Điểm tổng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {rows.map((row) => (
              <tr
                key={row.teamId}
                className="hover:bg-surface-2 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex justify-center items-center">
                    {row.rank <= 3 ? (
                      <img
                        src={getRankIcon(row.rank)!}
                        alt={`Top ${row.rank}`}
                        className="w-8 h-8 md:w-9 md:h-9 object-contain"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black text-ink-3 bg-surface-2 border border-rule">
                        {row.rank}
                      </span>
                    )}
                  </div>
                </td>
                {isMonthly && row.weeks && (
                  <>
                    <td className="px-4 py-4 text-center text-ink-3 font-medium">
                      {row.weeks.t1}
                    </td>
                    <td className="px-4 py-4 text-center text-ink-3 font-medium">
                      {row.weeks.t2}
                    </td>
                    <td className="px-4 py-4 text-center text-ink-3 font-medium">
                      {row.weeks.t3}
                    </td>
                    <td className="px-4 py-4 text-center text-ink-3 font-medium">
                      {row.weeks.t4}
                    </td>
                  </>
                )}
                {/* CHỈNH Ở ĐÂY: Thêm text-center để nội dung Tổ nằm giữa */}
                <td className="px-6 py-4 text-center font-bold text-ink-1">
                  Tổ {row.teamId}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-black text-ink-blue-text text-base">
                    {row.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};