import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {quizresultatenProviders} from './quizresultaat.providers';
import {QuizresultatenService} from './quizresultaten.service';
import {QuizresultatenController} from './quizresultaten.controller';

@Module({
    modules: [DBModule],
    controllers: [QuizresultatenController],
    components: [
        ...quizresultatenProviders,
        QuizresultatenService,
    ],
})

export class QuizresultatenModule {}