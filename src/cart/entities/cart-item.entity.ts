import { CartItem as PrismaCartItem } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class CartItem implements PrismaCartItem {
  id: string;
  cartId: string;
  coffeeId: string;
  quantity: number;
  unit_price: Decimal;
  createdAt: Date;
  updatedAt: Date;
  
  // Campos adicionais não presentes no modelo Prisma
  coffee?: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  subtotal?: number;
} 