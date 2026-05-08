import { Category } from './category.model';

export interface Product {
  id: number;
  stock: number;
  name: string | null;
  brand: string | null;
  model: string | null;
  price: number;
  imageUrl: string | null;
  isFavorite: boolean;
  rating: number;
  createdAt: string;
  canDelete: boolean;
  category: Category;
}

export interface ProductDetailed extends Product {
  description: string | null;
  imageUrls: string[] | null;
  specifications: Record<string, string> | null;
}
