export interface Category {
  id: number;
  name: string;
  vertical: string;
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
}
