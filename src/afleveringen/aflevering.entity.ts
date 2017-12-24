import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Kandidaat} from '../kandidaten/kandidaat.entity';

@Entity()
export class Aflevering {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    aflevering: number;

    @Column()
    laatseAflevering: boolean;

    @Column()
    uitgezonden: boolean;

    @Column({ default: false })
    hasTest: boolean;

    @Column({ default: false })
    hasVoorspelling: boolean;

    @Column()
    deadlineDatetime: Date;
}
