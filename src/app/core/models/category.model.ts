export interface Category {
  id: number;
  name: string | null;
  imageUrl: string | null;
  description: string | null;
  productCount: number;
  canDelete: boolean;
}
