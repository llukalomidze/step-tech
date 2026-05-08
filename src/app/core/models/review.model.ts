import { User } from './user.model';

export interface Review {
  id: number;
  rating: number;
  createdAt: string;
  user: User;
}

export interface CreateReviewRequest {
  productId: number;
  rate: number;
}
