import { Component, Input, OnInit } from '@angular/core';
import { Transaction } from 'src/app/interfaces/transaction';

@Component({
  selector: 'app-tx-waiver',
  templateUrl: './tx-waiver.component.html',
  styleUrls: ['./tx-waiver.component.scss']
})
export class TxWaiverComponent implements OnInit {
  @Input() tx:Transaction | null = null;
  
  constructor() { }

  ngOnInit(): void {
  }

}
