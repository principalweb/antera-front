import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { find } from 'lodash';

@Component({
  selector: 'app-product-stores-dialog',
  templateUrl: './product-stores-dialog.component.html',
  styleUrls: ['./product-stores-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductStoresDialogComponent implements OnInit {

  storeList = [];
  _selection: string[] =[];
  checkboxes: {};
  dialogTitle: "Select Tags";
  
  constructor(    
    public dialogRef: MatDialogRef<ProductStoresDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,

  ) {
      this.storeList = data.storeList;
      if(this.data.title) {
        this.dialogTitle = this.data.title;
      }
      this.checkboxes = {};
      this.storeList.map(store => {
        this.checkboxes[store.id] = false;
      });
   }

  ngOnInit() {

  }

  onSelectedChange(storeId)
  {
    if ( this._selection.length > 0 )
    {
        const index = this._selection.indexOf(storeId);

        if ( index !== -1 )
        {
            this._selection.splice(index, 1);
            return;
        }
    }

    this._selection.push(storeId);
    for ( const id in this.checkboxes )
    {
        if (!this.checkboxes.hasOwnProperty(id)) {
            continue;
        }
        this.checkboxes[id] = this._selection.includes(id);
    } 
  }

  onStoresSelected() {

    let selectedStoreList = [];
    this._selection.forEach((sId) => {
      const store = find(this.storeList, {
        id: sId
      });
      selectedStoreList.push(store);
    });

    selectedStoreList = selectedStoreList.map(store => {
      return {store: store.store};
    })
    
    this.dialogRef.close({
      selectedStoreList: selectedStoreList
    });
  }
}
