import { Injectable } from '@angular/core';
import { Game } from 'src/app/interfaces/game';
import { LeagueMatchup } from 'src/app/interfaces/league-matchup';
import { Player } from 'src/app/interfaces/player';

@Injectable({
  providedIn: 'root'
})
export class MatchupService {

  constructor() { }

  public getPlayerPerformance(team:1 | 2, matchup:LeagueMatchup, player:Player | null | undefined):number | undefined {
    if(!player) return undefined;
    if(team === 1) return this.getTeamOnePlayerPerformance(matchup, player);
    return this.getTeamTwoPlayerPerformance(matchup, player);
  }

  public getPlayerPoints(starterPoints:Array<number> | undefined, idx:number):number {
    if(!starterPoints) return 0;
    if(idx > starterPoints.length - 1) return 0;
    return starterPoints[idx];
  }

  public getPlayerProjection(starterProjections:Array<Game> | undefined, player:Player):Game | undefined {
    return starterProjections?.find(p => p.player_id == player.player_id);
  }

  public getPlayerStats(starterStats:Array<Game>, player:Player) {
    return starterStats.find(p => p.player_id == player.player_id);
  }

  public getProjectedPoints(starterProjections:Array<Game> | undefined):number {
    if(!starterProjections) return 0;
    return starterProjections.reduce((a,b) => a + b.stats.pts_ppr, 0);
  }

  private getTeamOnePlayerPerformance(matchup:LeagueMatchup, player:Player):number | undefined {
    const proj = matchup.teamOneStarterProjections.find(p => p.player_id == player.player_id);
    if(proj) {
      const stats = matchup.teamOneStarterStats.find(p => p.player_id == proj.player_id);
      if(stats) {

        if(proj.stats.pts_ppr === 0) return stats.stats.pts_ppr;
        return (stats.stats.pts_ppr ? stats.stats.pts_ppr : 0) / proj.stats.pts_ppr;

      } else return undefined;

    } else return undefined;
  }

  private getTeamTwoPlayerPerformance(matchup:LeagueMatchup, player:Player):number | undefined {
    const proj = matchup.teamTwoStarterProjections.find(p => p.player_id == player.player_id);
    if(proj) {
      const stats = matchup.teamTwoStarterStats.find(p => p.player_id == proj.player_id);
      if(stats) {
        
        if(proj.stats.pts_ppr === 0) return stats.stats.pts_ppr;
        return (stats.stats.pts_ppr ? stats.stats.pts_ppr : 0) / proj.stats.pts_ppr;

      } else return undefined;

    } else return undefined;
  }
}
