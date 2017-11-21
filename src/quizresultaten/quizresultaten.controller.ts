import {Body, Controller, Get, Logger, Post, Req} from '@nestjs/common';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {QuizresultatenService} from './quizresultaten.service';
import {CreateQuizresultaatDto} from './create-quizresultaat.dto';

@Controller('quizresultaten')
export class QuizresultatenController {
    private readonly logger = new Logger('QuizresultatenController', true);

    constructor(private readonly quizresultatenService: QuizresultatenService) {
    }

    @Get()
    async findAll(): Promise<Afleveringpunten[]> {
        return this.quizresultatenService.findAll();
    }

    @Post()
    async create(@Req() req, @Body() createQuizresultaatDto: CreateQuizresultaatDto) {
        const newQuizresultaat = Object.assign({}, createQuizresultaatDto, {});
        await this.quizresultatenService.create(newQuizresultaat);
    }
}
