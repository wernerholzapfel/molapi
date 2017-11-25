import {Body, Controller, Get, Logger, Post, Req} from '@nestjs/common';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {QuizresultatenService} from './quizresultaten.service';
import {CreateQuizresultaatDto} from './create-quizresultaat.dto';
import {Quizresultaat} from './quizresultaat.entity';

@Controller('quizresultaten')
export class QuizresultatenController {
    private readonly logger = new Logger('QuizresultatenController', true);

    constructor(private readonly quizresultatenService: QuizresultatenService) {
    }

    @Get()
    async findAll(@Req() req): Promise<Quizresultaat[]> {
        return this.quizresultatenService.findAll(req.user.user_id);
    }

    @Post()
    async create(@Req() req, @Body() createQuizresultaatDto: CreateQuizresultaatDto) {
        const newQuizresultaat = Object.assign({}, createQuizresultaatDto, {created_at: new Date()});
        return await this.quizresultatenService.create(newQuizresultaat);
    }
}