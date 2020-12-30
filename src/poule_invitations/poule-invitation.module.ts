import {Module} from '@nestjs/common';
import {PouleInvitationController} from './poule-invitation.controller';
import {PouleInvitationService} from './poule-invitation.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PouleInvitation} from './poule-invitation.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PouleInvitation])],
    controllers: [PouleInvitationController],
    providers: [
        PouleInvitationService,
    ],
})

export class PouleInvitationModule {
}
