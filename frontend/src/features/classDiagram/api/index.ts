// src/features/classDiagram/api.ts
import type {
  ClassDiagramData,
  AttendanceStatus,
  GroupData,
  DeskData,
  PositionData,
} from "@features/classDiagram/types";
import { apiClient } from "@services/api-client";

// CÁC TYPE TRUNG GIAN ĐỂ HỨNG DỮ LIỆU THÔ TỪ BACKEND
type GenericResponse = Record<string, unknown>;

type RawGroupListBE = {
  id: number;
  name: string;
};

type RawStudentData = {
  user_id?: string | number;
  user_display_name?: string;
  avatar_url?: string;
  user_avatar_url?: string;
  attendance_status?: string;
};

type RawDeskObj = Record<
  string,
  { desk_positions?: Record<string, RawStudentData>[] }
>;
type RawGroupObj = Record<string, { desks?: RawDeskObj[] }>;

type RawClassDiagramBE = {
  groups?: RawGroupObj[];
};

type RawUnseatedMember = {
  user_id: string | number;
  user_display_name?: string;
};

// BỘ HELPER XỬ LÝ UNKNOWN AN TOÀN
const extractData = <T>(response: unknown): T => {
  if (!response) return {} as T;
  const res = response as Record<string, unknown>;
  return (res.data ?? res ?? {}) as T;
};

const extractList = <T>(response: unknown): T[] => {
  if (!response) return [];
  const res = response as Record<string, unknown>;
  const data = res.data as Record<string, unknown> | undefined;
  return (data?.data || res.data || res || []) as T[];
};

export const classDiagramAPI = {
  // 1. LẤY SƠ ĐỒ LỚP (ĐÃ XỬ LÝ ANY Ở CÁC VÒNG LẶP FOREACH)
  getDiagram: async (classId: string): Promise<ClassDiagramData> => {
    try {
      const [seatsResponse, groupsResponse] = await Promise.all([
        apiClient.get(`/seats/classes/${classId}`),
        apiClient.get(`/classes/${classId}/groups?_t=${new Date().getTime()}`),
      ]);

      const backendData = extractData<RawClassDiagramBE>(seatsResponse);
      const groupsListBE = extractList<RawGroupListBE>(groupsResponse);

      const groups: GroupData[] = [];
      let totalStudents = 0;
      let presentCount = 0;
      let excusedCount = 0;
      let unexcusedCount = 0;
      let lateCount = 0;

      if (backendData && backendData.groups) {
        backendData.groups.forEach((groupObj: RawGroupObj) => {
          const groupIdStr = Object.keys(groupObj)[0];
          const groupDataBE = groupObj[groupIdStr];
          const groupId = parseInt(groupIdStr);

          const matchedGroup = groupsListBE.find((g) => g.id === groupId);
          const groupName = matchedGroup ? matchedGroup.name : `Tổ ${groupId}`;

          const desks: DeskData[] = [];

          if (groupDataBE.desks) {
            groupDataBE.desks.forEach((deskObj: RawDeskObj) => {
              const deskIdStr = Object.keys(deskObj)[0];
              const deskPositionsBE = deskObj[deskIdStr].desk_positions;
              const deskId = parseInt(deskIdStr);

              const positions: PositionData[] = [];

              if (deskPositionsBE) {
                deskPositionsBE.forEach(
                  (posObj: Record<string, RawStudentData>) => {
                    const posIdStr = Object.keys(posObj)[0];
                    const studentData = posObj[posIdStr];
                    const positionId = parseInt(posIdStr);

                    let student = null;
                    if (studentData && studentData.user_id) {
                      const beStatus =
                        studentData.attendance_status || "PRESENT";
                      const statusMapUI: Record<string, AttendanceStatus> = {
                        PRESENT: "present",
                        ABSENT_EXCUSED: "absent_excused",
                        ABSENT_UNEXCUSED: "absent_unexcused",
                        LATE: "late",
                      };
                      const currentStatus = statusMapUI[beStatus] || "present";

                      totalStudents++;
                      if (currentStatus === "present") presentCount++;
                      else if (currentStatus === "absent_excused")
                        excusedCount++;
                      else if (currentStatus === "absent_unexcused")
                        unexcusedCount++;
                      else if (currentStatus === "late") lateCount++;

                      student = {
                        id: String(studentData.user_id),
                        name: studentData.user_display_name || "Vô danh",
                        user_avatar_url: studentData.user_avatar_url || studentData.avatar_url || null,
                        status: currentStatus,
                        groupId,
                        deskId,
                        positionId,
                      };
                    }
                    positions.push({ positionId, student });
                  },
                );
              }
              desks.push({ deskId, positions });
            });
          }
          groups.push({ groupId, name: groupName, desks });
        });
      }

      return {
        totalStudents,
        presentCount,
        excusedCount,
        unexcusedCount,
        lateCount,
        groups,
      };
    } catch (error: unknown) {
      console.error("Lỗi lấy sơ đồ lớp:", error);
      throw error;
    }
  },

  // 2. GỌI API ĐIỂM DANH
  updateAttendance: async (
    classId: string,
    groupId: number,
    studentId: string,
    status: AttendanceStatus,
  ): Promise<GenericResponse> => {
    const statusMap: Record<string, string> = {
      present: "PRESENT",
      absent_excused: "ABSENT_EXCUSED",
      absent_unexcused: "ABSENT_UNEXCUSED",
      late: "LATE",
    };

    const payload = {
      user_id: parseInt(studentId),
      attendance_status: statusMap[status] || "PRESENT",
    };

    try {
      const response = await apiClient.post(
        `/attendances/classes/${classId}/groups/${groupId}`,
        payload,
      );
      return extractData<GenericResponse>(response);
    } catch (error: unknown) {
      console.error("Lỗi điểm danh:", error);
      throw error;
    }
  },

  // 3. XẾP CHỖ (CHƯA CÓ GHẾ -> CÓ GHẾ)
  assignSeat: async (
    studentId: string,
    targetGroupId: number,
    targetDeskId: number,
    targetPositionId: number,
    classId: string,
    sourceGroupId: number | null,
    sourceDeskId: number | null,
    sourcePositionId: number | null,
  ): Promise<GenericResponse> => {
    const payload = {
      user_id: parseInt(studentId),
      source_group_id: sourceGroupId,
      source_desk: sourceDeskId,
      source_desk_position: sourcePositionId,
      target_group_id: targetGroupId,
      target_desk: targetDeskId,
      target_desk_position: targetPositionId,
    };

    try {
      const response = await apiClient.patch(
        `/seats/classes/${classId}/seating`,
        payload,
      );
      return extractData<GenericResponse>(response);
    } catch (error: unknown) {
      console.error("Lỗi khi xếp chỗ:", error);
      throw error;
    }
  },

  // 4. CHUYỂN CHỖ / ĐỔI CHỖ (ĐÃ CÓ GHẾ -> GHẾ KHÁC)
  updateSeat: async (
    studentId: string,
    targetGroupId: number,
    targetDeskId: number,
    targetPositionId: number,
    classId: string,
    sourceGroupId: number,
    sourceDeskId: number,
    sourcePositionId: number,
  ): Promise<GenericResponse> => {
    const payload = {
      user_id: parseInt(studentId),
      source_group_id: sourceGroupId,
      source_desk: sourceDeskId,
      source_desk_position: sourcePositionId,
      target_group_id: targetGroupId,
      target_desk: targetDeskId,
      target_desk_position: targetPositionId,
    };

    try {
      const response = await apiClient.patch(
        `/seats/classes/${classId}`,
        payload,
      );
      return extractData<GenericResponse>(response);
    } catch (error: unknown) {
      console.error("Lỗi khi đổi chỗ:", error);
      throw error;
    }
  },

  // 5. RANDOM CHỖ NGỒI
  shuffleSeats: async (classId: string): Promise<GenericResponse> => {
    try {
      const response = await apiClient.get(`/seats/classes/${classId}/shuffle`);
      return extractData<GenericResponse>(response);
    } catch (error: unknown) {
      console.error("Lỗi xếp chỗ tự động:", error);
      throw error;
    }
  },

  // 6. LẤY HỌC SINH CHƯA CÓ CHỖ
  getMembers: async (
    classId: string,
  ): Promise<{ id: string; name: string }[]> => {
    try {
      const response = await apiClient.get(
        `/classes/${classId}/members/unseated`,
      );

      const responseData = extractList<RawUnseatedMember>(response);

      return responseData.map((m) => ({
        id: String(m.user_id),
        name: m.user_display_name || "Vô danh",
      }));
    } catch (error: unknown) {
      console.error("Lỗi lấy danh sách học sinh chưa có chỗ:", error);
      return [];
    }
  },
};
