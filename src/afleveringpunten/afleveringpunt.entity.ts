import {Column, Entity, Index, JoinTable, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';

@Entity()
@Index(['aflevering', 'deelnemer', 'afleveringstand', 'voorspelling'], {unique: true})
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

    @Column({nullable: true})
    quizpunten: number;

    @Column()
    afleveringstand: number;

    @ManyToOne(type => Voorspelling, voorspelling => voorspelling.id, {
        eager: true,
    })
    @JoinTable()
    voorspelling: Voorspelling;
}