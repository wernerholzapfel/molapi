import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {quizresultatenProviders} from './quizresultaat.providers';
import {QuizresultatenService} from './quizresultaten.service';
import {QuizresultatenController} from './quizresultaten.controller';

@Module({
    imports: [DBModule],
    controllers: [QuizresultatenController],
    providers: [
        ...quizresultatenProviders,
        QuizresultatenService,
    ],
})

export class QuizresultatenModule {}