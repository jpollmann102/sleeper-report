import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LeagueRoster } from 'src/app/interfaces/league-roster';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { AvatarService } from 'src/app/services/avatar.service';

@Component({
  selector: 'app-league-leaders',
  templateUrl: './league-leaders.component.html',
  styleUrls: ['./league-leaders.component.scss']
})
export class LeagueLeadersComponent implements OnChanges {
  @Input() leagueUsers:Array<LeagueUser> = [];
  public leagueLeadersLo:Array<LeagueUser> = [];
  public leagueLeadersHi:Array<LeagueUser> = [];

  constructor(private avatarService:AvatarService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['leagueUsers']) {
      this.setupLeagueLeaders(changes['leagueUsers'].currentValue);
    }
  }

  setupLeagueLeaders(leagueUsers:Array<LeagueUser>) {
    this.leagueLeadersLo = this.findLowestScores(leagueUsers);
    this.leagueLeadersHi = this.findHighestScores(leagueUsers);
  }

  findLowestScores(leagueUsers:Array<LeagueUser>):Array<LeagueUser> {
    return leagueUsers.sort((a,b) => {
      return a.roster.settings.fpts - b.roster.settings.fpts;
    }).slice(0, 3);
  }

  findHighestScores(leagueUsers:Array<LeagueUser>):Array<LeagueUser> {
    return leagueUsers.sort((a,b) => {
      return b.roster.settings.fpts - a.roster.settings.fpts;
    }).slice(0, 3);
  }

  getTeamName(leagueUser:LeagueUser) {
    if(leagueUser.metadata.team_name) return leagueUser.metadata.team_name;
    return leagueUser.display_name;
  }

  getPlayerImg(leagueUser:LeagueUser) {
    return this.avatarService.getTeamImg(leagueUser);
  }

}
