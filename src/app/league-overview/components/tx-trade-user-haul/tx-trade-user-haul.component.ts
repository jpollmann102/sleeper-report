import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DraftPick } from 'src/app/interfaces/draft-pick';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { Player } from 'src/app/interfaces/player';
import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-tx-trade-user-haul',
  templateUrl: './tx-trade-user-haul.component.html',
  styleUrls: ['./tx-trade-user-haul.component.scss']
})
export class TxTradeUserHaulComponent implements OnChanges {
  @Input() leagueUser:LeagueUser | null | undefined = null;
  @Input() players:{ [key:number]:Player | null } | null = null;
  @Input() adds:{ [key:number]:number } | null = null;
  @Input() draftPicks:Array<DraftPick> = [];
  public userPlayerHaul:Array<Player | null> = [];
  public userDraftPickHaul:Array<DraftPick> = [];

  constructor(public leagueService:LeagueService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes) {
      if(changes['leagueUser']) this.setupHaul(
        changes['leagueUser'].currentValue,
        this.adds,
        this.draftPicks,
        this.players
      );

      if(changes['adds']) this.setupHaul(
        this.leagueUser,
        changes['adds'].currentValue,
        this.draftPicks,
        this.players
      );

      if(changes['draftPicks']) this.setupHaul(
        this.leagueUser,
        this.adds,
        changes['draftPicks'].currentValue,
        this.players
      );

      if(changes['players']) this.setupHaul(
        this.leagueUser,
        this.adds,
        this.draftPicks,
        changes['players'].currentValue
      );
    }
  }

  setupHaul(
    leagueUser:LeagueUser | null | undefined, 
    adds:{ [key:number]:number } | null, 
    draftPicks:Array<DraftPick>,
    players:{ [key:number]:Player | null } | null
  ) {
    if(!leagueUser || !adds || !players) return;
    this.setupPlayerHaul(leagueUser, adds, players);
    this.setupDraftPickHaul(leagueUser, draftPicks);
  }

  setupDraftPickHaul(leagueUser:LeagueUser, draftPicks:Array<DraftPick>) {
    this.userDraftPickHaul = draftPicks.filter(dp => dp.owner_id === leagueUser.roster.roster_id);
  }

  setupPlayerHaul(
    leagueUser:LeagueUser, 
    adds:{ [key:number]:number },
    players:{ [key:number]:Player | null }
  ) {
    const thisUserAdds = Object.keys(adds).filter(
      (pid:string) => adds[Number(pid)] === leagueUser?.roster.roster_id
    );
    this.userPlayerHaul = thisUserAdds.map(pid => players[Number(pid)]);
  }

  getPositionStyle(position:string | undefined) {
    if(position === 'QB') return 'bg-danger text-white';
    if(position === 'RB') return 'bg-warning';
    if(position === 'WR') return 'bg-primary text-white';
    if(position === 'TE') return 'bg-success text-white';
    if(position === 'K') return 'bg-light';
    return '';
  }

  getPicture(leagueUser:LeagueUser | null | undefined) {
    if(leagueUser?.metadata.avatar) return leagueUser.metadata.avatar;
    else return 'assets/football-helmet.png';
  }

  getDraftPickText(draftPick:DraftPick) {
    return `${draftPick.season} round ${draftPick.round}`;
  }

}
