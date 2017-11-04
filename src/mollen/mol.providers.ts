import { Connection } from 'typeorm';

import { Mol } from './mol.entity';

export const molProviders = [{
  provide: 'molRepositoryToken',
  useFactory: (connection: Connection) => connection.getRepository(Mol),
  inject: ['DbConnectionToken'],
}];