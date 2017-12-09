import {Body, Controller, Get, Logger, Post, Req} from '@nestjs/common';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
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
        this.logger.log(req.user.user_id);

        return this.quizpuntenService.findAllForDeelnemer(req.user.user_id);
    }
}