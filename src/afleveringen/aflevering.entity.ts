import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Aflevering {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    aflevering: number;

    @Column()
    laatsteAflevering: boolean;

    @Column()
    uitgezonden: boolean;

    @Column({ default: false })
    hasTest: boolean;

    @Column({ default: false })
    hasVoorspelling: boolean;

    @Column({ type: 'timestamp with time zone'})
    deadlineDatetime: Date;
}
