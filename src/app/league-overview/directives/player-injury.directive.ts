import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Injury } from 'src/app/interfaces/injury.enum';

@Directive({
  selector: '[appPlayerInjury]'
})
export class PlayerInjuryDirective implements OnChanges {
  @Input() appPlayerInjury:string | null | undefined = '';

  constructor(private el:ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes) this.setStyle(changes['appPlayerInjury'].currentValue);
  }

  setStyle(injury:string | null | undefined) {
    this.getInjuryStatusStyle(injury).forEach(style => this.el.nativeElement.classList.add(style));
  }

  getInjuryStatusStyle(injury:string | null | undefined) {
    if(injury === Injury.QUESTIONABLE) return ['text-warning'];
    if(injury === Injury.DOUBTFUL ||
       injury === Injury.IR ||
       injury === Injury.PUP ||
       injury === Injury.OUT
      ) return ['text-danger'];
    return [];
  }

}
