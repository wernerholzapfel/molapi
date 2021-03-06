import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
import {Uitnodiging} from './uitnodiging.entity';
import {UitnodigingenService} from './uitnodigingen.service';
import {AcceptUitnodigingDto, CreateUitnodigingDto, DeclineUitnodigingDto} from './create-uitnodiging.dto';

@Controller('uitnodigingen')
export class UitnodigingenController {
    private readonly logger = new Logger('UitnodigingenController', true);

    constructor(private readonly uitnodigingService: UitnodigingenService) {
    }

    @Get()
    async find(@Req() req): Promise<Uitnodiging[]> {
        return this.uitnodigingService.find(req.user.uid);
    }

    @Get('poule/:pouleId')
    async findByPouleId(@Req() req, @Param('pouleId') pouleId): Promise<Uitnodiging[]> {
        return this.uitnodigingService.findByPouleId(req.user.uid, pouleId);
    }

    @Post('create')
    async create(@Req() req, @Body() createUitnodigingDto: CreateUitnodigingDto) {
        this.logger.log('UitnodigingenController: ' + createUitnodigingDto.uniqueIdentifier);
        const newEntry = Object.assign({}, createUitnodigingDto, {});
        return await this.uitnodigingService.create(newEntry, req.user.uid);
    }

    @Post('accept')
    async accept(@Req() req, @Body() acceptUitnodigingDto: AcceptUitnodigingDto) {
        const newEntry = Object.assign({}, acceptUitnodigingDto, {});
        return await this.uitnodigingService.accept(newEntry, req.user.uid);
    }
    @Post('decline')
    async decline(@Req() req, @Body() declineUitnodigingDto: DeclineUitnodigingDto) {
        const newEntry = Object.assign({}, declineUitnodigingDto, {});
        return await this.uitnodigingService.decline(newEntry, req.user.uid);
    }
}