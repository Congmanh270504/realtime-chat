import { UserData } from "./user";

export interface Servers {
  id: string;
  serverName: string;
  serverImage: string;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
}
