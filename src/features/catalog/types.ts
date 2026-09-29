export interface Category {
  id: number;
  name: string;
  vertical: string;
}
export interface ProductImage {
  id: number;
  imageUrl: string;
  thumbnailUrl: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  stockQuantity: number;
  unit: string;
  attributes: Record<string, string | number | boolean>;
  imageUrl: string | null;
  images: ProductImage[];
  thumbnailUrl: string | null; // convenience: primary image's thumbnail
}
