import {Connection} from 'typeorm';
import {Poule} from './poule.entity';

export const pouleProviders = [{
    provide: 'PouleRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Poule),
    inject: ['DbConnectionToken'],
}];