import {Connection} from 'typeorm';
import {Uitnodiging} from './uitnodiging.entity';

export const uitnodigingProviders = [{
    provide: 'UitnodigingRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Uitnodiging),
    inject: ['DbConnectionToken'],
}];