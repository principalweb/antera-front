import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mathFloorFix'
})
export class MathFloorFixPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value) {
      return Math.floor(value)
    }
    return value;
  }
  
}
