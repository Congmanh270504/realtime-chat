import { UserData } from "./user";

export interface GroupMessage {
  id: string;
  text: string;
  timestamp: number;
  sender: UserData;
}
