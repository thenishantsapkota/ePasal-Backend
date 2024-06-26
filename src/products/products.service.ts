import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
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

  async getAllCategories() {
    const categories = await this.categoryRepository.find({
      relations: ['products'],
    });

    return categories.map((category) => ({
      ...category,
      products: category.products.map((product) => ({
        ...product,
        url: product.getPath(),
      })),
    }));
  }

  async getProductById(id: number) {
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['category'],
    });

    return { ...product, url: product.getPath() };
  }

  async getProductsByCategory(categoryId: number) {
    const products = await this.productRepository.find({
      where: {
        category: {
          id: categoryId,
        },
      },
      relations: ['category'],
    });

    return products.map((product) => ({ ...product, url: product.getPath() }));
  }

  async searchProducts(query: string = '') {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (query) {
      queryBuilder.where('product.name ILIKE :query', { query: `%${query}%` });
    }

    return await queryBuilder.getMany();
  }

  async createProduct(
    productDto: ProductDto,
    filename: string,
  ): Promise<Product> {
    const { category_id } = productDto;
    const product = this.productRepository.create({
      ...productDto,
      category: { id: category_id },
      image: filename,
    });
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

    try {
      const publicFolder = path.resolve(__dirname, '..', '..', 'public');
      fs.unlinkSync(path.join(publicFolder, product.getPath()));
    } catch (error: any) {
      console.error('Error deleting file');
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
