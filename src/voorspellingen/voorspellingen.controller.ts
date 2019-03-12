import {Body, Controller, Get, Logger, Post, Req} from '@nestjs/common';

import {CreateVoorspellingDto} from './create-voorspelling.dto';
import {VoorspellingenService} from './voorspellingen.service';
import {Voorspelling} from './voorspelling.entity';
import 'dotenv/config';

const auth0Token = process.env.AUTH0_TOKEN;
const auth0Domain = process.env.AUTH0_DOMAIN;

@Controller('voorspellingen')
export class VoorspellingenController {
    private readonly logger = new Logger('voorspellingenController', true);

    constructor(private readonly voorspellingenService: VoorspellingenService) {
    }

    @Get()
    async findAll(): Promise<Voorspelling[]> {
        return this.voorspellingenService.findAll();
    }

    @Get('huidig')
    async getHuidigeVoorspelling(@Req() req): Promise<Voorspelling> {
        // @ts-ignore
        return this.voorspellingenService.getHuidigeVoorspelling(req.user.uid);
    }
    @Post()
    async create(@Req() req, @Body() createVoorspellingDto: CreateVoorspellingDto) {
        const newVoorspelling = Object.assign({}, createVoorspellingDto, {
            created_at: new Date(),
        });
        return await this.voorspellingenService.create(newVoorspelling);
    }
}
