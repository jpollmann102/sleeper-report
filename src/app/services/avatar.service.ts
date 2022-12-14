import { Injectable } from '@angular/core';
import { LeagueUser } from '../interfaces/league-user';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor() { }

  public getAvatar(id:string | null) {
    if(id) return `https://sleepercdn.com/avatars/${id}`;
    else return 'assets/football-helmet.png';
  }

  public getTeamImg(roster:LeagueUser | null | undefined) {
    if(!roster) return 'assets/football-helmet.png';
    if(roster!.metadata.avatar) return roster.metadata.avatar;
    else return this.getAvatar(roster.avatar);
  }

  public getThumbnail(id:string | null) {
    if(id) return `https://sleepercdn.com/avatars/thumbs/${id}`;
    else return 'assets/football-helmet.png';
  }
}
