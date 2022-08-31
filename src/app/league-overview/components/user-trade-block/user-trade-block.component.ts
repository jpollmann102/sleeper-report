import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { OtbPlayer } from 'src/app/interfaces/otb-player';

@Component({
  selector: 'app-user-trade-block',
  templateUrl: './user-trade-block.component.html',
  styleUrls: ['./user-trade-block.component.scss']
})
export class UserTradeBlockComponent implements OnChanges {
  @Input() userBlock:Array<OtbPlayer> = [];
  public leagueUser:LeagueUser | null = null;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['userBlock']) {
      this.setupUserBlock(changes['userBlock'].currentValue);
    }
  }

  setupUserBlock(userBlock:Array<OtbPlayer>) {
    if(userBlock.length > 0) this.leagueUser = userBlock[0].leagueUser;
    else this.leagueUser = null;
  }

  getUserName() {
    if(this.leagueUser) {
      if(this.leagueUser.metadata.team_name) return this.leagueUser.metadata.team_name;
      return this.leagueUser.display_name;
    }
    return '';
  }

}
