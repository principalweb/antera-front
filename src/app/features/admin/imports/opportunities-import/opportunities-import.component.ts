import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-opportunities-import',
  templateUrl: './opportunities-import.component.html',
  styleUrls: ['./opportunities-import.component.scss']
})
export class OpportunitiesImportComponent implements OnInit {

  currentFile: string;  
  totalRecords: string;  
  processedRecords: string;  
  errorRecords: string;  
  importOpportunitiesForm: FormGroup;   
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
    this.importOpportunitiesForm = this.createImportOpportunitiesForm();
    this.currentFile = "No File Chosen";
    this.totalRecords = "";  
    this.processedRecords = "";  
    this.errorRecords = "";  
    this.importErrorDetails = [];
  }

  ngOnInit(): void {
  }

  createImportOpportunitiesForm()
  {
      return this.formBuilder.group({
          importUsersFile: null,
          module: "Leads",
          importCloudFile: null,
          importId:null,
      });
  }

  initImportOpportunitiesForm()
  {
      this.importOpportunitiesForm = this.createImportOpportunitiesForm();
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
        this.importOpportunitiesForm.get('importOpportunitiesFile').setValue(file);
        this.isImportDone = false;    
        this.totalRecords = "";  
        this.processedRecords = "";  
        this.errorRecords = "";  
        this.importErrorDetails = [];
    }
  }

  uploadCSV(type) {
        if (this.importOpportunitiesForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        if (!this.importOpportunitiesForm.get('importOpportunitiesFile').value)
        return;

        const data = new FormData();
        data.append('File', this.importOpportunitiesForm.get('importOpportunitiesFile').value);
        this.loading = true;
        this.isImportDone = false;
        this.api.uploadImportFile(data)
        .subscribe((res: any) => {
            this.importOpportunitiesForm.get('importCloudFile').setValue(res.msg);
            const initImportData = new FormData();        
            initImportData.append('importCloudFile', res.msg);
            initImportData.append('module', "Opportunities");
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
                this.importOpportunitiesForm = this.createImportOpportunitiesForm();
                this.currentFile = "No File Chosen";
                this.isImportDone = true;
            	if(res.status == 'error'){
                alert(res.msg);
		            this.isImportDone = false;	            		
            	}                
            }, (err => {
                this.loading = false;
                this.isImportDone = false;
                this.importOpportunitiesForm = this.createImportOpportunitiesForm();
                this.currentFile = "No File Chosen";

            }));        
            }, (err => {
                this.loading = false;
                this.importOpportunitiesForm = this.createImportOpportunitiesForm();
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
                this.api.downloadOpportunitiesTemplate({}).subscribe((res: any) => {
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
                
                new Angular5Csv(data, 'opportunities-import-template', options);
                })
              } else {
                window.location.href='/protected/content/get-opportunities-import-template';
              }
              this.confirmDialogRef = null;
          });
        }

        
}
