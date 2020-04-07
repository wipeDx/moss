import { Group } from './group';
import { Calendar } from './calendar';

export const EmptyUser: User = {
  _id: '',
  name: '',
  email: '',
  groups: [],
  calendars: []
}

export class UserCredentials {
  _id: string;
  name?: string;
  email?: string;
  password?: string
}

export class User {
  _id?: string;
  name: string;
  password?: string;
  email: string;
  groups: string[];
  calendars: any;
  token?: string;
  uses2FA?: boolean;
}