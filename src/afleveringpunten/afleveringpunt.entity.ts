import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Deelnemer} from '../deelnemers/deelnemer.entity';

@Entity()
export class Afleveringpunten {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToMany(type => Deelnemer, deelnemer => deelnemer.id)
    deelnemer: Deelnemer;

    @Column()
    aflevering: number;

    @Column()
    molpunten: number;

    @Column()
    afvallerpunten: number;

    @Column()
    winnaarpunten: number;
}