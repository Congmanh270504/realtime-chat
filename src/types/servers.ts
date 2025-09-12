import { GroupMessage } from "./group-message";

export interface Servers {
  id: string;
  serverName: string;
  serverImage: string;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
}

export interface ServerWithLatestMessage extends Servers {
  latestMessage: GroupMessage;
}
