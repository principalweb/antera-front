import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdkTableModule } from '@angular/cdk/table';
import { FuseConfirmDialogModule } from '@fuse/components';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-artworks-import',
  templateUrl: './artworks-import.component.html',
  styleUrls: ['./artworks-import.component.scss']
})
export class ArtworksImportComponent implements OnInit {

    currentFile: string;  
    currentZipFile: string;  
    totalRecords: string;  
    processedRecords: string;  
    errorRecords: string;  
    importArtworksForm: FormGroup;   
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
        this.importArtworksForm = this.createImportArtworksForm();
        this.currentFile = "No File Chosen";
        this.currentZipFile = "No File Chosen";
        this.totalRecords = "";  
        this.processedRecords = "";  
        this.errorRecords = "";  
        this.importErrorDetails = [];
    }

    ngOnInit() {
    }
    

    createImportArtworksForm()
    {
        return this.formBuilder.group({
            importArtworksFile: null,
            importArtworksZipFile:null,
            module: "Artworks",
            importCloudFile: null,
            importCloudZipFile: null,
            importId:null,
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
            if ( result )
            {
            this.loading = true;
            this.api.downloadArtworksTemplate().subscribe((res: any) => {
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
            
            new Angular5Csv(data, 'Artworks_template', options);
            })
            } else {
            window.location.href='/protected/content/get-artworks-import-template';
            }
            this.confirmDialogRef = null;
        });
    }


    initImportArtworksForm()
    {
        this.importArtworksForm = this.createImportArtworksForm();
        this.currentFile = "No File Chosen";
        this.currentZipFile = "No File Chosen";
        this.totalRecords = "";  
        this.processedRecords = "";  
        this.errorRecords = "";  
        this.isImportDone = false;
        this.importErrorDetails = [];
    }


    onFileChange(event,type) {
    //console.log(event.target);
    //console.log(event.target.files.length);
        if(event.target.files.length > 0) {
            let file = event.target.files[0];
            this.currentFile = file.name;
            this.importArtworksForm.get('importArtworksFile').setValue(file);
            this.isImportDone = false;    
            this.totalRecords = "";  
            this.processedRecords = "";  
            this.errorRecords = "";  
            this.importErrorDetails = [];
            
        }
    }

    onZipFileChange(event,type) {
        if(event.target.files.length > 0) {
            let file = event.target.files[0];
            this.currentZipFile = file.name;
            this.importArtworksForm.get('importArtworksZipFile').setValue(file);
            this.isImportDone = false;    
            this.totalRecords = "";  
            this.processedRecords = "";  
            this.errorRecords = "";  
            
        }
    }
    
    uploadCSV(type) {
        if (this.importArtworksForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        if (!this.importArtworksForm.get('importArtworksFile').value)
        return;

        const data = new FormData();
        data.append('File', this.importArtworksForm.get('importArtworksFile').value);
        data.append('ZipFile', this.importArtworksForm.get('importArtworksZipFile').value);
        this.loading = true;
        this.isImportDone = false;
        this.api.uploadImportFile(data)
        .subscribe((res: any) => {
            this.importArtworksForm.get('importCloudFile').setValue(res.csvURL);
            this.importArtworksForm.get('importCloudZipFile').setValue(res.zipURL);
            const initImportData = new FormData();        
            initImportData.append('importCloudFile', res.csvURL);
            initImportData.append('importCloudZipFile', res.zipURL);
            initImportData.append('module', "Artworks");
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
                this.importArtworksForm = this.createImportArtworksForm();
                this.currentFile = "No File Chosen";
                this.currentZipFile = "No File Chosen";
                this.isImportDone = true;
            	if(res.status == 'error'){
            		alert(res.msg);
		this.isImportDone = false;	            		
            	}                
            }, (err => {
                this.loading = false;
                this.isImportDone = false;
                this.importArtworksForm = this.createImportArtworksForm();
                this.currentFile = "No File Chosen";
                this.currentZipFile = "No File Chosen";

            }));        
            }, (err => {
                this.loading = false;
                this.importArtworksForm = this.createImportArtworksForm();
                this.currentFile = "No File Chosen";
                this.currentZipFile = "No File Chosen";
            }));
            

    
    }
    
}
