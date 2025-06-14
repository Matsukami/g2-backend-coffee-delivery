import { Controller, Post, Patch, Delete, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getCart(@Param('id') id: string) {
    return this.cartService.getCart(id);
  }

  @Post('/cart/items/:id')
  @HttpCode(HttpStatus.CREATED)
  async addItem(@Param('id') cartId: string, @Body() addItemDto: AddItemDto) {
    return this.cartService.addItem(cartId, addItemDto);
  }

  @Patch('/cart/items/:cartId/:itemId')
  @HttpCode(HttpStatus.OK)
  async updateItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.cartService.updateItem(cartId, itemId, updateItemDto);
  }

  @Delete('/cart/items/:cartId/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(@Param('cartId') cartId: string, @Param('itemId') itemId: string) {
    await this.cartService.removeItem(cartId, itemId);
  }
  
}