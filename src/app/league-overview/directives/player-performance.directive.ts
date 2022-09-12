import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appPlayerPerformance]'
})
export class PlayerPerformanceDirective implements OnChanges {
  @Input() appPlayerPerformance:number | undefined = 0;

  constructor(private el:ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes) this.setStyle(changes['appPlayerPerformance'].currentValue);
  }

  setStyle(performance:number | undefined) {
    this.getColor(performance).forEach(style => this.el.nativeElement.classList.add(style));
  }

  getColor(performance:number | undefined) {
    if(performance === undefined) return [];
    if(performance > 2) return ['text-dark-green'];
    if(performance > 1) return ['text-success'];
    if(performance > 0) return ['text-danger'];
    return ['text-dark-red'];
  }

}
