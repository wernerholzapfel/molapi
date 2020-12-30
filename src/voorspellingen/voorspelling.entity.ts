import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinTable,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn, VersionColumn,
} from 'typeorm';
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

    @CreateDateColumn({select: false})
    createdDate?: Date;

    @UpdateDateColumn({select: false})
    updatedDate?: Date;

    @VersionColumn({select: false, default: 1})
    version?: number;

}
