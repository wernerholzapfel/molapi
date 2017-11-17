import {Connection} from 'typeorm';
import {Quizvraag} from './quizvraag.entity';

export const quizvragenProviders = [{
    provide: 'QuizvragenRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Quizvraag),
    inject: ['DbConnectionToken'],
}];