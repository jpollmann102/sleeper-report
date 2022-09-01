import { Component, Input } from '@angular/core';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { Transaction } from 'src/app/interfaces/transaction';
import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-tx',
  templateUrl: './tx.component.html',
  styleUrls: ['./tx.component.scss']
})
export class TxComponent {
  @Input() tx:Transaction | null = null;

  constructor(public leagueService:LeagueService) { }

  getPicture(leagueUser:LeagueUser | undefined) {
    if(leagueUser?.metadata.avatar) return leagueUser.metadata.avatar;
    else return 'assets/football-helmet.png';
  }

}
