import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { ProductDto, UpdateProductDto } from './dto/product.dto';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find({ relations: ['category'] });
  }

  async getAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({ relations: ['product'] });
  }

  async getProductById(id: number): Promise<Product> {
    return await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['category'],
    });
  }

  async getProductByCategory(categoryId: number): Promise<Product> {
    return await this.productRepository.findOne({
      where: {
        category: {
          id: categoryId,
        },
      },
      relations: ['category'],
    });
  }

  async createProduct(productDto: ProductDto): Promise<Product> {
    const product = this.productRepository.create(productDto);
    return await this.productRepository.save(product);
  }

  async updateProduct(
    productId: number,
    productDto: UpdateProductDto,
  ): Promise<false | Product> {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return false;
    }

    Object.assign(product, productDto);

    return await this.productRepository.save(product);
  }

  async deleteProduct(productId: number): Promise<false | Product> {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return false;
    }

    return await this.productRepository.remove(product);
  }

  async createCategory(categoryDto: CategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(categoryDto);
    return await this.categoryRepository.save(category);
  }

  async updateCategory(
    categoryId: number,
    categoryDto: UpdateCategoryDto,
  ): Promise<false | Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return false;
    }

    Object.assign(category, categoryDto);
    return await this.categoryRepository.save(category);
  }

  async deleteCategory(categoryId: number): Promise<false | Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return false;
    }

    return await this.categoryRepository.remove(category);
  }
}
