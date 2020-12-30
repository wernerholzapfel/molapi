import {Entity} from 'typeorm/decorator/entity/Entity';
import {
    Column,
    CreateDateColumn,
    JoinTable,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';

@Entity()

export class Quizvraag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    vraag: string;

    @Column()
    aflevering: number;

    @OneToMany(type => Quizantwoord, quizantwoord => quizantwoord.vraag)
    @JoinTable()
    antwoorden: Quizantwoord[];

    @CreateDateColumn({select: false})
    createdDate?: Date;

    @UpdateDateColumn({select: false})
    updatedDate?: Date;

    @VersionColumn({select: false, default: 1})
    version?: number;
}
