import {Connection} from 'typeorm';
import {Actie} from './actie.entity';

export const actieProviders = [{
    provide: 'ActieRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Actie),
    inject: ['DbConnectionToken'],
}];