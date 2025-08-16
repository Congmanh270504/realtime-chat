export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  username: string;
  createdAt: string;
}

export interface ClerkWebhookEvent {
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    username?: string;
  };
  type: string;
}
