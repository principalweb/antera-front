import { Pipe, PipeTransform } from '@angular/core';
import { formatInteger } from 'app/utils/helper';

@Pipe({
  name: 'integer'
})
export class IntegerPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    console.log(formatInteger(value))
    return formatInteger(value);
  }

}
