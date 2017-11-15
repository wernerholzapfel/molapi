import {Column, Entity, ManyToOne, OneToMany, Index, PrimaryGeneratedColumn, OneToOne, JoinTable} from 'typeorm';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';

@Entity()
@Index(['aflevering', 'deelnemer'], {unique: true})

export class Afleveringpunten {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(type => Deelnemer, deelnemer => deelnemer.id)
    deelnemer: Deelnemer;

    @Column()
    aflevering: number;

    @Column()
    molpunten: number;

    @Column()
    afvallerpunten: number;

    @Column()
    winnaarpunten: number;

    @ManyToOne(type => Voorspelling, voorspelling => voorspelling.id, {
        eager: true,
    })
    @JoinTable()
    voorspelling: Voorspelling;
}