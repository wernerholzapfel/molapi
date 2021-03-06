import {Body, Controller, Get, Logger, Post, Req} from '@nestjs/common';
import {AfleveringenService} from './afleveringen.service';
import {Aflevering} from './aflevering.entity';
import {CreateAfleveringDto} from './create-aflevering.dto';
import 'dotenv/config';


@Controller('afleveringen')
export class AfleveringenController {
    private readonly logger = new Logger('afleveringenController', true);

    constructor(private readonly afleveringenService: AfleveringenService) {
    }

    @Get()
    async findAll(): Promise<Aflevering[]> {
        return this.afleveringenService.findAll();
    }

    @Get('latest')
    async getLatestAflevering(): Promise<Aflevering> {
        return this.afleveringenService.getLatestAflevering();
    }

    @Get('current')
    async getCurrentAflevering(): Promise<Aflevering> {
        return this.afleveringenService.getCurrentAflevering();
    }

    @Post()
    async create(@Req() req, @Body() createAfleveringDto: CreateAfleveringDto): Promise<any> {
        this.logger.log('post aflevering');
        const newAflevering = Object.assign({}, createAfleveringDto);
        return this.afleveringenService.create(newAflevering);
    }

}
