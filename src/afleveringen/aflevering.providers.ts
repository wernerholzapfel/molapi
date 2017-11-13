import { Connection } from 'typeorm';

import { Aflevering } from './aflevering.entity';

export const afleveringProviders = [{
    provide: 'AfleveringRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Aflevering),
    inject: ['DbConnectionToken'],
}];