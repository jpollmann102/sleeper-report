import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { catchError, of, take } from 'rxjs';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { Player } from 'src/app/interfaces/player';
import { LeagueService } from '../../services/league.service';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-player-leaders',
  templateUrl: './player-leaders.component.html',
  styleUrls: ['./player-leaders.component.scss']
})
export class PlayerLeadersComponent implements OnChanges {
  @Input() leagueUsers:Array<LeagueUser> = [];
  public loading = false;
  public playerLeadersLo:Array<any> = [];
  public playerLeadersHi:Array<any> = [];

  constructor(private playerService:PlayerService,
              private leagueService:LeagueService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['leagueUsers']) {
      this.setupPlayerLeaders(changes['leagueUsers'].currentValue);
    }
  }

  async setupPlayerLeaders(leagueUsers:Array<LeagueUser>) {
    this.loading = true;
    let leaguePlayers:Array<Player | null | undefined> = [];
    for(let i = 0; i < leagueUsers.length; i++) {
      const leagueUser = leagueUsers[i];
      const players = await this.playerService.getPlayers(
        leagueUser.roster.players.map(p => Number(p))
      );
      leaguePlayers = [
        ...leaguePlayers,
        ...players.filter(p => p !== null && p !== undefined),
      ];
    }

    this.playerService.getPlayerStats(
      this.leagueService.getCurrentSeason()
    )
      .pipe(
        take(1),
        catchError((error) => {
          console.error(error);
          return of([]);
        })
      )
      .subscribe((value:any) => {
        const matchedPlayers = value.filter((p:any) => leaguePlayers.some(lp => lp?.player_id === p.player_id));
        const playersWithScores = matchedPlayers.filter((p:any) => p.stats.pts_ppr !== undefined);
        const withImgs = playersWithScores.map((p:any) => {
          return {
            ...p,
            imgLink: this.playerService.getPlayerImg(p.player_id),
            teamImgLink: this.leagueService.getTeamLogo(p.team),
          };
        });
        this.playerLeadersLo = this.findLowestScores(withImgs);
        this.playerLeadersHi = this.findHighestScores(withImgs);

        this.loading = false;
      });
  }

  findLowestScores(players:Array<any>):Array<any> {
    return players.sort((a,b) => {
      if(a.stats.pts_ppr && b.stats.pts_ppr) return a.stats.pts_ppr - b.stats.pts_ppr;
      if(a.stats.pts_ppr) return 1;
      if(b.stats.pts_ppr) return -1;
      return 0;
    }).slice(0, 5);
  }

  findHighestScores(players:Array<any>):Array<any> {
    return players.sort((a,b) => {
      if(a.stats.pts_ppr && b.stats.pts_ppr) return b.stats.pts_ppr - a.stats.pts_ppr;
      if(a.stats.pts_ppr) return -1;
      if(b.stats.pts_ppr) return 1;
      return 0;
    }).slice(0, 5);
  }

}
