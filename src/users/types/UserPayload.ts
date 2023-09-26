export interface UserPayload {
  id: number;
  email: string;
}

export type UserPayloadKeys = keyof UserPayload;
