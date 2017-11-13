import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Kandidaat} from '../kandidaten/kandidaat.entity';

@Entity()
export class Aflevering {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    aflevering: number;

    @OneToOne(type => Kandidaat)
    @JoinColumn()
    afvaller: Kandidaat;

    @OneToOne(type => Kandidaat)
    @JoinColumn()
    winnaar: Kandidaat;

    @OneToOne(type => Kandidaat)
    @JoinColumn()
    finalist: Kandidaat;

    @Column()
    laatseAflevering: boolean;
}
