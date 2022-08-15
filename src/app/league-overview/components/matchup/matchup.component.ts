import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
  public playerMatchups:Array<PlayerMatchup> = [];

  constructor(public playerService:PlayerService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['matchup']) {
      this.setupMatchup(changes['matchup'].currentValue);
    }
  }

  setupMatchup(matchup:LeagueMatchup | null) {
    if(matchup === null) {
      this.playerMatchups = [];
      return;
    }

    let newPlayerMatchups:Array<PlayerMatchup> = [];

    const teamOnePlayers = this.getPlayersForTeam(matchup.teamOneStarters);
    const teamTwoPlayers = this.getPlayersForTeam(matchup.teamTwoStarters);
    
    const maxLen = Math.max(teamOnePlayers.length, teamTwoPlayers.length);
    for(let i = 0; i < maxLen; i++) {
      const playerOne = teamOnePlayers.length >= i+1 ? teamOnePlayers[i] : null;
      const playerTwo = teamTwoPlayers.length >= i+1 ? teamTwoPlayers[i] : null;
      newPlayerMatchups = [
        ...newPlayerMatchups,
        {
          playerOne,
          playerTwo,
        },
      ];
    }

    this.playerMatchups = newPlayerMatchups;
    console.log(newPlayerMatchups);
  }

  getPlayerImg(player:Player | undefined | null) {
    if(player) return this.playerService.getPlayerImg(player.player_id);
    return 'assets/football-helmet.png';
  }

  getPlayerPoints(starterPoints:Array<number> | undefined, idx:number):number {
    if(!starterPoints) return 0;
    if(idx > starterPoints.length-1) return 0;
    return starterPoints[idx];
  }

  getPlayersForTeam(starters:Array<string>):Array<Player | undefined> {
    return starters.map(s => this.playerService.getPlayer(Number(s)));
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
