import { Component, Input } from '@angular/core';
import { Transaction } from 'src/app/interfaces/transaction';

@Component({
  selector: 'app-tx-trade',
  templateUrl: './tx-trade.component.html',
  styleUrls: ['./tx-trade.component.scss']
})
export class TxTradeComponent {
  @Input() tx:Transaction | null = null;
  
  constructor() { }

}
