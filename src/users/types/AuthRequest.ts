import { Request } from 'express';
import { UserPayload } from './UserPayload';

export interface ProtectedRequest extends Request {
  user: UserPayload;
}
