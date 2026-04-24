export interface CompetitionHistory {
  id: string;
  date: string;
  content: string;
  points: number;
  teamId: number;
  actor: string;
}

export interface TeamRanking {
  rank: number;
  teamId: number;
  points: number;
  // Optional cho bảng xếp hạng tháng
  weeks?: { [key: string]: number }; 
}

export interface TeamMember {
  id: string;
  name: string;
}

export interface CompetitionData {
  teamCount: number;
  teams: { [key: number]: TeamMember[] };
  history: CompetitionHistory[];
  weeklyRanking: TeamRanking[];
  monthlyRanking: TeamRanking[];
}