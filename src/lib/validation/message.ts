import { z } from "zod";

export const messageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  receiverId: z.string().optional(), // Optional vì trong API route không cần thiết
  text: z.string(),
  timestamp: z.number(),
  isNotification: z.boolean().optional(), // Thêm trường isNotification
});

export const messageArrayValidator = z.array(messageValidator);

export type Message = z.infer<typeof messageValidator>;
