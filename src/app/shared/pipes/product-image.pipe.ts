import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productImage'
})
export class ProductImagePipe implements PipeTransform {

  transform(p: any, args?: any): any {
    if (p.MediaContent && p.MediaContent[0]) {
      return p.MediaContent[0].url || '';
    }

    return '';
  }

}
