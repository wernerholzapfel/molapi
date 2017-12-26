import {Column, Entity, Index, JoinTable, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';

@Entity()
@Index(['voorspellingaflevering', 'testaflevering'], {unique: true})
export class Actie {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: true})
    voorspellingaflevering: number;

    @Column({nullable: true})
    testaflevering: number;
}