export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}
export type ShippingMethodType = "INSIDE_BEIRUT" | "OUTSIDE_BEIRUT";
export type PaymentMethodType = "CASH_ON_DELIVERY" | "WHISH_MONEY";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  addressLine: string;
  notes?: string;
}

export interface Order {
  // ...existing fields
  shippingAddress: ShippingAddress;
  shippingMethod: ShippingMethodType;
  shippingCost: number;
  paymentMethod: PaymentMethodType;
}

export interface CheckoutPayload {
  fullName: string;
  phone: string;
  city: string;
  addressLine: string;
  notes?: string;
  shippingMethod: ShippingMethodType;
  paymentMethod: PaymentMethodType;
  saveAsDefault: boolean;
}
