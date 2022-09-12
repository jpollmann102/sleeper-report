import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Game } from 'src/app/interfaces/game';
import { LeagueMatchup } from 'src/app/interfaces/league-matchup';
import { Player } from 'src/app/interfaces/player';
import { AvatarService } from 'src/app/services/avatar.service';
import { LeagueService } from '../../services/league.service';
import { MatchupService } from '../../services/matchup.service';
import { PlayerService } from '../../services/player.service';

type PlayerMatchup = {
  playerOne:Player | undefined | null, 
  playerTwo:Player | undefined | null,
};

@Component({
  selector: 'app-matchup',
  templateUrl: './matchup.component.html',
  styleUrls: ['./matchup.component.scss']
})
export class MatchupComponent implements OnChanges {
  @Input() matchup:LeagueMatchup | null = null;
  @Input() loading = false;
  public playerMatchups:Array<PlayerMatchup> = [];

  constructor(private playerService:PlayerService,
              public leagueService:LeagueService,
              public avatarService:AvatarService,
              public matchupService:MatchupService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['matchup']) {
      this.setupMatchup(changes['matchup'].currentValue);
    }
  }

  getProjectionClass(val1:Game | null | undefined, val2:Game | null | undefined) {
    if(!val1 || !val2) return '';
    if(this.isGreater(val1.stats.pts_ppr, val2.stats.pts_ppr)) return 'text-primary';
    return 'text-muted';
  }

  getTeamProjectedPointsStyle(teamOne:Array<Game> | undefined, teamTwo:Array<Game> | undefined) {
    if(!teamOne && !teamTwo) return '';
    if(!teamOne && teamTwo) return '';
    if(teamOne && !teamTwo) return 'text-primary';
    const teamOneProjection = teamOne!.map(p => p.stats.pts_ppr).reduce((a,b) => a+b, 0);
    const teamTwoProjection = teamTwo!.map(p => p.stats.pts_ppr).reduce((a,b) => a+b, 0);
    if(teamOneProjection > teamTwoProjection) return 'text-primary';
    return '';
  }

  isGreater(val1:number | undefined, val2:number | undefined) {
    return (val1 ? val1 : 0) > (val2 ? val2 : 0);
  }

  async setupMatchup(matchup:LeagueMatchup | null) {
    if(matchup === null) {
      this.playerMatchups = [];
      return;
    }
    
    this.loading = true;
    const teamOneStarters = await this.playerService.getPlayers(
      matchup.teamOneStarters.map(sId => Number(sId))
    );
    const teamTwoStarters = await this.playerService.getPlayers(
      matchup.teamTwoStarters.map(sId => Number(sId))
    );

    let newPlayerMatchups:Array<PlayerMatchup> = [];
    const maxLen = Math.max(teamOneStarters.length, teamTwoStarters.length);
    for(let i = 0; i < maxLen; i++) {
      const playerOne = teamOneStarters.length >= i+1 ? teamOneStarters[i] : null;
      const playerTwo = teamTwoStarters.length >= i+1 ? teamTwoStarters[i] : null;
      newPlayerMatchups = [
        ...newPlayerMatchups,
        {
          playerOne: playerOne ? {
            ...playerOne,
            teamImgLink: this.playerService.getPlayerTeamImg(playerOne),
            injuryStatusText: this.playerService.getInjuryStatusText(playerOne.injury_status),
            playerProjection: this.matchupService.getPlayerProjection(matchup.teamOneStarterProjections, playerOne),
            playerPerformance: this.matchupService.getPlayerPerformance(1, matchup, playerOne),
            playerPoints: this.matchupService.getPlayerPoints(matchup.teamOneStartersPoints, i),
            playerStats: this.matchupService.getPlayerStats(matchup.teamOneStarterStats, playerOne),
          } : null,
          playerTwo: playerTwo ? {
            ...playerTwo,
            teamImgLink: this.playerService.getPlayerTeamImg(playerTwo),
            injuryStatusText: this.playerService.getInjuryStatusText(playerTwo.injury_status),
            playerProjection: this.matchupService.getPlayerProjection(matchup.teamTwoStarterProjections, playerTwo),
            playerPerformance: this.matchupService.getPlayerPerformance(2, matchup, playerTwo),
            playerPoints: this.matchupService.getPlayerPoints(matchup.teamTwoStartersPoints, i),
            playerStats: this.matchupService.getPlayerStats(matchup.teamTwoStarterStats, playerTwo),
          } : null,
        },
      ];
    }

    this.playerMatchups = newPlayerMatchups;
    this.loading = false;
  }

}
