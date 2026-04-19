import { useState, useEffect } from 'react';
import { emulationAPI } from '@features/emulation/api';
import type { CompetitionData } from '@features/emulation/types';

export const useEmulation = (classId: string) => {
  const [data, setData] = useState<CompetitionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ week: 1, month: 4, year: 2026 });

  const changeTeamCount = async (newCount: number) => {
    if (newCount < 1) return;
    await emulationAPI.updateTeamCount(classId, newCount);
    // Refresh lại data sau khi update thành công
    loadData();
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await emulationAPI.getCompetition(classId, filters.week, filters.month);
      setData(result);
    } catch (error) {
      console.error("Lỗi tải dữ liệu thi đua:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (classId) loadData();
  }, [classId, filters.week, filters.month]);

  return {
    data,
    isLoading,
    filters,
    setFilters: (newFilters: Partial<{ week: number; month: number; year: number }>) => setFilters({ ...filters, ...newFilters }),
    refresh: loadData,
    changeTeamCount
  };
};