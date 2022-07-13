import { User } from './user.model';

export interface Comment {
  id: number;
  parentCommentId: number;
  ownerId: number;
  txt: string;
  createdAt: string;
  deletedAt: string;
  children: Comment[];
  owner: User;
}
