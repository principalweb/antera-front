import { Component, OnInit, Input, SimpleChanges, ViewEncapsulation, OnChanges } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/collections';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { MessageService } from 'app/core/services/message.service';
import { KitDataSource } from 'app/models';

@Component({
  selector: 'app-kit-list',
  templateUrl: './kit-list.component.html',
  styleUrls: ['./kit-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class KitListComponent implements OnInit {
  @Input() product:any;

  displayedColumns: string[] = ['select', 'image', 'productId', 'productName', 'color', 'size', 'quantity', 'hide', 'action'];
  dataSource: KitDataSource[] = [];
  colorSize: any[] = [];
  kitForm: FormGroup;
  selection = new SelectionModel<KitDataSource>(true, []);

  constructor(
    private formBuilder: FormBuilder,
    private msg: MessageService
  ) { }

  ngOnInit() {
      this.buildData();
  }

  buildData() {
      this.dataSource = [];
      this.kitForm = this.formBuilder.group({});
      this.product.KitArray.Kit.forEach((rowKit, kitIndex) => {
          this.colorSize[rowKit.pId] = {size:[],color:[]};
          rowKit.ProductPartArray.ProductPart.forEach(rowPart => {
              this.colorSize[rowKit.pId].color = this.colorSize[rowKit.pId].color.filter(f => f.color !== rowPart.ColorArray.Color.colorName);
              this.colorSize[rowKit.pId].color.push({color:rowPart.ColorArray.Color.colorName});
              this.colorSize[rowKit.pId].size = this.colorSize[rowKit.pId].size.filter(f => f.size !== rowPart.ApparelSize.labelSize);
              this.colorSize[rowKit.pId].size.push({size:rowPart.ApparelSize.labelSize});
          });
          let image = "";
          if(rowKit.MediaContent[0]) {
              image = rowKit.MediaContent[0].url;
          }
          let matrixTemplate = {
                        kitId:rowKit.id,
                        kitKey:kitIndex,
                        pId:rowKit.pId,
                        productName:rowKit.productName,
                        productId:rowKit.productId,
                        hide:rowKit.hide,
                        productType:rowKit.productType,
                        setting:true,
                        };
          if(rowKit.KitPartArray.KitPart.length == 0) {
            if(rowKit.ProductPartArray.ProductPart[0]) {
              rowKit.KitPartArray.KitPart.push({sku:"", color:"", size:"", quantity:"0"});
            } else if(rowKit['productType'] == '2') {
              rowKit.KitPartArray.KitPart.push({sku:"", color:"", size:"", quantity:"0"});
            } else {
              this.msg.show('Product variations not found for product ' + rowKit.productId, 'error');
            }
          }
          if(rowKit.KitPartArray.KitPart.length > 0) {
              rowKit.KitPartArray.KitPart.forEach((rowPart, index) => {
                  let colorImage = "";
                  if(rowPart.color != "") {
                      let colorImageObj = rowKit.MediaContent.filter(m => m.color == rowPart.color);
                      if(colorImageObj[0]) {
                          colorImage = colorImageObj[0].url;
                      }
                  }
                  if(colorImage == "") {
                      colorImage = image;
                  }
                  this.dataSource.push({...matrixTemplate, matrixId:rowPart.id, sku:rowPart.sku, color:rowPart.color, size:rowPart.size, quantity:rowPart.quantity, key:index, image:colorImage});
                  this.kitForm.addControl("color_" + (this.dataSource.length - 1), new FormControl(this.dataSource[(this.dataSource.length - 1)].color));
                  this.kitForm.addControl("size_" + (this.dataSource.length - 1), new FormControl(this.dataSource[(this.dataSource.length - 1)].size));
                  this.kitForm.addControl("quantity_" + (this.dataSource.length - 1), new FormControl(this.dataSource[(this.dataSource.length - 1)].quantity));
                  matrixTemplate.setting = false;
              });
          }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
      if(changes.product.currentValue) {
          this.buildData();
      }
  }
  
  updateHide(e, data, index) {
      e.stopPropagation();
      let rowKit = this.product.KitArray.Kit.filter(f => f.id == data.kitId);
      if(rowKit.length == 1) {
          rowKit[0].hide = rowKit[0].hide==1?0:1;
      }
  }
  
  setValue(data, index) {
      let rowKit = this.product.KitArray.Kit.filter(f => f.id == data.kitId);
      if(rowKit.length == 1) {
          if(this.kitForm.value['color_'+ index] && this.kitForm.value['color_'+ index] != "" && this.kitForm.value['size_'+ index] && this.kitForm.value['size_'+ index] != "") {
              let rowPart = rowKit[0].ProductPartArray.ProductPart.filter(p => p.ColorArray.Color.colorName == this.kitForm.value['color_'+ index] && p.ApparelSize.labelSize == this.kitForm.value['size_'+ index]);
              if(rowPart.length == 1) {
                  rowKit[0].KitPartArray.KitPart[data.key].sku = rowPart[0]['sku'];
                  rowKit[0].KitPartArray.KitPart[data.key].color = this.kitForm.value['color_'+ index];
                  rowKit[0].KitPartArray.KitPart[data.key].size = this.kitForm.value['size_'+ index];
                  rowKit[0].KitPartArray.KitPart[data.key].quantity = this.kitForm.value['quantity_'+ index];
              }
              this.buildData();
          } else if(data.productType == '2') {
              rowKit[0].KitPartArray.KitPart[0].quantity = this.kitForm.value['quantity_'+ index];
              this.buildData();
          } else {
              rowKit[0].KitPartArray.KitPart[data.key].color = this.kitForm.value['color_'+ index];
              rowKit[0].KitPartArray.KitPart[data.key].size = this.kitForm.value['size_'+ index];
              rowKit[0].KitPartArray.KitPart[data.key].quantity = this.kitForm.value['quantity_'+ index];
          }
      }
  }

  addRow(data) {
      let rowKit = this.product.KitArray.Kit.filter(f => f.id == data.kitId);
      if(rowKit.length == 1) {
          rowKit[0].KitPartArray.KitPart.push({sku:"", color:"", size:"", quantity:"0"});
          this.buildData();
      }
  }

  removeRow(data) {
      let rowKit = this.product.KitArray.Kit.filter(f => f.id == data.kitId);
      if(rowKit.length == 1) {
          rowKit[0].KitPartArray.KitPart.splice(data.key, 1);
          this.buildData();
      }
  }

  deleteSelected() {
      const selectedId = this.selection.selected.map(obj => { return obj.kitKey;});
      if(selectedId.length > 0) {
          let putBack = this.product.KitArray.Kit.filter((item, index) => {
              return !selectedId.includes(index);
          });
          this.product.KitArray.Kit = putBack;
          this.buildData();
      } else {
          this.msg.show('Please select items to remove!', 'error');
      }
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.forEach(row => this.selection.select(row));
  }

}
