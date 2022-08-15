import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AvatarService } from 'src/app/services/avatar.service';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent implements OnInit {

  constructor(public authService:AuthService,
              private avatarService:AvatarService) { }

  ngOnInit(): void {
  }

  getUserAvatar() {
    return this.avatarService.getAvatar(this.authService.authUser ? this.authService.authUser.avatar : null);
  }

}
