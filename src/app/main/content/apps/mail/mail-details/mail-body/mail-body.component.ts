import { Component, OnInit, Input, ViewEncapsulation, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'mail-body',
  templateUrl: './mail-body.component.html',
  styleUrls: ['./mail-body.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class MailBodyComponent implements OnInit {

  @Input() htmlContent: any;

  constructor() { }

  ngOnInit() {
  }

}

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}