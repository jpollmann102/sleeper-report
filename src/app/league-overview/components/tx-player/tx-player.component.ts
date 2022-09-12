import { Component, Input } from '@angular/core';
import { Player } from 'src/app/interfaces/player';

@Component({
  selector: 'app-tx-player',
  templateUrl: './tx-player.component.html',
  styleUrls: ['./tx-player.component.scss']
})
export class TxPlayerComponent {
  @Input() player:Player | null = null;
  @Input() type:'add' | 'drop' = 'add';

  constructor() { }

}
