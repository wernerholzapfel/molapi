import { Module } from '@nestjs/common';

import { DBModule } from '../db/db.module';
import {KandidatenController} from './kandidaten.controller';
import {KandidatenService} from './kandidaten.service';
import {kandidaatProviders} from './kandidaat.providers';

@Module({
  modules: [DBModule],
  controllers: [KandidatenController],
  components: [
    ...kandidaatProviders,
    KandidatenService,
  ],
})

export class KandidatenModule { }
