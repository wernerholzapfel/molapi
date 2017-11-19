import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {quizpuntProviders} from '../quizpunten/quizpunt.providers';

@Module({
    modules: [DBModule],
    components: [
        ...quizpuntProviders,
    ],
})

export class QuizpuntenModule {
}
