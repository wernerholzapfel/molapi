import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {quizantwoordenProviders} from './quizantwoord.providers';

@Module({
    modules: [DBModule],
    controllers: [],
    components: [
        ...quizantwoordenProviders,
    ],
})

export class QuizvragenModule {}