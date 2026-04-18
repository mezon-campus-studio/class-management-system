import type { ClassPrivacy } from "@shared/domain/enums";

export interface ClassItems {
  id: string;
  className: string;
  owner: string;
  status: ClassPrivacy;
  classCode: string;
  userJoinStatus: "joined" | "pending"
}
