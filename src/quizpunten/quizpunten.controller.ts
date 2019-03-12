import {Controller, Get, Logger, Req} from '@nestjs/common';
import {QuizpuntenService} from './quizpunten.service';
import {Quizpunt} from './quizpunt.entity';

@Controller('quizpunten')
export class QuizquizpuntenController {
    private readonly logger = new Logger('QuizquizpuntenController', true);

    constructor(private readonly quizpuntenService: QuizpuntenService) {
    }

    @Get()
    async findAll(@Req() req): Promise<Quizpunt[]> {
        return this.quizpuntenService.findAll();
    }

    @Get('loggedInDeelnemer')
    async findAllForDeelnemer(@Req() req): Promise<Quizpunt[]> {
        this.logger.log(req.user.uid);

        return this.quizpuntenService.findAllForDeelnemer(req.user.uid);
    }
}