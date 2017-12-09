import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {quizpuntProviders} from './quizpunt.providers';
import {QuizpuntenService} from './quizpunten.service';
import {QuizquizpuntenController} from './quizpunten.controller';

@Module({
    modules: [DBModule],
    controllers: [QuizquizpuntenController],
    components: [
        ...quizpuntProviders,
        QuizpuntenService,
    ],
})

export class QuizpuntenModule {
}
