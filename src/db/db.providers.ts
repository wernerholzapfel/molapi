import {createConnection} from 'typeorm';

import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Category} from '../categories/category.entity';
import {Mol} from '../mollen/mol.entity';

export const dbProvider =
    {
        provide: 'DbConnectionToken',
        useFactory: async () => await createConnection({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10),
            username: process.env.DB_USER,
            password: process.env.DB_PW,
            entities: [
                Voorspelling,
                Deelnemer,
                Category,
                Mol,
            ],
            synchronize: true, // DEV only, do not use on PROD!
        }),
    };
