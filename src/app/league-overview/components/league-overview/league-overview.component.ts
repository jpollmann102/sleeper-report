import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { catchError, forkJoin, of, take } from 'rxjs';
import { League } from 'src/app/interfaces/league';
import { LeagueRoster } from 'src/app/interfaces/league-roster';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-league-overview',
  templateUrl: './league-overview.component.html',
  styleUrls: ['./league-overview.component.scss']
})
export class LeagueOverviewComponent implements OnChanges {
  @Input() selectedLeague:League | null = null;
  public leagueUsers:Array<LeagueUser> = [];
  public loading = true;
  public error = '';

  constructor(private leagueService:LeagueService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['selectedLeague']) {
      this.getLeagueUsers(changes['selectedLeague'].currentValue);
    }
  }

  getLeagueUsers(league:League | null) {
    if(league === null) return;
    
    this.loading = true;
    this.error = '';

    forkJoin({
      leagueUsers: this.leagueService.getLeagueUsers(league.league_id)
        .pipe(
          catchError((error) => {
            console.error(error);
            return of([])
          })
        ),
      leagueRosters: this.leagueService.getLeagueRosters(league.league_id)
        .pipe(
          catchError((error) => {
            console.error(error);
            return of([])
          })
        )
    })
      .pipe(take(1))
      .subscribe((response) => {
        const { leagueRosters, leagueUsers } = response;
        this.createLeague(leagueRosters, leagueUsers);
        this.loading = false;
      });
  }

  createLeague(leagueRosters:Array<LeagueRoster>, leagueUsers:Array<LeagueUser>) {
    let finalLeagueUsers:Array<LeagueUser> = [];

    leagueUsers.forEach(lu => {
      const rosterMatch = leagueRosters.find(lr => lr.owner_id === lu.user_id);
      if(rosterMatch) {
        finalLeagueUsers = [
          ...finalLeagueUsers,
          {
            ...lu,
            roster: rosterMatch
          }
        ];
      }
    });

    this.leagueUsers = finalLeagueUsers;
    console.log(this.leagueUsers);
  }

}
