import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeDecimal'
})
export class RemoveDecimalPipe implements PipeTransform {
  transform(value: string, args: any[]): string {
    if (value === null) return 'Not assigned';
    if (value.indexOf('.') == -1) return value;
    return value.substring(0, value.indexOf('.'));
  }
}