import { Module } from '@nestjs/common';

import { DBModule } from '../db/db.module';
import { MollenController } from './mollen.controller';
import { MollenService } from './mollen.service';
import { molProviders } from './mol.providers';

@Module({
  modules: [DBModule],
  controllers: [MollenController],
  components: [
    ...molProviders,
    MollenService,
  ],
})

export class MollenModule { }
