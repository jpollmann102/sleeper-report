import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { catchError, forkJoin, Observable, of, take } from 'rxjs';
import { League } from 'src/app/interfaces/league';
import { LeagueMatchup } from 'src/app/interfaces/league-matchup';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-weekly-hi-lo',
  templateUrl: './weekly-hi-lo.component.html',
  styleUrls: ['./weekly-hi-lo.component.scss']
})
export class WeeklyHiLoComponent implements OnChanges {
  @Input() league:League | null = null;
  @Input() leagueUsers:Array<LeagueUser> = [];
  public hiLo:Array<{ week:number, hi:Array<{ leagueUser:LeagueUser | undefined, fpts:number | undefined }>, lo:Array<{ leagueUser:LeagueUser | undefined, fpts:number | undefined }> }> = [];
  public loading = false;

  constructor(private leagueService:LeagueService) {
    this.leagueService.nflInfoLoaded
      .subscribe(
        () => this.setupHiLo(this.league, this.leagueUsers, this.leagueService.getCurrentWeek())
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes) {
      if(changes['league'] && changes['leagueUsers']) {
        this.setupHiLo(changes['league'].currentValue, changes['leagueUsers'].currentValue, this.leagueService.getCurrentWeek())
      } else if(changes['league']) {
        this.setupHiLo(changes['league'].currentValue, this.leagueUsers, this.leagueService.getCurrentWeek())
      } else if(changes['leagueUsers']) {
        this.setupHiLo(this.league, changes['leagueUsers'].currentValue, this.leagueService.getCurrentWeek())
      }
    }
  }

  setupHiLo(league:League | null, leagueUsers:Array<LeagueUser>, currentWeek:number) {
    if(league === null || currentWeek === 1) {
      this.hiLo = [];
      return;
    }

    this.loading = true;

    let obs:Array<Observable<Array<LeagueMatchup>>> = [];
    for(let week = 1; week < currentWeek + 1; week++) {
      obs = [
        ...obs,
        this.leagueService.getLeagueMatchups(
          league.league_id,
          week
        ),
      ];
    }
    forkJoin(obs)
      .pipe(
        take(1),
        catchError((error) => {
          console.error(error);
          return of([]);
        })
      )
      .subscribe((matchups) => {
        console.log('matchups', matchups);
        let hiLo:Array<{ week:number, hi:Array<{ leagueUser:LeagueUser | undefined, fpts:number | undefined }>, lo:Array<{ leagueUser:LeagueUser | undefined, fpts:number | undefined }> }> = [];
        matchups.forEach((week, idx) => {
          const withLeagueUsers = week.map(m => {
            return {
              ...m,
              leagueUser: leagueUsers.find(lu => lu.roster.roster_id === m.roster_id)
            };
          });
          const weeklyHi = Math.max(...withLeagueUsers.map(wlu => wlu.points ? wlu.points : 0));
          const weeklyLo = Math.min(...withLeagueUsers.map(wlu => wlu.points ? wlu.points : 0));
          hiLo = [
            ...hiLo,
            {
              week: idx + 1,
              hi: withLeagueUsers
                .filter(wlu => wlu.points === weeklyHi)
                .map(wlu => { 
                  return { 
                    leagueUser: wlu.leagueUser, 
                    fpts: wlu.points,
                  } 
                }),
              lo: withLeagueUsers
                .filter(wlu => wlu.points === weeklyLo)
                .map(wlu => { 
                  return { 
                    leagueUser: wlu.leagueUser, 
                    fpts: wlu.points,
                  } 
                })
            }
          ];
        });
        this.hiLo = hiLo;
        this.loading = false;
      });
  }

  getTeamName(leagueUser:LeagueUser | undefined) {
    if(!leagueUser) return '';
    if(leagueUser.metadata.team_name) return leagueUser.metadata.team_name;
    return leagueUser.display_name;
  }

}
