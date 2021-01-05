import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-generic-error',
    styleUrls: ['./generic-error.component.scss'],
    templateUrl: './generic-error.component.html'
})
export class GenericErrorComponent {
  
  @Input()
  error : string;
}
