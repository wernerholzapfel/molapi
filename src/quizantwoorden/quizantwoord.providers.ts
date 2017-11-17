import {Connection} from 'typeorm';
import {Quizantwoord} from './quizantwoord.entity';

export const quizantwoordenProviders = [{
    provide: 'QuizantwoordenRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Quizantwoord),
    inject: ['DbConnectionToken'],
}];