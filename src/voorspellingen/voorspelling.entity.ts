import {Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Mol} from '../mollen/mol.entity';
import {Index} from 'typeorm/decorator';

@Entity()
@Index(['aflevering', 'deelnemer'], { unique: true })
export class Voorspelling {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    aflevering: number;

    @ManyToOne(type => Mol, mol => mol)
    mol: Mol;

    @ManyToOne(type => Deelnemer, deelnemer => deelnemer.voorspellingen)
    deelnemer: Deelnemer;

    @Column()
    created_at: Date;

}