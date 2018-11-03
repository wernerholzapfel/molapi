import {Body, Controller, Get, HttpException, HttpStatus, Logger, Param, Post, Req} from '@nestjs/common';
import {QuizvragenService} from './quizvragen.service';
import {CreateQuizvraagDto} from './create-quizvraag.dto';
import {Quizvraag} from './quizvraag.entity';
import {getRepository} from 'typeorm';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';

@Controller('quizvragen')
export class QuizvragenController {
    private readonly logger = new Logger('QuizvragenController', true);

    constructor(private readonly quizvragenService: QuizvragenService) {
    }

    @Get()
    async find(@Req() req): Promise<any> {
        return this.quizvragenService.find(req.user.user_id);
    }

    @Get('aflevering/:afleveringId')
    async getQuizVoorAflevering(@Param('afleveringId') afleveringId): Promise<Quizvraag[]> {
        return this.quizvragenService.getQuizVoorAflevering(afleveringId);
    }

    @Post()
    async create(@Req() req, @Body() createQuizvraagDto: CreateQuizvraagDto) {
        const newQuizvraag = Object.assign({}, createQuizvraagDto, {});
        const quizvraag = await this.quizvragenService.create(newQuizvraag);
        this.logger.log(quizvraag.id);
        createQuizvraagDto.antwoorden.forEach(async antwoord => {
            await getRepository(Quizantwoord).save({
                antwoord: antwoord.antwoord,
                vraag: {id: quizvraag.id},
                kandidaten: antwoord.kandidaten,
            }).catch((err) => {
                throw new HttpException({
                    message: err.message,
                    statusCode: HttpStatus.BAD_REQUEST,
                }, HttpStatus.BAD_REQUEST);
            });
        });
        return quizvraag;
    }

    @Post('update')
    async update(@Req() req, @Body() createQuizvraagDto: CreateQuizvraagDto) {
        const newQuizvraag = Object.assign({}, createQuizvraagDto, {});
        const quizvraag = await this.quizvragenService.create(newQuizvraag);
        this.logger.log('quizvraag.id: ' + quizvraag.id);
        createQuizvraagDto.antwoorden.forEach(async antwoord => {
            if (antwoord.id) {

                this.quizvragenService.updateAntwoorden(antwoord).then(async () => {
                    this.quizvragenService.deleteKandidaten(antwoord).then(async () => {
                        antwoord.kandidaten.forEach(kandidaat => {
                            this.quizvragenService.updateKandidaten(antwoord, kandidaat);
                        });
                    });
                });
            }
            else {
                await getRepository(Quizantwoord).save({
                    antwoord: antwoord.antwoord,
                    vraag: {id: quizvraag.id},
                    kandidaten: antwoord.kandidaten,
                }).catch((err) => {
                    throw new HttpException({
                        message: err.message,
                        statusCode: HttpStatus.BAD_REQUEST,
                    }, HttpStatus.BAD_REQUEST);
                });
            }
        });
        return quizvraag;
    }
}