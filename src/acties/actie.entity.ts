import {Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity()
@Index(['voorspellingaflevering', 'testaflevering'], {unique: true})
export class Actie {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: true})
    voorspellingaflevering: number;

    @Column({nullable: true})
    testaflevering: number;

    @UpdateDateColumn()
    updatedDate?: Date;

    @Column({nullable: true})
    alwaysUpdate: boolean;

    @Column({nullable: true})
    isSeasonFinished: boolean;

}
