export interface EmulationCategory {
  id: string;
  name: string;
  description: string | null;
  defaultScore: number;
  active: boolean;
}

export interface EmulationEntry {
  id: string;
  categoryId: string;
  categoryName: string;
  memberId: string;
  score: number;
  note: string | null;
  recordedById: string;
  occurredAt: string;
  createdAt: string;
}

export interface MemberScoreSummary {
  memberId: string;
  totalScore: number;
}
