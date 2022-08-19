import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { catchError, of, take } from 'rxjs';
import { League } from 'src/app/interfaces/league';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { OtbPlayer } from 'src/app/interfaces/otb-player';
import { LeagueService } from '../../services/league.service';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-league-otb',
  templateUrl: './league-otb.component.html',
  styleUrls: ['./league-otb.component.scss']
})
export class LeagueOtbComponent implements OnChanges {
  @Input() league:League | null = null;
  @Input() leagueUsers:Array<LeagueUser> = [];
  public loading = false;
  public otbPlayers:Array<OtbPlayer> = [];

  constructor(public playerService:PlayerService, 
              private leagueService:LeagueService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['league']) {
      this.getLeagueOtb(
        changes['league'].currentValue,
        this.leagueUsers
      );
    }
    
    if(changes && changes['leagueUsers']) {
      this.getLeagueOtb(
        this.league,
        changes['leagueUsers'].currentValue
      );
    }
  }

  getLeagueOtb(league:League | null, leagueUsers:Array<LeagueUser>) {
    if(league === null || leagueUsers.length === 0) return;

    this.loading = true;

    this.leagueService.getLeagueTradeblock(league.league_id)
      .pipe(
        take(1),
        catchError((error) => {
          console.error(error);
          return of(null);
        })
      )
      .subscribe((value) => {
        if(value) this.setupTradeblock(value.data.league_players, leagueUsers);
        else this.otbPlayers = [];

        this.loading = false;
      });
  }

  setupTradeblock(otbPlayers:Array<OtbPlayer>, leagueUsers:Array<LeagueUser>) {
    const otbItems = otbPlayers.filter(p => p.settings && p.settings.otb);
    this.otbPlayers = otbItems.map((p) => {

      let player = null;
      let leagueUser = null;
      let draftPick = null;
      const playerId = p.player_id.split(',');
      const isDraftPick = playerId.length > 1;
      if(isDraftPick) {
        draftPick = `${playerId[1]} round ${playerId[2]} pick`;
      } else {
        player = this.playerService.getPlayer(Number(playerId));
        leagueUser = leagueUsers.find(lu => lu.roster.roster_id === p.settings.otb);
      }

      return {
        ...p,
        isDraftPick,
        draftPick,
        player: player ? player : null,
        leagueUser: leagueUser ? leagueUser : null,
      };

    });

    console.log(this.otbPlayers);
  };

}
