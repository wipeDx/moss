import { User } from './user';

export class Group {
  _id: string;
  name: string;
  members: string[];
}

export class PopulatedGroup {
  _id: string;
  name: string;
  members: User[];
}