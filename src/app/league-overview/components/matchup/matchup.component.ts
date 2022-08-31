import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Game } from 'src/app/interfaces/game';
import { LeagueMatchup } from 'src/app/interfaces/league-matchup';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { Player } from 'src/app/interfaces/player';
import { PlayerService } from '../../services/player.service';

enum Injury {
  QUESTIONABLE = 'Questionable',
  DOUBTFUL = 'Doubtful',
  OUT = 'Out',
  IR = 'IR',
  PUP = 'PUP',
};

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

  constructor(private playerService:PlayerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['matchup']) {
      this.setupMatchup(changes['matchup'].currentValue);
    }
  }

  async setupMatchup(matchup:LeagueMatchup | null) {
    console.log('setting up matchup', matchup);
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
          playerOne,
          playerTwo,
        },
      ];
    }

    this.playerMatchups = newPlayerMatchups;
    this.loading = false;
  }

  getPlayerImg(player:Player | undefined | null) {
    if(player) return this.playerService.getPlayerImg(player.player_id);
    return 'assets/football-helmet.png';
  }

  getPlayerPoints(starterPoints:Array<number> | undefined, idx:number):number {
    if(!starterPoints) return 0;
    if(idx > starterPoints.length - 1) return 0;
    return starterPoints[idx];
  }

  getPlayerProjection(starterProjections:Array<Game> | undefined, idx:number):number {
    if(!starterProjections) return 0;
    if(idx > starterProjections.length - 1) return 0;
    return starterProjections[idx].stats.pts_ppr;
  }

  getProjectedPoints(starterProjections:Array<Game> | undefined):number {
    if(!starterProjections) return 0;
    return starterProjections.reduce((a,b) => a + b.stats.pts_ppr, 0);
  }

  getTeamName(roster:LeagueUser) {
    if(roster.metadata.team_name) return roster.metadata.team_name;
    return roster.display_name;
  }

  getTeamImg(roster:LeagueUser) {
    if(roster!.metadata.avatar) return roster!.metadata.avatar;
    else return'assets/football-helmet.png';
  }

  getInjuryStatusText(injury:string | null | undefined) {
    if(injury === Injury.QUESTIONABLE) return 'Q';
    if(injury === Injury.DOUBTFUL) return 'D';
    if(injury === Injury.IR) return 'IR';
    if(injury === Injury.PUP) return 'PUP';
    if(injury === Injury.OUT) return 'O';
    return '';
  }

  getInjuryStatusStyle(injury:string | null | undefined) {
    if(injury === Injury.QUESTIONABLE) return 'text-warning';
    if(injury === Injury.DOUBTFUL ||
       injury === Injury.IR ||
       injury === Injury.PUP ||
       injury === Injury.OUT
      ) return 'text-danger';
    return '';
  }

  getPositionStyle(position:string | undefined) {
    if(position === 'QB') return 'bg-danger text-white';
    if(position === 'RB') return 'bg-warning';
    if(position === 'WR') return 'bg-primary text-white';
    if(position === 'TE') return 'bg-success text-white';
    if(position === 'K') return 'bg-light';
    return '';
  }

}
