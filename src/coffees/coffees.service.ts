import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Injectable()
export class CoffeesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const coffees = await this.prisma.coffee.findMany({
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });
    return coffees.map(coffee => ({
      ...coffee,
      tags: coffee.tags.map(ct => ct.tag),
    }));
  }

  async findOne(id: string) {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });
    if (!coffee) throw new NotFoundException(`Café com ID ${id} não encontrado!`);
    return {
      ...coffee,
      tags: coffee.tags.map(ct => ct.tag),
    };
  }

  async create(data: CreateCoffeeDto) {
    const { tags, ...coffeeData } = data;
    const coffee = await this.prisma.coffee.create({
      data: {
        ...coffeeData,
        tags: {
          create: tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName },
              },
            },
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
      },
    });
    return {
      ...coffee,
      tags: coffee.tags.map(ct => ct.tag),
    };
  }

  async update(id: string, data: UpdateCoffeeDto) {
    const { tags, ...coffeeData } = data;

    await this.findOne(id);

    if (tags) {

      await this.prisma.coffeeTag.deleteMany({ where: { coffeeId: id } });
    }

    const coffee = await this.prisma.coffee.update({
      where: { id },
      data: {
        ...coffeeData,
        ...(tags && {
          tags: {
            create: tags.map(tagName => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
                },
              },
            })),
          },
        }),
      },
      include: {
        tags: { include: { tag: true } },
      },
    });
    return {
      ...coffee,
      tags: coffee.tags.map(ct => ct.tag),
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.coffee.delete({ where: { id } });
  }

  async searchCoffees(params: {
    start_date?: Date;
    end_date?: Date;
    name?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }) {
    const { start_date, end_date, name, tags, limit = 10, offset = 0 } = params;
    const where: any = {};

    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt.gte = start_date;
      if (end_date) where.createdAt.lte = end_date;
    }
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag: { name: { in: tags } },
        },
      };
    }

    const [coffees, total] = await Promise.all([
      this.prisma.coffee.findMany({
        where,
        include: { tags: { include: { tag: true } } },
        skip: offset,
        take: limit,
      }),
      this.prisma.coffee.count({ where }),
    ]);

    return {
      data: coffees.map(coffee => ({
        ...coffee,
        tags: coffee.tags.map(ct => ct.tag),
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }
}