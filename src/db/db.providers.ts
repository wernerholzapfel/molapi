import {createConnection} from 'typeorm';

import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Category} from '../categories/category.entity';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {Aflevering} from '../afleveringen/aflevering.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';

export const dbProvider =
    {
        provide: 'DbConnectionToken',
        useFactory: async () => await createConnection({
            type: 'postgres',
            url: process.env.DB_URL,
            ssl: process.env.DATABASE_URL,
            entities: [
                Voorspelling,
                Deelnemer,
                Category,
                Kandidaat,
                Afleveringpunten,
                Aflevering,
            ],
            logging: true,
            synchronize: true, // DEV only, do not use on PROD!
        }),
    };
