import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import * as slug from 'slug';

import { Deelnemer } from './deelnemer.interface';
import { CreateDeelnemerDto } from './create-deelnemer.dto';
import { DeelnemersService } from './deelnemers.service';

@Controller('deelnemers')
export class DeelnemersController {

  constructor(
    private readonly deelnemersService: DeelnemersService,
  ) { }

  @Get()
  async findAll(): Promise<Deelnemer[]> {
    return this.deelnemersService.findAll();
  }

  @Post()
  async create( @Body() createDeelnemerDto: CreateDeelnemerDto) {
    const newEntry = Object.assign({}, createDeelnemerDto, {
    });
    await this.deelnemersService.create(newEntry);
  }

  @Delete(':deelnemerId')
  delete( @Param('deelnemerId') deelnemerId) {
    return this.deelnemersService.deleteOne(deelnemerId);
  }

  // @Get(':deelnemerId/entries')
  // findEntriesByCategory( @Param('deelnemerId') deelnemerId): Promise<Entry[]> {
  //   return this.entriesService.findEntriesByDeelnemer(deelnemerId);
  // }

}
