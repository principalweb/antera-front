import { Directive, Input } from "@angular/core";

@Directive({
    selector: 'img[default]',
    host: {
      '(error)':'updateUrl()',
      '[src]':'src'
     }
})

export class DefaultImage {
@Input() src:string;
@Input() default:string;

updateUrl() {
    this.src = this.default;
}
}