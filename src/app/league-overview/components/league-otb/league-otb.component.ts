import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { catchError, forkJoin, lastValueFrom, of, take } from 'rxjs';
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

  constructor(private playerService:PlayerService, 
              private leagueService:LeagueService) { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
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
    console.log('getting league block', league, leagueUsers);
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
      .subscribe(async (value) => {
        console.log('league trade block', value);
        if(value) await this.setupTradeblock(value.data.league_players, leagueUsers);
        else this.otbPlayers = [];

        this.loading = false;
      });
  }

  async setupTradeblock(otbPlayers:Array<OtbPlayer>, leagueUsers:Array<LeagueUser>) {
    const otbItems = otbPlayers.filter(p => p.settings && p.settings.otb);
    const otbPlayerIds = otbItems.map(p => p.player_id).filter(pId => pId.split(',').length === 1);

    const players = await this.playerService.getPlayers(otbPlayerIds.map(k => Number(k)));
    console.log('otb players', players);

    otbItems.forEach((p) => {
      let leagueUser = null;
      let draftPick = null;
      let player = null;
      const playerId = p.player_id.split(',')[0];
      const isDraftPick = p.player_id.split(',').length > 1;

      if(isDraftPick) draftPick = `${playerId[1]} round ${playerId[2]} pick`;
      else {
        const playerMatch = players.find(p => p && p.player_id === playerId);
        player = playerMatch ? playerMatch : null;
      }

      leagueUser = leagueUsers.find(lu => lu.roster.roster_id === p.settings.otb);

      this.otbPlayers = [
        ...this.otbPlayers,
        {
          ...p,
          isDraftPick,
          draftPick,
          player: player ? player : null,
          leagueUser: leagueUser ? leagueUser : null,
        }
      ];
    });

    console.log(this.otbPlayers);
  };

}
