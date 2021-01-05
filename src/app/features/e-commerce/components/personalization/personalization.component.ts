import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { FormControl, FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { find, findIndex, isEmpty, sortBy, sum, filter, unionBy, each, remove, groupBy, keys } from 'lodash';
import { Observable, BehaviorSubject, Subject, of, forkJoin } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { fuseAnimations } from '@fuse/animations';
import { Personalization } from 'app/models';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { PersonalizationService } from 'app/core/services/personalization.service';
import { EditPersonalizationComponent } from '../edit-personalization/edit-personalization.component';


@Component({
  selector: 'personalization',
  templateUrl: './personalization.component.html',
  styleUrls: ['./personalization.component.scss'],
  animations: fuseAnimations
})
export class PersonalizationComponent implements OnInit {
  loading = false;
  displayColumns = ['itemCode', 'itemSize', 'itemColor', 'sequance', 'displayText', 'notes', 'font', 'color', 'location', 'actions'];
  colorTypes = ['Select', 'White', 'Black'];
  fontTypes = ['Select', 'Script', 'Block Upper Lower', 'Block Upper', 'Italic Upper Lower', 'Italic Upper', 'Drax Standard Font'];
  controls: FormArray;  
  @ViewChild(MatTable) table: MatTable<any>;
  orderConfig: any;
  selectedPersonalizations = this.ps.list$;
  orderId: any;
  addonChargeId: any;
  lineItemId: any
  locationTypes = [];
  matrixKeys = [];
  // TODO find out type of matrixGroup 
  matrixGroups: any = [];

  currentFile: string;  
  totalRecords: string;  
  processedRecords: string;  
  errorRecords: string;  
  importPersonalizationsForm: FormGroup;   
  previewRecords: any[];
  isImportDone : boolean = false;
  deactivate = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<PersonalizationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msg: MessageService,
    private api: ApiService,
    public ps: PersonalizationService,
    private formBuilder: FormBuilder
  ) {
      this.orderId = data.orderId;
      this.addonChargeId = data.addonChargeId;
      this.lineItemId = data.item.lineItemUpdateId;
      //this.ps.getQuoteOrderPersonalizations(this.orderId);

        this.importPersonalizationsForm = this.createImportPersonalizationsForm();
        this.currentFile = "";
        this.totalRecords = "";  
        this.processedRecords = "";  
        this.errorRecords = "";  
        
      this.getDecoLocationsList();
      
      
  }

  ngOnInit() {
    this.getPersonalizations();
  }


  updateField(index, field) {
    const control = this.getControl(index, field);
    if (control.valid) {
      this.ps.update(index,field,control.value);
    }

   }

  getControl(index, fieldName) {
    const a  = this.controls.at(index).get(fieldName) as FormControl;
    return this.controls.at(index).get(fieldName) as FormControl;
  }


  addPersonalization(){
    const dialogRef = this.dialog.open(EditPersonalizationComponent, {
      data: {
        action: 'new',
        orderId: this.data.orderId,
        addonChargeId: this.data.addonChargeId,
        deco: this.data.deco,
        item: this.data.item,
        config: this.data.config,
        p: [],
      },
      panelClass: "personalization-list-modal"
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (!data)
        return;
            this.loading = true;
	    this.api.updatePersonalizations(data).subscribe(
	      (res: any[]) => {
		this.getPersonalizations();
	      },
	      (err) => { 
	        this.loading = false;
	      }
	    );  
    });  
  }
  onEditPersonalization(row) {
    const dialogRef = this.dialog.open(EditPersonalizationComponent, {
      data: {
        action: 'edit',
        orderId: this.data.orderId,
        addonChargeId: this.data.addonChargeId,
        deco: this.data.deco,
        item: this.data.item,
        config: this.data.config,
        p: row,
      },
      panelClass: "personalization-list-modal"
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (!data)
        return;
            this.loading = true;
	    this.api.updatePersonalizations(data).subscribe(
	      (res: any[]) => {
		this.getPersonalizations();
	      },
	      (err) => { 
	        this.loading = false;
	      }
	    );  
    });
  }
  deletePersonalizations(index){
     this.ps.list.splice(index, 1);
     this.ps.list$ = new BehaviorSubject(this.ps.list);	            
     this.selectedPersonalizations = this.ps.list$;
     this.matrixGroups = groupBy(this.ps.list, 'matrixQtyId');     
     this.getPersonalizations();

  /*
    this.api.deletePersonalizations([row.id]).subscribe(
      (res: any[]) => {
        this.getPersonalizations();
        this.loading = false;
      },
      (err) => { 
        this.loading = false;
      }
    ); 
    */
  }
  getPersonalizations() {
  

            this.loading = true;
	    this.api.getQuoteOrderPersonalizations(this.orderId, this.lineItemId).subscribe(
	      (res: any[]) => {
        	      this.ps.list = res;
                      this.getPersonalizationsForm();
 		      this.loading = false;
	      },
	      (err) => { 
	        this.loading = false;
	      }
	    );    
  /*
    this.loading = true;
    this.api.getPersonalizationsList({ termIn: { orderId: [this.orderId] } }).subscribe(
      (res: any[]) => {
        this.selectedPersonalizations = res;
        this.loading = false;
      },
      (err) => { 
        this.loading = false;
      }
    );  
    */
  }
  getPersonalizationsForm() {
         	      this.ps.list$ = new BehaviorSubject(this.ps.list);
	            
	            this.selectedPersonalizations = this.ps.list$;
	            this.matrixGroups = groupBy(this.ps.list, 'matrixQtyId');
	            this.matrixKeys = Object.keys(this.matrixGroups);
	            //this.matrixKeys = groupBy(this.ps.list, 'matrixQtyId');
		    const toGroups = this.ps.list$.value.map(entity => {
		      return new FormGroup({
			orderId: new FormControl(entity.orderId), 
			lineItemId: new FormControl(entity.lineItemId), 
			matrixId: new FormControl(entity.matrixId), 
			matrixQtyId: new FormControl(entity.matrixQtyId), 
			itemNo: new FormControl(entity.itemNo), 
			itemCode: new FormControl(entity.itemCode), 
			itemSize: new FormControl(entity.itemSize), 
			itemColor: new FormControl(entity.itemColor), 
			sequance: new FormControl(entity.sequance), 
			displayText: new FormControl(entity.displayText), 
			notes: new FormControl(entity.notes), 
			font: new FormControl(entity.font), 
			color: new FormControl(entity.color), 
			location: new FormControl(entity.location), 
		      },{updateOn: "blur"});
		    });
		    this.controls = new FormArray(toGroups);
  
  }
  itemIndex(matrixQtyId){
    return this.matrixKeys.indexOf(matrixQtyId) + 1;
    // return (Math.ceil(index/5));
    //console.log('itemIndex '+matrixQtyId);
    //console.log(this.ps.list.findIndex(x => x.matrixQtyId === matrixQtyId))
    //return matrixQtyId;
    //return this.ps.list.findIndex(x => x.matrixQtyId == matrixQtyId);

  }
  firstItemIndex(index, matrixQtyId){

    if(index === this.ps.list.findIndex(x => x.matrixQtyId === matrixQtyId)){
        return true;
    }else{
        return false;
    }  
  }
  save(){
            this.loading = true;
            //console.log(this.ps.list);
            //console.log(this.ps.list$.value);
	    this.api.updateQuoteOrderPersonalizations(this.ps.list$.value).subscribe(
	      (res: any[]) => {
		    this.loading = false;
		    this.dialogRef.close({
		    });  
	      },
	      (err) => { 
	        this.loading = false;
	      }
	    );  
  }

    getDecoLocationsList() {

	const opts = {
	    offset: 0,
	    limit: 1000,
	    order:"locationName",
	    orient:"asc",
	    imageOnly:"1",
	    term: {
	    }
	  };

        return this.api.getDecorationLocationsList(opts).subscribe((response: any) => {
            this.locationTypes = response;
        });
    }
    addPersonalizations(element){
        let row = {
	    orderId: element.orderId, 
	    lineItemId: element.lineItemId,
	    matrixId: element.matrixId,
	    matrixQtyId: element.matrixQtyId,
	    matrixQtyNo: element.matrixQtyNo,
	    itemCode: element.itemCode,
	    itemNo: element.itemNo,
	    itemSize: element.itemSize,
	    itemColor: element.itemColor,
	    sequance: this.matrixGroups[element.matrixQtyId].length + 1,
            displayText: '',
            notes: '',
            font: 'Select',
            color: 'Select',
            location: 'Select',
        };
        let index = this.ps.list.findIndex(x => x.matrixQtyId === row.matrixQtyId);
        index = index + this.matrixGroups[element.matrixQtyId].length;
        this.ps.list.splice(index, 0, row);
        this.ps.list$ = new BehaviorSubject(this.ps.list);	            
        this.selectedPersonalizations = this.ps.list$;
        this.matrixGroups = groupBy(this.ps.list, 'matrixQtyId');
        this.getPersonalizationsForm();

/*
	orderId: string; 
	lineItemId: string;
	matrixId: string;
	matrixQtyId: string;
	matrixQtyNo: string;
	itemCode: string;
	itemNo: string;
	itemSize: string;
	itemColor: string;
	sequance: string;
	displayText: string;
	notes: string;
	font: string;
	color: string;
	location: string;
*/
    }

    createImportPersonalizationsForm()
    {
        return this.formBuilder.group({
            importPersonalizationsFile: null,
            module: "Personalizations",
            importCloudFile: null,
            importId:null,
        });
    }


    initImportPersonalizationsForm()
    {
        this.importPersonalizationsForm = this.createImportPersonalizationsForm();
        this.currentFile = "";
        this.totalRecords = "";  
        this.processedRecords = "";  
        this.errorRecords = "";  
        this.isImportDone = false;

    }


    onFileChange(event,type) {
        if(event.target.files.length > 0) {
            let file = event.target.files[0];
            this.currentFile = file.name;
            this.importPersonalizationsForm.get('importPersonalizationsFile').setValue(file);
            this.isImportDone = false;    
            this.totalRecords = "";  
            this.processedRecords = "";  
            this.errorRecords = "";  
            
            
        }
    }

    uploadCSV(type) {
        if (this.importPersonalizationsForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        if (!this.importPersonalizationsForm.get('importPersonalizationsFile').value)
        return;

        const data = new FormData();
        data.append('File', this.importPersonalizationsForm.get('importPersonalizationsFile').value);
        data.append('orderId', this.orderId);
        data.append('lineItemId', this.lineItemId);
        this.loading = true;
        this.isImportDone = false;
        this.api.uploadImportFile(data)
        .subscribe((res: any) => {
            this.importPersonalizationsForm.get('importCloudFile').setValue(res.msg);
            const initImportData = new FormData();        
            initImportData.append('importCloudFile', res.msg);
            initImportData.append('module', "Personalizations");
            initImportData.append('orderId', this.orderId);
            initImportData.append('lineItemId', this.lineItemId);
            this.api.initImport(initImportData)
            .subscribe((res: any) => {
                this.getPersonalizations();
                this.loading = false;
                this.totalRecords = res.totalRecords;  
                this.processedRecords = res.processedRecords;  
                this.errorRecords = res.errorRecords;  
                this.importPersonalizationsForm = this.createImportPersonalizationsForm();
                this.currentFile = "";
                this.isImportDone = true;
            	if(res.status == 'error'){
            		alert(res.msg);
		this.isImportDone = false;	            		
            	}                
            }, (err => {
                this.getPersonalizations();
                this.loading = false;
                this.isImportDone = false;
                this.importPersonalizationsForm = this.createImportPersonalizationsForm();
                this.currentFile = "";

            }));        
            }, (err => {
                this.getPersonalizations();
                this.loading = false;
                this.importPersonalizationsForm = this.createImportPersonalizationsForm();
                this.currentFile = "";
            }));
            

    
    }
}
