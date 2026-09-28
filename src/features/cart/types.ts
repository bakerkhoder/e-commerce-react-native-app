export interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
}
