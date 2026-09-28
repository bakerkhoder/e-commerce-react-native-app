export interface Order {
  id: number;
  userId: number;
  items: {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
  }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}
