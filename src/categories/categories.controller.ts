import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import * as slug from 'slug';

import {CreateCategoryDto} from './create-category.dto';
import {CategoriesService} from './categories.service';
import {Category} from './category.interface';

@Controller('categories')
export class CategoriesController {

    constructor(private readonly categoriesService: CategoriesService,) {
    }

    @Get()
    findAll(): Promise<Category[]> {
        return this.categoriesService.findAll();
    }

    @Post()
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        const newCategory = Object.assign({}, createCategoryDto, {
            id: slug(createCategoryDto.name, {lower: true}),
        });
        await this.categoriesService.create(newCategory);
    }

    @Delete(':categoryId')
    delete(@Param('categoryId') categoryId) {
        return this.categoriesService.deleteOne(categoryId);
    }
}
