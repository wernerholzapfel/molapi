import {Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Poule} from '../poules/poule.entity';

@Entity()
@Index(['auth0Identifier'], {unique: true})
export class Deelnemer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    display_name: string;

    @Column({select: false})
    auth0Identifier: string;

    @Column({select: false})
    email: string;

    @OneToMany(type => Voorspelling, voorspelling => voorspelling.deelnemer, {
        eager: true,
    })
    @JoinTable()
    voorspellingen: Voorspelling[];

    @ManyToMany(type => Poule, poule => poule.deelnemers)
    poules: Poule[];
}
