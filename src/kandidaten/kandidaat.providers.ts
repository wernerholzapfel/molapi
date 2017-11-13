import {Connection} from 'typeorm';
import {Kandidaat} from './kandidaat.entity';

export const kandidaatProviders = [{
    provide: 'kandidaatRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Kandidaat),
    inject: ['DbConnectionToken'],
}];