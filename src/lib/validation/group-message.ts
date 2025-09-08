import { z } from "zod";

// User data validator for group messages
export const userDataValidator = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  imageUrl: z.string(),
  username: z.string(),
  createdAt: z.string(),
});

// Group message validator
export const groupMessageValidator = z.object({
  id: z.string(),
  text: z.string(),
  timestamp: z.number(),
  sender: userDataValidator,
});

export const groupMessageArrayValidator = z.array(groupMessageValidator);
export type GroupMessage = z.infer<typeof groupMessageValidator>;
export type UserData = z.infer<typeof userDataValidator>;
