import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Paged } from '../models/paged.model';
import { CreateReviewRequest, Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly api = inject(ApiService);

  forProduct(productId: number, page = 1, take = 5): Observable<Paged<Review>> {
    return this.api.get<Paged<Review>>(`/api/reviews/${productId}`, { Page: page, Take: take });
  }

  create(req: CreateReviewRequest): Observable<unknown> {
    return this.api.post<unknown, CreateReviewRequest>('/api/reviews', req);
  }
}
