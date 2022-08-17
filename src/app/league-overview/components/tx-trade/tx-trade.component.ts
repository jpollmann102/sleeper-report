import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from 'src/app/interfaces/transaction';

@Component({
  selector: 'app-tx-trade',
  templateUrl: './tx-trade.component.html',
  styleUrls: ['./tx-trade.component.scss']
})
export class TxTradeComponent implements OnInit {
  @Input() tx:Transaction | null = null;
  
  constructor() { }

  ngOnInit(): void {
  }

}
