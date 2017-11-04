import {Module} from '@nestjs/common';

import {VoorspellingenModule} from './voorspellingen/voorspellingen.module';
import {DeelnemersModule} from './deelnemers/deelnemers.module';
import {CategoriesModule} from './categories/categories.module';
import {MollenModule} from './mollen/mollen.module';

@Module({
    modules: [VoorspellingenModule, DeelnemersModule, CategoriesModule, MollenModule],
})

export class ApplicationModule {
}