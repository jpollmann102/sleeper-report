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
  public leagueUserBlocks:Array<Array<OtbPlayer>> = [];


  constructor(private playerService:PlayerService, 
              private leagueService:LeagueService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes) {
      if(changes['league'] && changes['leagueUsers']) {
        this.getLeagueOtb(
          changes['league'].currentValue,
          changes['leagueUsers'].currentValue
        );
      } else if(changes['league']) {
        this.getLeagueOtb(
          changes['league'].currentValue,
          this.leagueUsers
        );
      } else this.getLeagueOtb(
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
      .subscribe(async (value) => {
        if(value) await this.setupTradeblock(value.data.league_players, leagueUsers);
        else this.leagueUserBlocks = [];

        this.loading = false;
      });
  }

  async setupTradeblock(otbPlayers:Array<OtbPlayer>, leagueUsers:Array<LeagueUser>) {
    const otbItems = otbPlayers.filter(p => p.settings && p.settings.otb);
    const otbPlayerIds = otbItems.map(p => p.player_id).filter(pId => pId.split(',').length === 1);

    const players = await this.playerService.getPlayers(otbPlayerIds.map(k => Number(k)));

    let finalOtbPlayers:Array<OtbPlayer> = [];
    otbItems.forEach((p) => {
      let leagueUser = null;
      let draftPick = null;
      let player = null;
      const splitPlayerId = p.player_id.split(',');
      const playerId = splitPlayerId[0];
      const isDraftPick = splitPlayerId.length > 1;

      if(isDraftPick) {
        const year = splitPlayerId[1];
        const round = splitPlayerId[2];
        const pick = splitPlayerId[0];

        draftPick = `${year} round ${round} pick ${pick}`;
      } else {
        const playerMatch = players.find(p => p && p.player_id === playerId);
        player = playerMatch ? playerMatch : null;
      }

      leagueUser = leagueUsers.find(lu => lu.roster.roster_id === p.settings.otb);

      finalOtbPlayers = [
        ...finalOtbPlayers,
        {
          ...p,
          isDraftPick,
          draftPick,
          player: player ? player : null,
          leagueUser: leagueUser ? leagueUser : null,
        }
      ];
    });

    this.createTeamTradeBlocks(finalOtbPlayers);
  };

  createTeamTradeBlocks(otbPlayers:Array<OtbPlayer>) {
    const leagueUserIds = new Set(otbPlayers.map(otbp => otbp.leagueUser?.user_id));
    let userBlocks:Array<Array<OtbPlayer>> = [];
    leagueUserIds.forEach(uid => {
      userBlocks = [
        ...userBlocks,
        otbPlayers.filter(otbp => otbp.leagueUser?.user_id === uid),
      ];
    });

    this.leagueUserBlocks = userBlocks;
  }

}
