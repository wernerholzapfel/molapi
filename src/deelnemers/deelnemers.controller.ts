import {Body, Controller, Get, Logger, Post, Req} from '@nestjs/common';

import {CreateDeelnemerDto} from './create-deelnemer.dto';
import {DeelnemersService} from './deelnemers.service';
import 'dotenv/config';
import {Deelnemer} from './deelnemer.entity';

@Controller('deelnemers')
export class DeelnemersController {
    private readonly logger = new Logger('deelnemersController', true);

    constructor(private readonly deelnemersService: DeelnemersService) {
    }

    @Get()
    async findAll(): Promise<Deelnemer[]> {
        return this.deelnemersService.findAll();
    }

    @Post()
    async create(@Req() req, @Body() createDeelnemerDto: CreateDeelnemerDto) {
        const newEntry = Object.assign({}, createDeelnemerDto, {});
        return await this.deelnemersService.create(newEntry, req.user.uid);
    }

    // @Get(':deelnemerId/voorspellingen')
    // async findVoorspelllingenByDeelnemerId(@Param('deelnemerId') deelnemerId): Promise<Deelnemer> {
    //     return await this.deelnemersService.findVoorspellingen(deelnemerId);
    // }

    @Get('loggedIn')
    async findLoggedInDeelnemer(@Req() req) {
        return await this.deelnemersService.findVoorspellingen(req.user.uid);
    }

    @Get('actualvoorspelling')
    async actualvoorspelling(@Req() req) {
        return await this.deelnemersService.actualvoorspelling(req.user.uid);
    }

    @Get('voorspellingen')
    async getVoorspellingen(@Req() req) {
        return await this.deelnemersService.getVoorspellingen(req.user.uid);
    }

    @Get('tests')
    async getTests(@Req() req) {
        return await this.deelnemersService.getTests(req.user.uid);
    }

    getToken = headers => {
        if (headers && headers.authorization) {
            const parted = headers.authorization.split(' ');
            if (parted.length === 2) {
                return parted[1];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}
