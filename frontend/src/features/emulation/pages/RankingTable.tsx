import React from 'react';
import type { TeamRanking } from '@features/emulation/types';

interface RankingTableProps {
  title: string;
  rows: TeamRanking[];
  isMonthly?: boolean;
}

export const RankingTable = ({ title, rows, isMonthly }: RankingTableProps) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-slate-50 bg-white">
      <h3 className="text-sm font-bold text-slate-800 italic">{title}</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 font-bold">
          <tr>
            <th className="px-6 py-3 text-center w-16">Hạng</th>
            {isMonthly && ["T1", "T2", "T3", "T4"].map(t => (
              <th key={t} className="px-4 py-3 text-center">{t}</th>
            ))}
            <th className="px-6 py-3">Tổ</th>
            <th className="px-6 py-3 text-right">Điểm tổng</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.teamId} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 flex justify-center">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                  row.rank === 1 ? "bg-yellow-500 shadow-lg shadow-yellow-100" : 
                  row.rank === 2 ? "bg-slate-400" : 
                  row.rank === 3 ? "bg-amber-700" : "bg-slate-200 text-slate-500"
                }`}>
                  {row.rank}
                </span>
              </td>
              {isMonthly && row.weeks && (
                <>
                  <td className="px-4 py-4 text-center text-slate-500">{row.weeks.t1}</td>
                  <td className="px-4 py-4 text-center text-slate-500">{row.weeks.t2}</td>
                  <td className="px-4 py-4 text-center text-slate-500">{row.weeks.t3}</td>
                  <td className="px-4 py-4 text-center text-slate-500">{row.weeks.t4}</td>
                </>
              )}
              <td className="px-6 py-4 font-bold text-slate-700">Tổ {row.teamId}</td>
              <td className="px-6 py-4 text-right font-black text-indigo-600">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);