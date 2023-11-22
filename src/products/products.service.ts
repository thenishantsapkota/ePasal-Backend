import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductDto } from './dto/product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getAllProducts() {
    return await this.productRepository.find({ relations: ['category'] });
  }

  async getProductById(id: number) {
    return await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['category'],
    });
  }

  async getProductByCategory(categoryId: number) {
    return await this.productRepository.findOne({
      where: {
        category: {
          id: categoryId,
        },
      },
      relations: ['category'],
    });
  }

  async createProduct(productDto: ProductDto) {
    const product = this.productRepository.create(productDto);
    return await this.productRepository.save(product);
  }
}
