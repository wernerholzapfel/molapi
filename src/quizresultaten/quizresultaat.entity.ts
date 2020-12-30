import {
    Column,
    JoinTable,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import {Entity} from 'typeorm/decorator/entity/Entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Quizvraag} from '../quizvragen/quizvraag.entity';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';

@Entity()
@Index(['deelnemer', 'vraag'], {unique: true})

export class Quizresultaat {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(type => Deelnemer, deelnemer => deelnemer, {
        eager: true,
    })
    @JoinTable()
    deelnemer: Deelnemer;

    @ManyToOne(type => Quizvraag, quizvraag => quizvraag, {
        eager: true,
    })
    @JoinTable()
    vraag: Quizvraag;

    @ManyToOne(type => Quizantwoord, quizantwoord => quizantwoord, {
        eager: true,
    })
    @JoinTable()
    antwoord: Quizantwoord;

    @Column()
    aflevering: number;

    @Column({nullable: true})
    punten: number;

    @CreateDateColumn({select: false})
    createdDate?: Date;

    @UpdateDateColumn({select: false})
    updatedDate?: Date;

    @VersionColumn({select: false, default: 1})
    version?: number;
}
