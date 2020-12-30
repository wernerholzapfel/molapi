import {Entity} from 'typeorm/decorator/entity/Entity';
import {
    Column,
    CreateDateColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn, VersionColumn,
} from 'typeorm';
import {Quizvraag} from '../quizvragen/quizvraag.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';

@Entity()

export class Quizantwoord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    antwoord: string;

    @ManyToOne(type => Quizvraag, quizvraag => quizvraag.id, {
        eager: true,
    })
    @JoinTable()
    vraag: Quizvraag;

    @ManyToMany(type => Kandidaat)
    @JoinTable()
    kandidaten: Kandidaat[];

    @Column({nullable: true})
    is_niet_meer_mogelijk_sinds: number;

    @CreateDateColumn({select: false})
    createdDate?: Date;

    @UpdateDateColumn({select: false})
    updatedDate?: Date;

    @VersionColumn({select: false, default: 1})
    version?: number;
}
