import { Connection } from 'typeorm';

import { Deelnemer } from './deelnemer.entity';

export const deelnemerProviders = [{
  provide: 'DeelnemerRepositoryToken',
  useFactory: (connection: Connection) => connection.getRepository(Deelnemer),
  inject: ['DbConnectionToken'],
}];