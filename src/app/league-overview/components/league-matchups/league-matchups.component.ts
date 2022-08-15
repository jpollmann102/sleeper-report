import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { catchError, of, take } from 'rxjs';
import { League } from 'src/app/interfaces/league';
import { LeagueMatchup } from 'src/app/interfaces/league-matchup';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-league-matchups',
  templateUrl: './league-matchups.component.html',
  styleUrls: ['./league-matchups.component.scss']
})
export class LeagueMatchupsComponent implements OnChanges {
  @Input() league:League | null = null;
  @Input() leagueUsers:Array<LeagueUser> = [];
  public matchups:Array<LeagueMatchup> = [];
  public loading = false;
  public error = '';
  public activeWeek = this.leagueService.getCurrentWeek();
  public weeks:Array<number> = [];

  constructor(public leagueService:LeagueService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['league']) {
      this.getMatchups(
        changes['league'].currentValue,
        this.leagueUsers
      );
      this.setupLeagueWeeks(changes['league'].currentValue);
    }

    if(changes && changes['leagueUsers']) {
      this.getMatchups(
        this.league,
        changes['leagueUsers'].currentValue
      );
    }
  }

  setupLeagueWeeks(league:League | null) {
    if(league === null) {
      this.weeks = [1];
      this.activeWeek = 1;
      return;
    }

    this.weeks = [];
    for(let i = 1; i < league.settings.playoff_week_start; i++) {
      this.weeks = [
        ...this.weeks,
        i,
      ];
    }
  }

  getMatchups(league:League | null, leagueUsers:Array<LeagueUser>) {
    if(league === null) {
      this.matchups = [];
      return;
    }

    this.loading = true;
    this.error = '';

    this.leagueService.getLeagueMatchups(
      league.league_id,
      this.activeWeek
    )
      .pipe(
        take(1),
        catchError((error) => {
          console.error(error);
          this.error = error;
          return of([]);
        })
      )
      .subscribe((value) => {
        this.setupMatchups(value, leagueUsers);
        this.loading = false;
      });
  }

  setupMatchups(matchups:Array<LeagueMatchup>, leagueUsers:Array<LeagueUser>) {
    let newMatchups:Array<LeagueMatchup> = [];

    const numMatchups = (matchups.length / 2) + 1;
    for(let i = 1; i < numMatchups; i++) {
      const teams = matchups.filter(m => m.matchup_id === i);

      if(teams.length < 2) continue;

      const teamOne = leagueUsers.find(lu => lu.roster.roster_id === teams[0].roster_id);
      const teamTwo = leagueUsers.find(lu => lu.roster.roster_id === teams[1].roster_id);

      if(!teamOne || !teamTwo) continue;

      newMatchups = [
        ...newMatchups,
        {
          matchup_id: teams[0].matchup_id,
          teamOnePoints: teams[0].points!,
          teamTwoPoints: teams[1].points!,
          teamOneStarters: teams[0].starters!,
          teamTwoStarters: teams[1].starters!,
          teamOneStartersPoints: teams[0].starters_points!,
          teamTwoStartersPoints: teams[1].starters_points!,
          teamOne,
          teamTwo,
        },
      ];
    }

    this.matchups = newMatchups;
    console.log('matchups', newMatchups);
  }
}
