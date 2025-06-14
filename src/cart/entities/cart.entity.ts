import { Cart as PrismaCart } from '@prisma/client';

export class Cart implements PrismaCart {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  status_payment: string;
  data_time_completed: Date | null;
} 