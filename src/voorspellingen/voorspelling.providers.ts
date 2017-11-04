import { Connection } from 'typeorm';

import { Voorspelling } from './voorspelling.entity';

export const voorspellingProviders = [{
    provide: 'VoorspellingRepositoryToken',
    useFactory: (connection: Connection) => connection.getRepository(Voorspelling),
    inject: ['DbConnectionToken'],
}];