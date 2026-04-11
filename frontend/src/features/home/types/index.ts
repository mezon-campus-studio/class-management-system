export interface ClassItems {
  id: string;
  className: string;
  owner: string;
  status: "public" | "private";
  classCode: string;
  userJoinStatus: "joined" | "pending"
}
