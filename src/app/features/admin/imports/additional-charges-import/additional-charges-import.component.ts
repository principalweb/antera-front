import { Component, OnInit } from '@angular/core';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-additional-charges-import',
  templateUrl: './additional-charges-import.component.html',
  styleUrls: ['./additional-charges-import.component.scss']
})
export class AdditionalChargesImportComponent implements OnInit {

  currentFile: string;  
  totalRecords: string;  
  processedRecords: string;  
  errorRecords: string;  
  importAdditionalChargesForm: FormGroup;   
  previewRecords: any[];
  loading : boolean = false;
  isImportDone : boolean = false;
  msg: any;
  deactivate = false;
  isArray: boolean;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  importErrorDetails: any[];

  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    public dialog: MatDialog
  ) { 
    this.importAdditionalChargesForm = this.createImportAdditionalChargesForm();
    this.currentFile = "No File Chosen";
    this.importErrorDetails = [];
  }

  ngOnInit(): void {
  }

  testImport() {
    //this.importAdditionalChargesForm.get('importCloudFile').setValue(res.msg);
        const initImportData = new FormData();
        initImportData.append('importCloudFile', '/home/kanhasoft/Downloads/Additional Charges_template (8).csv');
        initImportData.append('module', "Additional Charges");
        this.api.initImport(initImportData)
          .subscribe((res: any) => {
            this.loading = false;
            this.totalRecords = res.totalRecords;
            this.processedRecords = res.processedRecords;
            this.errorRecords = res.errorRecords;
            this.importAdditionalChargesForm = this.createImportAdditionalChargesForm();
            this.currentFile = "No File Chosen";
            this.isImportDone = true;
            if (res.status == 'error') {
              alert(res.msg);
              this.isImportDone = false;
            }
          }, (err => {
            this.loading = false;
            this.isImportDone = false;
            this.importAdditionalChargesForm = this.createImportAdditionalChargesForm();
            this.currentFile = "No File Chosen";

          }));
  }

  createImportAdditionalChargesForm() {
    return this.formBuilder.group({
      importAdditionalChargesFile: null,
      module: "Deco Locations",
      importCloudFile: null,
      importId: null,
    });
  }

  downloadTemplate() {
   
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Do you want a sampling of the data or all records (this could take some time)?';
    this.confirmDialogRef.componentInstance.confirmButtonText = 'All Data';
    this.confirmDialogRef.componentInstance.cancelButtonText = 'Sample Data';


    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.api.downloadAdditionalChargesTemplate().subscribe((res: any) => {
          this.loading = false;
          const options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalseparator: '.',
            showLabels: true,
            showTitle: false,
            useBom: true,
            noDownload: false,
            headers: Object.keys(res[0]),
            nullToEmptyString: true,
          };

          const data = this.isArray ? res.flatMap((data) => data) : res;

          new Angular5Csv(data, 'Additional_Charges_template', options);
        })
      } else {
        window.location.href = '/protected/content/get-additional-charges-import-template';
      }
      this.confirmDialogRef = null;
    });
  }

  initImportAdditionalChargesForm() {
    this.importAdditionalChargesForm = this.createImportAdditionalChargesForm();
    this.currentFile = "No File Chosen";
    this.totalRecords = "";
    this.processedRecords = "";
    this.errorRecords = "";
    this.isImportDone = false;
    this.importErrorDetails = [];
  }

  onFileChange(event, type) {
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      this.currentFile = file.name;
      this.importAdditionalChargesForm.get('importAdditionalChargesFile').setValue(file);
      this.isImportDone = false;
      this.totalRecords = "";
      this.processedRecords = "";
      this.errorRecords = "";
      this.importErrorDetails = [];

    }
  }

  uploadCSV(type) {
    if (this.importAdditionalChargesForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    if (!this.importAdditionalChargesForm.get('importAdditionalChargesFile').value)
      return;

    const data = new FormData();
    data.append('File', this.importAdditionalChargesForm.get('importAdditionalChargesFile').value);
    this.loading = true;
    this.isImportDone = false;
    this.api.uploadImportFile(data)
      .subscribe((res: any) => {
        this.importAdditionalChargesForm.get('importCloudFile').setValue(res.msg);
        const initImportData = new FormData();
        initImportData.append('importCloudFile', res.msg);
        initImportData.append('module', "Additional Charges");
        this.api.initImport(initImportData)
          .subscribe((res: any) => {
            this.loading = false;
            this.totalRecords = res.totalRecords;
            this.processedRecords = res.processedRecords;
            this.errorRecords = res.errorRecords;
            if(res.importErrorDetails) {
              if(res.importErrorDetails[0] && res.importErrorDetails[0][0]) {
                  this.importErrorDetails = res.importErrorDetails[0];
              } else {
                this.importErrorDetails = res.importErrorDetails;
              }  
            }   
            this.importAdditionalChargesForm = this.createImportAdditionalChargesForm();
            this.currentFile = "No File Chosen";
            this.isImportDone = true;
            if (res.status == 'error') {
              alert(res.msg);
              this.isImportDone = false;
            }
          }, (err => {
            this.loading = false;
            this.isImportDone = false;
            this.importAdditionalChargesForm = this.createImportAdditionalChargesForm();
            this.currentFile = "No File Chosen";

          }));
      }, (err => {
        this.loading = false;
        this.importAdditionalChargesForm = this.createImportAdditionalChargesForm();
        this.currentFile = "No File Chosen";
      }));
  }
}
