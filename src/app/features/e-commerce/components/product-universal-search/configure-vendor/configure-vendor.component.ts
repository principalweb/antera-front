import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { VendorsService } from './vendors.service';
import { Category } from 'app/models';
import { unionBy,} from 'lodash';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';


var stringSimilarity = require('string-similarity');

@Component({
  selector: 'configure-vendor',
  templateUrl: './configure-vendor.component.html',
  styleUrls: ['./configure-vendor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ConfigureVendorComponent implements OnInit {
  
  isLoading = false;
  vendorForm: FormGroup;
    currentSearch: string;
    public vendorItems: any[];
    public finalItem: any[];
    public loading: boolean = true;
    private selectorRequired = 0;

  constructor(
      private msg: MessageService,
      private api: ApiService,
      public dialogRef: MatDialogRef<ConfigureVendorComponent>,
      private fb: FormBuilder,
      private vendorsService:VendorsService,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {

      this.vendorForm = this.fb.group({});
  }

    ngOnInit() {
        this.processData();
    }
    getActiveItems = function () {
        /*
        return this.data.filter((item: any) => {
            return item.final == '';
        })*/
        return this.data;
    }
    processData = async function () {
        for (let i = 0; i < this.data.length; i++) {
            let ajaxRetData = await this.vendorsService.searchVendor(this.data[i].vendor);
            if (ajaxRetData.type == "Full") {
                this.data[i].final = this.data[i].vendor;
                continue;
            }
            else if (ajaxRetData.type == "Alias") {
                this.data[i].final = ajaxRetData.name;
            }
            else if (ajaxRetData.type == "Match") {
                this.selectorRequired++;
                this.data[i].matchItems = ajaxRetData.name;
                this.data[i].matchItems = this.sort(this.data[i].matchItems)
                    for (let j = 0; j < this.data.length; j++) {
                        if( j === i)
                            continue;
                        let similarity = (stringSimilarity.compareTwoStrings(this.data[i].vendor, this.data[j].vendor)* 100);
                        if(similarity > 25){
                            this.data[i].matchItems.push({"name":this.data[j].vendor,"perc":similarity.toFixed(2)});    
                        }

                        
                    }
                this.data[i].matchItems = this.sort(this.data[i].matchItems);

              
            }

        }
        if (this.selectorRequired == 0) {
            this.dialogRef.close({ ...this.data });
        }
        this.createFormGroup();
        this.loading = false;

    }
    createFormGroup = function () {
        let formStructure = {};

        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].final != "") {
                continue;
            }
            formStructure["Selector" + i] = ['', Validators.required]
            this.data[i].formControlName = "Selector" + i;

        }


        this.vendorForm = this.fb.group(formStructure);

    }

    sort = function (data) {
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data.length; j++) {
                if (data[i]["perc"] > data[j]["perc"]) {
                    let hData = data[i];
                    let lData = data[j];
                    data[i] = lData;
                    data[j] = hData;

                }
            }
        }
        return data;


    }
    decreaseSelector = function () {
        this.selectorRequired--;
        if (this.selectorRequired == 0) {
            //this.dialogRef.close({ ...this.data });
        }
    }
    cancel = async function () {
        this.data = [];
        this.dialogRef.close({ ...this.data });

    } 
    save = async function () {
        if (!this.vendorForm.valid)
            return;
       this.loading = true;
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].final != "") {
                continue;
            }
            this.data[i].final = this.vendorForm.value[this.data[i].formControlName];
            await this.vendorsService.acceptVendor({ name: this.data[i].final, vendor: this.data[i].vendor });

        }
       this.dialogRef.close({ ...this.data });

    }

    vendorOption(event, item) {
        if (item.final === "") {
            item.final = item.vendor
        }
        else {
            item.final = "";
        }
        this.createFormGroup();
        this.decreaseSelector();
    }
    handleSelection(event, controlName) {
        this.vendorForm.controls[controlName].setValue("");
        if (event.option.selected) {
            let selected = [];
            for (let i = 0; i < event.source.selectedOptions.selected.length;i++) {
                if (event.source.selectedOptions.selected[i].value !== event.option._value) {
                    //selected.push(event.source.selectedOptions.selected[i])
                    event.source.selectedOptions.selected[i].selected = false;
                }
            }
            this.vendorForm.controls[controlName].setValue(event.option._value)
            //event.source.selectedOptions.selected = selected;
        }

    }
}
