import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appPlayerPosition]'
})
export class PlayerPositionDirective implements OnChanges {
  @Input() appPlayerPosition:string | undefined = '';

  constructor(private el:ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes) this.setStyle(changes['appPlayerPosition'].currentValue);
  }

  setStyle(position:string | undefined) {
    this.getPositionStyle(position).forEach(style => this.el.nativeElement.classList.add(style));
  }

  getPositionStyle(position:string | undefined) {
    if(position === 'QB') return ['bg-danger', 'text-white'];
    if(position === 'RB') return ['bg-warning'];
    if(position === 'WR') return ['bg-primary', 'text-white'];
    if(position === 'TE') return ['bg-success', 'text-white'];
    if(position === 'K') return ['bg-light'];
    return [];
  }

}
