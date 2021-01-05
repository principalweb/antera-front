import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as html2pdf from 'html2pdf.js';
import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'app-source-factory-response',
  templateUrl: './source-factory-response.component.html',
  styleUrls: ['./source-factory-response.component.scss']
})
export class SourceFactoryResponseComponent implements OnInit {

  @Input() source: any;
  @Input() submission: any;
  @ViewChild('documentRef') documentRef: ElementRef;
  logo: any;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getLogo().subscribe((res) => {
      this.logo = res;
    });
  }

  toPdf() {
    const element = this.documentRef.nativeElement;
    const filename = `Inquiry.${this.source.id}.pdf`;
    const opt = {
      margin: [20, 0, 20, 0],
      filename: filename,
      image: { type: 'jpeg' },
      pagebreak: {
        avoid: ['img', '.details__table tr', '.details__table img', 'tr']
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
    };

    html2pdf(element, opt).output('datauristring').then((val) => {
      console.log(`Exported ${filename} successfully`, 'success');
    }).catch(err => {
      console.log(`Failed exporting ${filename}`, 'error', err);
    });

  }

}
