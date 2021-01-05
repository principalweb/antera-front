import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subscription } from 'rxjs';
import { SelectionService } from 'app/core/services/selection.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { Router} from '@angular/router';
import { ApiService } from 'app/core/services/api.service';


@Component({
  selector: 'app-aws-tagging',
  templateUrl: './aws-tagging.component.html',
  styleUrls: ['./aws-tagging.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations  
})
export class AwsTaggingComponent implements OnInit {


  fileKey : string;
  metaData : any;
  onSelectionChangedSubscription: Subscription;
  filterForm: FormGroup;
  dataSource: MatTableDataSource<any>;
  checkboxes: any = {};
  displayedColumns = ['checkbox', 'name'];
  tagList = ['Customer Info', 'Customer Proof', 'Vendor Info', 'Vendor Proof'];
  loading = false;
  loaded = () => {
      this.loading = false;
  };
  tagsForm: FormGroup;

  constructor(
        public selection: SelectionService,
        private api: ApiService,  
        public dialogRefTagging: MatDialogRef<AwsTaggingComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private router: Router,
        private msg: MessageService      
  ) { 
        this.fileKey = data.fileKey;
        this.metaData = data.metaData;
  }

  ngOnInit() {
      this.dataSource = new MatTableDataSource([]);
      const tableData = [];
      const data = new FormData();

      this.tagList.forEach((row: any, i) => {
              const newRow = {
                    id:row,
                    position: i+1,
                    name: row,
              }
              tableData.push(newRow);
              
            });
      this.dataSource.data = tableData;
      this.selection.init(tableData);
      this.loading = false;
      this.onSelectionChangedSubscription =
      this.selection.onSelectionChanged
          .subscribe(selection => {
              this.checkboxes = selection;
          }); 
      this.selection.reset(false);    
      this.tagList.forEach((row: any, i) => {
          if(this.metaData.indexOf(row) !== -1){
              this.selection.toggle(row);
          }
       });              
  }

  ngOnDestroy()
  {
      
  }
  sort(ev){
  
  }
  onSelectedChange(moduleName)
  {
      this.selection.toggle(moduleName);
  }
    
  toggleAll(ev) {
      this.selection.reset(ev.checked);
  }
    
  save() {
        this.dialogRefTagging.close(this.selection.selectedIds);
  }
}
