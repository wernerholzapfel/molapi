import {Module} from '@nestjs/common';
import {QuizresultatenService} from './quizresultaten.service';
import {QuizresultatenController} from './quizresultaten.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Quizresultaat} from './quizresultaat.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Quizresultaat])],
    controllers: [QuizresultatenController],
    providers: [
        QuizresultatenService,
    ],
})

export class QuizresultatenModule {
}