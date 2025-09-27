import { UserData } from "./user";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isNotification?: boolean;
}

export interface Chat {
  id: string;
  messages: Message[];
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
}

export interface FriendsWithLastMessage extends UserData {
  lastMessage: Message;
}
