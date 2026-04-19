import type { ClassPrivacy } from "@shared/domain/enums";

export interface ClassItems {
  id: string;
  className: string;
  owner: string;
  status: ClassPrivacy;
  classCode: string;
  userJoinStatus: "joined" | "pending"
}

export interface ClassResponse {
  id: string;
  className: string;
  description?: string;
  classCode: string;
  status: ClassPrivacy;
  createdAt?: string;
}