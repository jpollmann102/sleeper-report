import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor() { }

  public getAvatar(id:string | null) {
    if(id) return `https://sleepercdn.com/avatars/${id}`;
    else return 'assets/football-helmet.png';
  }

  public getThumbnail(id:string | null) {
    if(id) return `https://sleepercdn.com/avatars/thumbs/${id}`;
    else return 'assets/football-helmet.png';
  }
}
