import { Component, Input, OnChanges } from '@angular/core';
import { Transaction } from 'src/app/interfaces/transaction';
import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-tx',
  templateUrl: './tx.component.html',
  styleUrls: ['./tx.component.scss']
})
export class TxComponent {
  @Input() tx:Transaction | null = null;
  @Input() loading = false;

  constructor(public leagueService:LeagueService) { }

}
