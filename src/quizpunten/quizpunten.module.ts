import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {quizpuntProviders} from './quizpunt.providers';
import {QuizpuntenService} from './quizpunten.service';
import {QuizquizpuntenController} from './quizpunten.controller';

@Module({
    imports: [DBModule],
    controllers: [QuizquizpuntenController],
    providers: [
        ...quizpuntProviders,
        QuizpuntenService,
    ],
})

export class QuizpuntenModule {
}
