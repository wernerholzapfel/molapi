import {Body, Controller, Get, Logger, Post, Req} from '@nestjs/common';
import {Uitnodiging} from './uitnodiging.entity';
import {UitnodigingenService} from './uitnodigingen.service';
import {AcceptUitnodigingDto, CreateUitnodigingDto} from './create-uitnodiging.dto';

@Controller('uitnodigingen')
export class UitnodigingenController {
    private readonly logger = new Logger('UitnodigingenController', true);

    constructor(private readonly uitnodigingService: UitnodigingenService) {
    }

    @Get()
    async find(@Req() req): Promise<Uitnodiging[]> {
        return this.uitnodigingService.find(req.user.user_id);
    }

    @Post('create')
    async create(@Req() req, @Body() createUitnodigingDto: CreateUitnodigingDto) {
        this.logger.log('UitnodigingenController: ' + createUitnodigingDto.uniqueIdentifier);
        const newEntry = Object.assign({}, createUitnodigingDto, {});
        return await this.uitnodigingService.create(newEntry, req.user.user_id);
    }

    @Post('accept')
    async accept(@Req() req, @Body() acceptUitnodigingDto: AcceptUitnodigingDto) {
        const newEntry = Object.assign({}, acceptUitnodigingDto, {});
        return await this.uitnodigingService.accept(newEntry, req.user.user_id);
    }
}