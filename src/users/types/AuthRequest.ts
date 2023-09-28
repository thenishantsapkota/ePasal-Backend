import { Request } from 'express';
import { Users } from '../entities';

export interface ProtectedRequest extends Request {
  user: Users
}
