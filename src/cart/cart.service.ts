import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            coffee: true,
          },
        },
      },
    });
    if (!cart) throw new NotFoundException(`Carrinho com ID ${cartId} não encontrado!`);

    const items = cart.items.map(item => ({
      ...item,
      subtotal: Number(item.quantity) * Number(item.unit_price),
    }));

    return {
      id: cart.id,
      items,
    };
  }

  async addItem(cartId: string, addItemDto: AddItemDto) {
    const { coffeeId, quantity } = addItemDto;

    if (quantity < 1 || quantity > 5) {
      throw new BadRequestException('Quantidade precisa ser entre 1 e 5');
    }

    const coffee = await this.prisma.coffee.findUnique({ where: { id: coffeeId } });
    if (!coffee) throw new NotFoundException(`Café com ID ${coffeeId} não encontrado!`);

    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_coffeeId: { cartId, coffeeId } },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > 5) throw new BadRequestException('Máximo de quantidade por item é 5!');
      const updated = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { coffee: true },
      });
      return { ...updated, subtotal: Number(updated.quantity) * Number(updated.unit_price) };
    }

    const item = await this.prisma.cartItem.create({
      data: {
        cart: { connect: { id: cartId } },
        coffee: { connect: { id: coffeeId } },
        quantity,
        unit_price: coffee.price,
      },
      include: { coffee: true },
    });
    return { ...item, subtotal: Number(item.quantity) * Number(item.unit_price) };
  }

  async updateItem(cartId: string, itemId: string, updateItemDto: UpdateItemDto) {
    const { quantity } = updateItemDto;
    if (quantity < 1 || quantity > 5) {
      throw new BadRequestException('Quantidade precisa ser entre 1 e 5');
    }
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
      include: { coffee: true },
    });
    if (!item) throw new NotFoundException(`Item com ID ${itemId} não encontrado no carrinho ${cartId}`);

    const updated = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { coffee: true },
    });
    return { ...updated, subtotal: Number(updated.quantity) * Number(updated.unit_price) };
  }

  async removeItem(cartId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({ where: { id: itemId, cartId } });
    if (!item) throw new NotFoundException(`Item com ID ${itemId} não encontrado no carrinho ${cartId}`);
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { success: true };
  }
}