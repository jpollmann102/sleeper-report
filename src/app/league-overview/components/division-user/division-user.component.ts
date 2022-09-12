import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { AvatarService } from 'src/app/services/avatar.service';

@Component({
  selector: 'app-division-user',
  templateUrl: './division-user.component.html',
  styleUrls: ['./division-user.component.scss']
})
export class DivisionUserComponent implements OnChanges {
  @Input() user:LeagueUser | null = null;
  public teamName = '';
  public teamImg = 'assets/football-helmet.png';

  constructor(private avatarService:AvatarService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['user']) {
      this.getTeamName(changes['user'].currentValue);
      this.getTeamImg(changes['user'].currentValue);
    }
  }

  getTeamName(user:LeagueUser | null) {
    if(user === null) this.teamName = '';
    if(user!.metadata.team_name) this.teamName = user!.metadata.team_name;
    else this.teamName = user!.display_name;
  }

  getTeamImg(user:LeagueUser | null) {
    this.teamImg = this.avatarService.getTeamImg(user);
  }

}
