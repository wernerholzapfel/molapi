import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn, VersionColumn,
} from 'typeorm';
import {Poule} from '../poules/poule.entity';

// todo remove entity
@Entity()
export class Uitnodiging {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    uniqueIdentifier: string;

    @ManyToOne(type => Poule, poule => Poule)
    @JoinTable()
    poule: Poule;

    @Column({default: false})
    isAccepted: boolean;

    @Column({default: false})
    isDeclined: boolean;

    @CreateDateColumn({select: false})
    createdDate?: Date;

    @UpdateDateColumn({select: false})
    updatedDate?: Date;

    @VersionColumn({select: false, default: 1})
    version?: number;
}
