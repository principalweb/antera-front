import { Pipe, PipeTransform } from '@angular/core';
import { values, some } from 'lodash';

@Pipe({
  name: 'isCheckedAny'
})
export class IsCheckedAnyPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const varr = values(value);

    return varr.length > 0 && varr.length<args && some(varr, Boolean) ;
  }

}
