export class CartItemResponseDto {
  id: string;
  coffee: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export class CartResponseDto {
  id: string;
  items: CartItemResponseDto[];
  itemsTotal: number;
  uniqueCategories: string[];
  shippingFee: number;
  total: number;
} 