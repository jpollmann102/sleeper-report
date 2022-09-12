import { Component, Input } from '@angular/core';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { Transaction } from 'src/app/interfaces/transaction';
import { AvatarService } from 'src/app/services/avatar.service';
import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-tx',
  templateUrl: './tx.component.html',
  styleUrls: ['./tx.component.scss']
})
export class TxComponent {
  @Input() tx:Transaction | null = null;

  constructor(public leagueService:LeagueService,
              private avatarService:AvatarService) { }

  getPicture(leagueUser:LeagueUser | undefined) {
    return this.avatarService.getTeamImg(leagueUser);
  }

}
