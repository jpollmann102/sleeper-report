import { Component, Input, OnInit } from '@angular/core';
import { LeagueDivision } from 'src/app/interfaces/league-division';

@Component({
  selector: 'app-division',
  templateUrl: './division.component.html',
  styleUrls: ['./division.component.scss']
})
export class DivisionComponent implements OnInit {
  @Input() division:LeagueDivision | null = null;

  constructor() { }

  ngOnInit(): void {
  }

}
