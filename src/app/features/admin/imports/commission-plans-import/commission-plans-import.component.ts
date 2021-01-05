import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-commission-plans-import',
  templateUrl: './commission-plans-import.component.html',
  styleUrls: ['./commission-plans-import.component.scss']
})
export class CommissionPlansImportComponent implements OnInit {

  currentFile: string;  
  totalRecords: string;  
  processedRecords: string;  
  errorRecords: string;  
  importCommissionPlansForm: FormGroup;   
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
    this.importCommissionPlansForm = this.createImportCommissionPlansForm();
    this.currentFile = "No File Chosen";
    this.totalRecords = "";  
    this.processedRecords = "";  
    this.errorRecords = "";  
    this.importErrorDetails = [];
  }

  ngOnInit(): void {
  }

  createImportCommissionPlansForm()
  {
      return this.formBuilder.group({
          importUsersFile: null,
          module: "Leads",
          importCloudFile: null,
          importId:null,
      });
  }

  initImportCommissionPlansForm()
  {
      this.importCommissionPlansForm = this.createImportCommissionPlansForm();
      this.currentFile = "No File Chosen";
      this.totalRecords = "";  
      this.processedRecords = "";  
      this.errorRecords = "";  
      this.isImportDone = false;
      this.importErrorDetails = [];
  }

  onFileChange(event,type) {
    if(event.target.files.length > 0) {
        let file = event.target.files[0];
        this.currentFile = file.name;
        this.importCommissionPlansForm.get('importCommissionPlansFile').setValue(file);
        this.isImportDone = false;    
        this.totalRecords = "";  
        this.processedRecords = "";  
        this.errorRecords = "";  
        this.importErrorDetails = [];
    }
  }

    uploadCSV(type) {
        if (this.importCommissionPlansForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        if (!this.importCommissionPlansForm.get('importCommissionPlansFile').value)
        return;

        const data = new FormData();
        data.append('File', this.importCommissionPlansForm.get('importCommissionPlansFile').value);
        this.loading = true;
        this.isImportDone = false;
        this.api.uploadImportFile(data)
        .subscribe((res: any) => {
            this.importCommissionPlansForm.get('importCloudFile').setValue(res.msg);
            const initImportData = new FormData();        
            initImportData.append('importCloudFile', res.msg);
            initImportData.append('module', "Leads");
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
                this.importCommissionPlansForm = this.createImportCommissionPlansForm();
                this.currentFile = "No File Chosen";
                this.isImportDone = true;
            	if(res.status == 'error'){
                alert(res.msg);
		            this.isImportDone = false;	            		
            	}                
            }, (err => {
                this.loading = false;
                this.isImportDone = false;
                this.importCommissionPlansForm = this.createImportCommissionPlansForm();
                this.currentFile = "No File Chosen";

            }));        
            }, (err => {
                this.loading = false;
                this.importCommissionPlansForm = this.createImportCommissionPlansForm();
                this.currentFile = "No File Chosen";
            }));
    }

    downloadTemplate() {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
          disableClose: false
        });
    
          this.confirmDialogRef.componentInstance.confirmMessage = 'Do you want a sampling of the data or all records (this could take some time)?';
          this.confirmDialogRef.componentInstance.confirmButtonText = 'All Data';
          this.confirmDialogRef.componentInstance.cancelButtonText = 'Sample Data';
        
        
          this.confirmDialogRef.afterClosed().subscribe(result => {
             if ( result )
              {
                this.loading = true;
                this.api.downloadCommissionPlansTempalte({}).subscribe((res: any) => {
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
                
                new Angular5Csv(data, 'commission-plans-import-template', options);
                })
              } else {
                window.location.href='/protected/content/get-commission-plans-import-template';
              }
              this.confirmDialogRef = null;
          });
        }

}
