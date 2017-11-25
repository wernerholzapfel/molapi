import {Body, Controller, Get, Logger, Param, Post, Req, Res} from '@nestjs/common';

import {Deelnemer} from './deelnemer.interface';
import {CreateDeelnemerDto} from './create-deelnemer.dto';
import {DeelnemersService} from './deelnemers.service';
import {ManagementClient} from 'auth0';
import * as jwt_decode from 'jwt-decode';
import 'dotenv/config';

const auth0Token = process.env.AUTH0_TOKEN;
const auth0Domain = process.env.AUTH0_DOMAIN;

@Controller('deelnemers')
export class DeelnemersController {
    private readonly logger = new Logger('deelnemersController', true);
    private management = new ManagementClient({
        domain: auth0Domain,
        token: auth0Token,
    });

    constructor(private readonly deelnemersService: DeelnemersService) {
    }

    @Get()
    async findAll(): Promise<Deelnemer[]> {
        return this.deelnemersService.findAll();
    }

    @Post()
    async create(@Body() createDeelnemerDto: CreateDeelnemerDto) {
        const newEntry = Object.assign({}, createDeelnemerDto, {});
        return await this.deelnemersService.create(newEntry);
    }

    @Get(':deelnemerId/voorspellingen')
    async findVoorspelllingenByDeelnemerId(@Param('deelnemerId') deelnemerId): Promise<Deelnemer> {
        return await this.deelnemersService.findVoorspellingen(deelnemerId);
    }

    @Get('loggedIn')
    async findLoggedInDeelnemer(@Req() req) {
            return await this.deelnemersService.findLoggedInDeelnemer(req.user.user_id);
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
