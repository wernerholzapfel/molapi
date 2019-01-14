import {Module} from '@nestjs/common';
import {QuizpuntenService} from './quizpunten.service';
import {QuizquizpuntenController} from './quizpunten.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Quizpunt} from './quizpunt.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Quizpunt])],
    controllers: [QuizquizpuntenController],
    providers: [
        QuizpuntenService,
    ],
})

export class QuizpuntenModule {
}
