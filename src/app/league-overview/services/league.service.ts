import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, Subject, take } from 'rxjs';
import { League } from 'src/app/interfaces/league';
import { LeagueMatchup } from 'src/app/interfaces/league-matchup';
import { LeagueRoster } from 'src/app/interfaces/league-roster';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { NflInfo } from 'src/app/interfaces/nfl-info';
import { Transaction } from 'src/app/interfaces/transaction';

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
    return `https://sleepercdn.com/images/team_logos/nfl/${teamName.toLowerCase()}.png`;
  }

  public getCurrentSeason() {
    return this.nflInfo!.season;
  }

  public getCurrentWeek() {
    return this.nflInfo!.week;
  }

  public getTeamName(leagueUser:LeagueUser | undefined | null) {
    if(!leagueUser) return '';
    if(leagueUser.metadata) {
      if(leagueUser.metadata.team_name) return leagueUser.metadata.team_name;
    }
    if(leagueUser.display_name) return leagueUser.display_name;
    return leagueUser.user_id;
  }

  public getTransactions(leagueId:string, week:number):Observable<Array<Transaction>> {
    return this.http.get<Array<Transaction>>(`https://api.sleeper.app/v1/league/${leagueId}/transactions/${week}`);
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
        this.nflInfo = value;
        this.nflInfoLoaded.next();
      });
  }
}
