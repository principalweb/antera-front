import { Component, OnInit, Input, SimpleChanges, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import pdfMake from 'pdfmake/build/pdfmake';
import { tableLayouts } from '../templates';

/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
function deepCopy(obj) {
  let copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) { return obj; }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = deepCopy(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (const attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = deepCopy(obj[attr]);
      }
    }
    return copy;
  }

  throw new Error('Unable to copy obj! Its type isn\'t supported.');
}
@Component({
  selector: 'document-pdf',
  templateUrl: './document-pdf.component.html',
  styleUrls: ['./document-pdf.component.css']
})
export class DocumentPdfComponent implements OnInit, OnChanges, OnDestroy {

  @Input() definition: any;
  @Input() filename: string;
  @Output() autoUploadToCloud = new EventEmitter();
  public pdfSrc: any;
  public ready: boolean;
  pdf: any;
  objectUrl: string;
  blob: any;

  constructor(private domSanitizer: DomSanitizer) { 
    if(!this.filename){
       this.filename = 'document.pdf';
    }
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.definition) {
      this.revokeObjectUrl();
      this.generatePdf();
    }
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  generatePdf() {
    this.ready = false;
    if (this.definition) {
      const def = deepCopy(this.definition);
      console.log('generatePdf');
      pdfMake.createPdf(def, tableLayouts).getBlob((blob) => {
        this.blob = blob;
        this.objectUrl = URL.createObjectURL(blob);
        this.pdfSrc = this.domSanitizer.bypassSecurityTrustResourceUrl(this.objectUrl + '#pagemode=thumbs&toolbar=0&navpanes=0&scrollbar=0,');
        this.ready = true;
        this.autoUploadToCloud.emit();
      });

/*
      pdfMake.createPdf(def, tableLayouts).getBase64((base64) => {
        console.log(base64);
        this.pdfSrc = this.domSanitizer.bypassSecurityTrustResourceUrl('data:application/pdf;headers=filename%3D'+this.filename+';base64,'+base64);
        this.ready = true;
      });
      */      
    }
  }


  private revokeObjectUrl() {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }

  download(config: any = {}) {
    if (this.definition) {
      const def = deepCopy(this.definition);
      let filename;

      if (config && config.filename) {
        filename = config.filename;
      } else {
        filename = this.filename || 'document.pdf';
      }

      pdfMake.createPdf(def, tableLayouts).download(filename);
    }
  }
 
   print(config: any = {}) {
     if (this.definition) {
       const def = deepCopy(this.definition);
       pdfMake.createPdf(def, tableLayouts).print();
     }
  }

}
