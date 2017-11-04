import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import * as slug from 'slug';

import { CreateVoorspellingDto } from './create-voorspelling.dto';
import { VoorspellingenService } from './voorspellingen.service';
import {Voorspelling} from './voorspelling.entity';

@Controller('voorspellingen')
export class VoorspellingenController {

  constructor(private readonly voorspellingenService: VoorspellingenService) { }

  @Get()
  async findAll(): Promise<Voorspelling[]> {
    return this.voorspellingenService.findAll();
  }

  @Post()
  async create( @Body() createVoorspellingDto: CreateVoorspellingDto) {
    const newVoorspelling = Object.assign({}, createVoorspellingDto, {
      created_at: new Date(),
    });
    await this.voorspellingenService.create(newVoorspelling);
  }

  @Delete(':voorspellingId')
  delete( @Param('voorspellingId') voorspellingId) {
    return this.voorspellingenService.deleteOne(voorspellingId);
  }
}
