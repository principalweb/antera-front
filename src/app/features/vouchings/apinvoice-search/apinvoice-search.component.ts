import { Component, OnInit, Inject } from '@angular/core';
import { formatDate } from "@angular/common";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MessageService } from 'app/core/services/message.service';

import { ApiService } from 'app/core/services/api.service';
import { VouchingsService } from '../vouchings.service';

@Component({
  selector: 'apinvoice-search',
  templateUrl: './apinvoice-search.component.html',
  styleUrls: ['./apinvoice-search.component.scss']
})
export class ApinvoiceSearchComponent implements OnInit {

  searchForm: FormGroup;

  electronicEndpoint = '';
  psEnabled = false;
  enableSearch = true;
  searchApi = '';

  dataSource: any[] = [];
  displayedColumns: string[] = ['invoiceNumber', 'poNumber', 'invoiceDate', 'salesAmount', 'shippingAmount', 'totalAmount', 'type', 'compare'];

  constructor(
    private dataService: VouchingsService,
    public dialogRef: MatDialogRef<ApinvoiceSearchComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private fb: FormBuilder,
    private msg: MessageService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.enableSearch = true;
    this.createForm();
    this.dataSource = [];

    this.api.checkElectronicEndpoint('Invoice', this.data.vendorId, this.data.orderId)
        .then((res: any) => {
          if (res.enabled) {
            this.psEnabled = res.enabled;
            this.electronicEndpoint = res.endpoint;
          } else {
            this.psEnabled = false;
            this.electronicEndpoint = '';
          }
        }).catch((err) => {
            console.log(err);
        });
  }

  createForm() {
    this.searchForm = this.fb.group({
      'searchType': '1',
      'poNumber': this.data.poNumber,
      'vendorId': this.data.vendorId,
      'orderId': this.data.orderId,
      'invoiceNumber': '',
      'invoiceDate': '',
    });
  }

  search(api = 'local') {
    this.enableSearch = false;
    if (api == 'local') {
      this.dataSource = [];
    }
    const data = this.searchForm.value;
    data.api = api;
    if (data.searchType == '3') {
      if (data.invoiceDate == '') {
        this.msg.show('Please select an invoice date', 'error');
        this.enableSearch = true;
        return;
      }
      data.invoiceDate = formatDate(data.invoiceDate, 'yyyy-MM-dd', 'en-US');
    } else if (data.searchType == '2' && data.invoiceNumber == '') {
      this.msg.show('Please enter an invoice number', 'error');
      this.enableSearch = true;
      return;
    }
    this.searchApi = api;
    this.dataService.searchApinvoice(data)
        .subscribe((res: any) => {
          this.searchApi = '';
          if (res.data[0] && res.data[0].number) {
            res.data.forEach(r => {
              r.api = api;
              this.dataSource = this.dataSource.concat(r);
            });
          } else {
          }
          this.enableSearch = true;
          if (api == 'local' && this.electronicEndpoint != '') {
            this.search('promo');
          }
        }, (err) => {
          this.searchApi = '';
          this.enableSearch = true;
        });
  }

  compare(index) {
    this.dialogRef.close(this.dataSource[index]);
  }

  close() {
    this.dialogRef.close();
  }

}
