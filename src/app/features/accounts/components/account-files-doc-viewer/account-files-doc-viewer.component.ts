import { Component, OnInit, Input } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-account-files-doc-viewer',
  templateUrl: './account-files-doc-viewer.component.html',
  styleUrls: ['./account-files-doc-viewer.component.scss']
})
export class AccountFilesDocViewerComponent implements OnInit {

  @Input()
  url : string;

  src : any;

  constructor(private domSantitizer : DomSanitizer) { }

  ngOnInit() {
    console.log(this.url);
    this.src = this.domSantitizer.bypassSecurityTrustResourceUrl(this.url);
  }

}
