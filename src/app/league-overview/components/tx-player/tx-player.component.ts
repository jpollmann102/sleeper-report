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

  getPositionStyle(position:string | undefined) {
    if(position === 'QB') return 'bg-danger text-white';
    if(position === 'RB') return 'bg-warning';
    if(position === 'WR') return 'bg-primary text-white';
    if(position === 'TE') return 'bg-success text-white';
    if(position === 'K') return 'bg-light';
    return '';
  }

}
