import { Component, Input } from '@angular/core';
import { Player } from 'src/app/interfaces/player';

@Component({
  selector: 'app-trade-block-player',
  templateUrl: './trade-block-player.component.html',
  styleUrls: ['./trade-block-player.component.scss']
})
export class TradeBlockPlayerComponent {
  @Input() player:Player | null = null;
  @Input() draftPick:string | null = null;

  constructor() { }

  getPositionStyle(position:string | undefined) {
    if(position === 'QB') return 'bg-danger text-white';
    if(position === 'RB') return 'bg-warning';
    if(position === 'WR') return 'bg-primary text-white';
    if(position === 'TE') return 'bg-success text-white';
    if(position === 'K') return 'bg-light';
    return '';
  }

  getPositionBorderStyle(position:string | undefined) {
    if(position === 'QB') return 'border-danger';
    if(position === 'RB') return 'border-warning';
    if(position === 'WR') return 'border-primary';
    if(position === 'TE') return 'border-success';
    if(position === 'K') return 'border-light';
    return '';
  }

}
