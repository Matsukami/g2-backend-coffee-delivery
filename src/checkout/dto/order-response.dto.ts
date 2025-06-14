export class OrderItemDto {
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export class OrderResponseDto {
  id: string;
  items: OrderItemDto[];
  uniqueCategories: string[];
  itemsTotal: number;
  shippingFee: number;
  total: number;
  status: string;
  createdAt: Date;
} 