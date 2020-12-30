import {Body, Controller, Get, Post, Req} from '@nestjs/common';
import {PouleInvitationService} from './poule-invitation.service';
import {PouleInvitation} from './poule-invitation.entity';

@Controller('poulesinvitation')
export class PouleInvitationController {
    constructor(private readonly pouleInvitationService: PouleInvitationService) {
    }

    @Get()
    async find(): Promise<PouleInvitation[]> {
        return this.pouleInvitationService.find();
    }

    @Post('accept')
    async create(@Req() req, @Body() body: { id: string }) {
        return await this.pouleInvitationService.create(body.id, req.user.uid);
    }
}
