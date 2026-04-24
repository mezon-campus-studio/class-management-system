import { useState, useEffect } from 'react';
import { classDiagramAPI } from '@features/classDiagram/api';
import type { ClassDiagramData } from '@features/classDiagram/types';

export const useClassDiagram = (classId: string) => {
  const [data, setData] = useState<ClassDiagramData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiagram = async () => {
    try {
      setIsLoading(true);
      const result = await classDiagramAPI.getDiagram(classId);
      setData(result);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (classId) fetchDiagram();
  }, [classId]);

  return { data, isLoading, refresh: fetchDiagram };
};