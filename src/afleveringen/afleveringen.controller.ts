import {Body, Controller, Get, Logger, Post, Req, Res} from '@nestjs/common';
import {AfleveringenService} from './afleveringen.service';
import {Aflevering} from './aflevering.entity';
import {CreateAfleveringDto} from './create-aflevering.dto';
import {ManagementClient} from 'auth0';
import 'dotenv/config';

const auth0Token = process.env.AUTH0_TOKEN;
const auth0Domain = process.env.AUTH0_DOMAIN;

@Controller('afleveringen')
export class AfleveringenController {
    private readonly logger = new Logger('afleveringenController', true);
    private management = new ManagementClient({
        domain: auth0Domain,
        token: auth0Token,
    });

    constructor(private readonly afleveringenService: AfleveringenService) {
    }

    @Get()
    async findAll(): Promise<Aflevering[]> {
        return this.afleveringenService.findAll();
    }

    @Post()
    async create(@Res() res, @Req() req, @Body() createAfleveringDto: CreateAfleveringDto) {
        this.logger.log('post aflevering');
        const newAflevering = Object.assign({}, createAfleveringDto);
        return await this.afleveringenService.create(newAflevering, res);
    }

}