import {Column, Entity, Index, JoinTable, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';

@Entity()
@Index(['aflevering', 'deelnemer'], {unique: true})
export class Voorspelling {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    aflevering: number;

    @ManyToOne(type => Kandidaat, kandidaat => Kandidaat, {
        eager: true,
    })
    @JoinTable()
    mol: Kandidaat;

    @ManyToOne(type => Kandidaat, kandidaat => Kandidaat, {
        eager: true,
    })
    @JoinTable()
    afvaller: Kandidaat;

    @ManyToOne(type => Kandidaat, kandidaat => Kandidaat, {
        eager: true,
    })
    @JoinTable()
    winnaar: Kandidaat;

    @ManyToOne(type => Deelnemer, deelnemer => deelnemer.voorspellingen)
    deelnemer: Deelnemer;

    @Column({select: false})
    created_at: Date;

}