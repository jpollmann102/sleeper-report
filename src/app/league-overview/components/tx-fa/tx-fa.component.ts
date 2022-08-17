import { Component, Input } from '@angular/core';
import { Transaction } from 'src/app/interfaces/transaction';

@Component({
  selector: 'app-tx-fa',
  templateUrl: './tx-fa.component.html',
  styleUrls: ['./tx-fa.component.scss']
})
export class TxFaComponent {
  @Input() tx:Transaction | null = null;

  constructor() { }

}
