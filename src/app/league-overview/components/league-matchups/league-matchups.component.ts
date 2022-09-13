import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { catchError, forkJoin, Observable, of, take } from 'rxjs';
import { Game } from 'src/app/interfaces/game';
import { League } from 'src/app/interfaces/league';
import { LeagueMatchup } from 'src/app/interfaces/league-matchup';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { LeagueService } from '../../services/league.service';
import { PlayerService } from '../../services/player.service';

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
  public selectedMatchup:LeagueMatchup | null = null;
  private matchupIdx = 0;

  constructor(public leagueService:LeagueService,
              private playerService:PlayerService) {
    this.leagueService.nflInfoLoaded
      .subscribe(() => this.activeWeek = this.leagueService.getCurrentWeek());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes) {
      if(changes['league'] && changes['leagueUsers']) {
        this.getMatchups(
          changes['league'].currentValue,
          changes['leagueUsers'].currentValue
        );
        this.setupLeagueWeeks(
          changes['league'].currentValue
        );
      } else if(changes['league']) {
        this.getMatchups(
          changes['league'].currentValue,
          this.leagueUsers
        );
        this.setupLeagueWeeks(
          changes['league'].currentValue
        );
      } else this.getMatchups(
        this.league,
        changes['leagueUsers'].currentValue
      );
    }
  }

  setupLeagueWeeks(league:League | null) {    
    if(league === null) {
      this.weeks = [1];
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
        this.matchupIdx = 0;
        this.setupMatchups(value, leagueUsers);
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
          teamOnePoints: teams[0].points ? teams[0].points : 0,
          teamTwoPoints: teams[1].points ? teams[1].points : 0,
          teamOneStarters: teams[0].starters ? teams[0].starters : [],
          teamTwoStarters: teams[1].starters ? teams[1].starters : [],
          teamOneStarterProjections: [],
          teamTwoStarterProjections: [],
          teamOneStarterStats: [],
          teamTwoStarterStats: [],
          teamOneStartersPoints: teams[0].starters_points ? teams[0].starters_points : [],
          teamTwoStartersPoints: teams[1].starters_points ? teams[1].starters_points : [],
          teamOne,
          teamTwo,
        },
      ];
    }

    this.getProjectionsAndStats(newMatchups);
  }

  getProjectionsAndStats(matchups:Array<LeagueMatchup>) {
    const obs:Array<Observable<{ data:{ stat:Array<Game>, proj:Array<Game> }} | null>> = [];

    matchups.forEach(m => {
      const { teamOneStarters, teamTwoStarters } = m;
      obs.push(
        this.playerService.getPlayerStatsAndProjections(
          this.activeWeek,
          teamOneStarters
        )
          .pipe(
            catchError((error) => {
              console.error(error);
              return of(null);
            })
          )
      );
      obs.push(
        this.playerService.getPlayerStatsAndProjections(
          this.activeWeek,
          teamTwoStarters
        )
          .pipe(
            catchError((error) => {
              console.error(error);
              return of(null);
            })
          )
      );
    });

    forkJoin(obs)
      .pipe(take(1))
      .subscribe((value) => {
        let matchupIdx = 0;
        let matchup = matchups[0];
        value.forEach((s, idx) => {
          if(s === null) return;
          const { stat, proj } = s.data;

          // if not first item, and divisible by 2
          if(idx > 0 && idx % 2 === 0) {
            // new matchup
            matchupIdx += 1;
            matchup = matchups[matchupIdx];

            // assign first team
            matchup.teamOneStarterProjections = proj;
            matchup.teamOneStarterStats = stat;

          } else {
            // if first overall item, or odd
            if(idx % 2 === 0) {
              matchup.teamOneStarterProjections = proj;
              matchup.teamOneStarterStats = stat;
            } else {
              matchup.teamTwoStarterProjections = proj;
              matchup.teamTwoStarterStats = stat;
            }
          }
        });

        this.matchups = matchups;
        if(matchups.length > 0) this.selectedMatchup = matchups[this.matchupIdx];
        this.loading = false;
      });
  }
}
