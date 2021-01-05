import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maxChars'
})
export class MaxCharsPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value) {
      return '';
    }

    if (value.length < args) {
      return value;
    }

    return value.slice(0, args) + '...';
  }

}
