import {Connection} from 'typeorm';
import {Quizpunt} from './quizpunt.entity';

export const quizpuntProviders = [{
    provide: 'QuizpuntRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Quizpunt),
    inject: ['DbConnectionToken'],
}];
