import {Column, Index, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';

@Entity()
@Index(['quizresultaat', 'aflevering', 'deelnemer', 'afleveringstand'], {unique: true})
export class Quizpunt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(type => Deelnemer, deelnemer => deelnemer.id)
    deelnemer: Deelnemer;

    @Column()
    aflevering: number;

    @Column({nullable: true})
    quizpunten: number;

    @Column()
    afleveringstand: number;

    @ManyToOne(type => Quizresultaat, quizresultaat => quizresultaat.id, {
        eager: true,
    })
    @JoinTable()
    quizresultaat: Quizresultaat;
}