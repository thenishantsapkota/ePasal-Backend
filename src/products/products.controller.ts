import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { AuthGuard, VerifiedGuard } from '../users/guard';
import { AdminGuard } from '../users/guard/admin.guard';
import { successResponse } from '../util';
import {
  CategoryDto,
  ProductDto,
  QueryDto,
  UpdateCategoryDto,
  UpdateProductDto,
} from './dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @HttpCode(HttpStatus.OK)
  @Get('')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  @ApiOperation({
    summary: 'Search for all the products with or without query',
  })
  async getAllProducts(@Query() params: QueryDto) {
    const data = await this.productsService.searchProducts(params.name);
    if (data.length === 0) {
      throw new NotFoundException('No products found!');
    }

    const products = data.map((product) => ({
      ...product,
      url: product.getPath(),
    }));

    return successResponse(products, 'Products fetched successfully!');
  }

  @HttpCode(HttpStatus.OK)
  @Get('/categories')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  @ApiOperation({ summary: 'Get all product categories' })
  async getAllCategories() {
    const categories = await this.productsService.getAllCategories();
    if (categories.length === 0) {
      throw new NotFoundException('No categories found!');
    }

    return successResponse(categories, 'Categories fetched successfully!');
  }

  @HttpCode(HttpStatus.OK)
  @Get('/product/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  @ApiOperation({ summary: "Get a single product by it's ID" })
  async getOneProduct(@Param('id') id: number) {
    const product = await this.productsService.getProductById(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found!`);
    }

    return successResponse(product, 'Product fetched successfully!');
  }

  @HttpCode(HttpStatus.OK)
  @Get('/products/:categoryId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard)
  @ApiOperation({ summary: 'Get all products of a category' })
  async getProductsByCategory(@Param('categoryId') categoryId: number) {
    const products =
      await this.productsService.getProductsByCategory(categoryId);

    if (products.length === 0) {
      throw new NotFoundException('Products of specified category not found!');
    }

    return successResponse(products, 'Products fetched successfully!');
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/category')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard, AdminGuard)
  @ApiOperation({ summary: 'Create a category(Admin Only)' })
  async createCategory(@Body() categoryDto: CategoryDto) {
    const category = await this.productsService.createCategory(categoryDto);

    return successResponse(category, 'Category created successfully!');
  }

  @HttpCode(HttpStatus.OK)
  @Put('category/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard, AdminGuard)
  @ApiOperation({ summary: 'Update a category(Admin Only)' })
  async updateCategory(
    @Param('id') id: number,
    @Body() categoryDto: UpdateCategoryDto,
  ) {
    const category = await this.productsService.updateCategory(id, categoryDto);

    return successResponse(category, 'Category updated successfully!');
  }

  @HttpCode(HttpStatus.OK)
  @Delete('category/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete a category(Admin Only)' })
  async deleteCategory(@Param('id') id: number) {
    const category = await this.productsService.deleteCategory(id);

    return successResponse(category, 'Category deleted successfully!');
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/product')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard, AdminGuard)
  @ApiOperation({ summary: 'Create a product(Admin Only)' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: path.join(__dirname, '..', '..', 'public', 'products'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = path.extname(file.originalname);
          cb(null, uniqueSuffix + extension);
        },
      }),
    }),
  )
  async createProduct(
    @Body() productDto: ProductDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const product = await this.productsService.createProduct(
      productDto,
      image.filename,
    );

    return successResponse(product, 'Product created successfully!');
  }

  @HttpCode(HttpStatus.OK)
  @Put('/product/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard, AdminGuard)
  @ApiOperation({ summary: 'Update a product' })
  async updateProduct(
    @Param('id') id: number,
    @Body() productDto: UpdateProductDto,
  ) {
    const product = await this.productsService.updateProduct(id, productDto);

    return successResponse(product, 'Product updated successfully!');
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/product/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, VerifiedGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete a product' })
  async deleteProduct(@Param('id') id: number) {
    const product = await this.productsService.deleteProduct(id);

    return successResponse(product, 'Product deleted successfully!');
  }
}
