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
  name: string;       
  description?: string;
  code: string;
  classCode: string;       
  privacy: ClassPrivacy; 
  owner_username: string;
  avatar_url: string;
  createdAt?: string;
}