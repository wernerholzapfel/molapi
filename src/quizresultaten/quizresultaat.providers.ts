import {Connection} from 'typeorm';
import {Quizresultaat} from './quizresultaat.entity';

export const quizresultatenProviders = [{
    provide: 'QuizresultatenRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Quizresultaat),
    inject: ['DbConnectionToken'],
}];