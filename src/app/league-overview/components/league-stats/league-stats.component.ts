import { Component, Input } from '@angular/core';
import { League } from 'src/app/interfaces/league';
import { LeagueUser } from 'src/app/interfaces/league-user';

@Component({
  selector: 'app-league-stats',
  templateUrl: './league-stats.component.html',
  styleUrls: ['./league-stats.component.scss']
})
export class LeagueStatsComponent {
  @Input() league:League | null = null;
  @Input() leagueUsers:Array<LeagueUser> = [];

  constructor() { }

}
