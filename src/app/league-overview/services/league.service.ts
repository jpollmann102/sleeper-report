import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, Subject, take } from 'rxjs';
import { League } from 'src/app/interfaces/league';
import { LeagueMatchup } from 'src/app/interfaces/league-matchup';
import { LeagueRoster } from 'src/app/interfaces/league-roster';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { NflInfo } from 'src/app/interfaces/nfl-info';

@Injectable({
  providedIn: 'root'
})
export class LeagueService {
  public nflInfo:NflInfo | null = null;

  public nflInfoLoaded = new Subject<void>();

  constructor(private http:HttpClient) {
    this.getNflInfo();
  }

  public getTeamLogo(teamName:string) {
    return `https://sleepercdn.com/content/nfl/teams/${teamName}.jpg`;
  }

  public getCurrentSeason() {
    return this.nflInfo!.season;
  }

  public getCurrentWeek() {
    return this.nflInfo!.week;
  }

  public getLeagueMatchups(leagueId:string, week:number):Observable<Array<LeagueMatchup>> {
    return this.http.get<Array<LeagueMatchup>>(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`);
  }

  public getUserLeagues(userId:string, season:string):Observable<Array<League>> {
    return this.http.get<Array<League>>(`https://api.sleeper.app/v1/user/${userId}/leagues/nfl/${season}`);
  }

  public getLeagueUsers(leagueId:string):Observable<Array<LeagueUser>> {
    return this.http.get<Array<LeagueUser>>(`https://api.sleeper.app/v1/league/${leagueId}/users`);
  }

  public getLeagueRosters(leagueId:string):Observable<Array<LeagueRoster>> {
    return this.http.get<Array<LeagueRoster>>(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
  }

  private getNflInfo() {
    this.http.get<NflInfo>(`https://api.sleeper.app/v1/state/nfl`)
      .pipe(
        take(1),
        catchError((error) => {
          console.error(error);
          return of(null);
        })
      )
      .subscribe((value) => {
        console.log('nfl info', value);
        this.nflInfo = value;
        this.nflInfoLoaded.next();
      });
  }
}
