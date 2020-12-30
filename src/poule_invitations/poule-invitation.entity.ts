import {
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import {Poule} from '../poules/poule.entity';

@Entity()
export class PouleInvitation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(type => Poule, poule => poule.id, {
        eager: true,
    })
    poule: Poule;

    @CreateDateColumn({select: false})
    createdDate?: Date;

    @UpdateDateColumn({select: false})
    updatedDate?: Date;

    @VersionColumn({select: false, default: 1})
    version?: number;
}
