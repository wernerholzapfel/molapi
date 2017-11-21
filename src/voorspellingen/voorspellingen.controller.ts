import {Body, Controller, Get, Logger, Post, Req} from '@nestjs/common';

import {CreateVoorspellingDto} from './create-voorspelling.dto';
import {VoorspellingenService} from './voorspellingen.service';
import {Voorspelling} from './voorspelling.entity';
import {ManagementClient} from 'auth0';
import 'dotenv/config';

const auth0Token = process.env.AUTH0_TOKEN;
const auth0Domain = process.env.AUTH0_DOMAIN;

@Controller('voorspellingen')
export class VoorspellingenController {
    private readonly logger = new Logger('voorspellingenController', true);
    private management = new ManagementClient({
        domain: auth0Domain,
        token: auth0Token,
    });

    constructor(private readonly voorspellingenService: VoorspellingenService) {
    }

    @Get()
    async findAll(): Promise<Voorspelling[]> {
        return this.voorspellingenService.findAll();
    }

    @Post()
    async create(@Req() req, @Body() createVoorspellingDto: CreateVoorspellingDto) {
        const newVoorspelling = Object.assign({}, createVoorspellingDto, {
            created_at: new Date(),
        });
        return this.voorspellingenService.create(newVoorspelling);
    }
}

