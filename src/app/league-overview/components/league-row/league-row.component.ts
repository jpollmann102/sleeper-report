import { Component, Input, OnInit } from '@angular/core';
import { League } from 'src/app/interfaces/league';
import { AvatarService } from 'src/app/services/avatar.service';

@Component({
  selector: 'app-league-row',
  templateUrl: './league-row.component.html',
  styleUrls: ['./league-row.component.scss']
})
export class LeagueRowComponent implements OnInit {
  @Input() league:League | null = null;
  
  constructor(private avatarService:AvatarService) { }

  ngOnInit(): void {
  }

  getLeagueImg() {
    return this.avatarService.getAvatar(this.league ? this.league.avatar : null);
  }

}
