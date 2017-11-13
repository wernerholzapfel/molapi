import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';
import {Index} from 'typeorm/decorator';

@Entity()
// todo fix index import on heroku
@Index(['aflevering', 'deelnemer'], {unique: true})
export class Voorspelling {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    aflevering: number;

    @ManyToOne(type => Kandidaat, kandidaat => Kandidaat)
    mol: Kandidaat;

    @ManyToOne(type => Kandidaat, kandidaat => Kandidaat)
    afvaller: Kandidaat;

    @ManyToOne(type => Kandidaat, kandidaat => Kandidaat)
    winnaar: Kandidaat;

    @ManyToOne(type => Deelnemer, deelnemer => deelnemer.voorspellingen)
    deelnemer: Deelnemer;

    @Column({select: false})
    created_at: Date;

}