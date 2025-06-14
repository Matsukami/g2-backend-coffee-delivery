import { Coffee as PrismaCoffee } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class Coffee implements PrismaCoffee {
  id: string;
  name: string;
  description: string;
  price: Decimal;
  image_url: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: { id: string; name: string }[];
} 