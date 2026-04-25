import type { ClassPrivacy } from "@shared/domain/enums";

export interface ClassItems {
  id: number;
  name: string;
  owner_user_id: string;
  description: string;
  code: string;
  privacy: ClassPrivacy;
  userJoinStatus: "joined" | "pending"
}

export interface ClassResponse {
  id: string;
  name: string;       
  description?: string;   
  privacy: ClassPrivacy; 
  owner_username: string;
  avatar_url: string;
  createdAt?: string;
}