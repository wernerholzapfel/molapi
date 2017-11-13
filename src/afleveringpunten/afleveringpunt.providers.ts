import {Connection} from 'typeorm';
import {Afleveringpunten} from './afleveringpunt.entity';

export const categoryProviders = [{
    provide: 'AfleveringpuntRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Afleveringpunten),
    inject: ['DbConnectionToken'],
}];