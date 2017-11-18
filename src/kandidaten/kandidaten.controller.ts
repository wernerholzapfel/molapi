import {Body, Controller, Get, Post} from '@nestjs/common';
import {Kandidaat} from './kandidaat.entity';
import {CreateKandidaatDTO} from './create-kandidaat.dto';
import {KandidatenService} from './kandidaten.service';

@Controller('kandidaten')
export class KandidatenController {

    constructor(private readonly kandidatenService: KandidatenService) {
    }

    @Get()
    async findAll(): Promise<Kandidaat[]> {
        return this.kandidatenService.findAll();
    }

    @Post()
    async create(@Body() createKandidaatDto: CreateKandidaatDTO) {
        const newEntry = Object.assign({}, createKandidaatDto, {});
        await this.kandidatenService.create(newEntry);
    }
}