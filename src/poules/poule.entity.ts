import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn, VersionColumn,
} from 'typeorm';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {PouleInvitation} from '../poule_invitations/poule-invitation.entity';

@Entity()
export class Poule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    poule_name: string;

    @ManyToMany(type => Deelnemer)
    @JoinTable()
    deelnemers: Deelnemer[];

    @ManyToMany(type => Deelnemer)
    @JoinTable()
    admins: Deelnemer[];

    @OneToMany(type => PouleInvitation, pouleInvitation => pouleInvitation.poule)
    @JoinTable()
    pouleInvitations: PouleInvitation[];

    @CreateDateColumn({select: false})
    createdDate?: Date;

    @UpdateDateColumn({select: false})
    updatedDate?: Date;

    @VersionColumn({select: false, default: 1})
    version?: number;
}
