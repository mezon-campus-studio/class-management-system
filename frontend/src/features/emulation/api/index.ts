import type { CompetitionData, CompetitionHistory } from "@features/emulation/types";

// DỮ LIỆU MẪU ĐỂ TEST
const mockCompetitionData: CompetitionData = {
  teamCount: 4, // Admin có thể tùy chỉnh số lượng tổ
  teams: {
    1: [
      { id: "s1", name: "Đặng Phong Hào" },
      { id: "s2", name: "Trần Việt Tuấn" },
    ],
    2: [
      { id: "s3", name: "Lê Văn B" },
    ],
    3: [],
    4: [],
  },
  history: [
    { id: "h1", date: "07/04/2026", content: "1 đi học muộn", points: -10, teamId: 1, actor: "Đặng Phong Hào" },
    { id: "h2", date: "07/04/2026", content: "Bạn A 8 điểm kiểm tra bài cũ", points: 5, teamId: 1, actor: "Đặng Phong Hào" },
    { id: "h3", date: "08/04/2026", content: "Trực nhật sạch sẽ", points: 10, teamId: 2, actor: "Lê Văn B" },
  ],
  weeklyRanking: [
    { rank: 1, teamId: 1, points: 102 },
    { rank: 2, teamId: 2, points: 101 },
    { rank: 3, teamId: 3, points: 100 },
    { rank: 4, teamId: 4, points: 99 },
  ],
  monthlyRanking: [
    { rank: 1, teamId: 1, points: 432, weeks: { t1: 102, t2: 112, t3: 124, t4: 94 } },
    { rank: 2, teamId: 2, points: 421, weeks: { t1: 100, t2: 105, t3: 110, t4: 106 } },
  ]
};

export const emulationAPI = {
  // Lấy dữ liệu thi đua (mặc định giả lập delay 500ms)
  getCompetition: async (classId: string, week: number, month: number): Promise<CompetitionData> => {
    console.log(`Fetching competition for class ${classId}, week ${week}, month ${month}`);
    return new Promise((resolve) => setTimeout(() => resolve(mockCompetitionData), 500));
  },

  // Hàm dành cho Admin thêm điểm
  addLog: async (classId: string, log: Omit<CompetitionHistory, 'id'>) => {
    console.log("Gửi yêu cầu thêm điểm lên server:", log);
    return new Promise((resolve) => setTimeout(resolve, 300));
  },

  // Cập nhật số lượng tổ
  updateTeamCount: async (classId: string, newCount: number) => {
    console.log(`API: Lớp ${classId} đổi sang ${newCount} tổ`);
    return new Promise((resolve) => setTimeout(resolve, 300));
  },

  // Thêm thành viên vào tổ
  addMemberToTeam: async (classId: string, teamId: number, studentId: string) => {
    console.log(`API: Thêm SV ${studentId} vào Tổ ${teamId}`);
    return new Promise((resolve) => setTimeout(resolve, 300));
  },

  removeMemberFromTeam: async (classId: string, teamId: number, studentId: string) => {
    console.log(`API: Xóa SV ${studentId} khỏi Tổ ${teamId} của lớp ${classId}`);
    // Sau này sẽ thay đoạn này bằng axios.delete hoặc fetch tới endpoint thật
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
};