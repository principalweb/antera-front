import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { EcommerceProductService } from 'app/features/e-commerce/product/product.service';
import { ProductPricingMethodService } from 'app/features/e-commerce/products/product-pricing/product-pricing-method.service';
import { update } from 'lodash';
import { EditPricingMethodDialogComponent } from '../edit-pricing-method-dialog-component/edit-pricing-method-dialog-component';
import {
  Operator,
  PricingCostRangeInterface,
  PricingMarginDetailsInterface,
  PricingMethodBreaksInterface,
  SinglePricingRow,
} from '../models/pricing-methods-interfaces';
import { NewPriceRangeDialogComponent } from '../new-price-range-dialog/new-price-range-dialog.component';
import { NewPricingMethodDialogComponent } from '../new-pricing-method-dialog/new-pricing-method-dialog.component';
import { PricingMethodsQtyBreaksDialogComponent } from '../pricing-methods-qty-breaks-dialog/pricing-methods-qty-breaks-dialog.component';
import {
  PricingMethodsTableDataSource,
  PricingMethodsTableItem,
} from './pricing-methods-table-datasource';

@Component({
  selector: "pricing-methods-table",
  templateUrl: './pricing-methods-table.component.html',
  styleUrls: ['./pricing-methods-table.component.css'],
})
export class PricingMethodsTableComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<PricingMethodsTableItem>;
  dataSource: PricingMethodsTableDataSource;
  @Input() pricingMethods;
  dialogRef: any;

  dynamicColumns = [];
  displayedColumns: string[] = [
    'name',
    'type',
    'percentage',
    'quantityRange',
    'operator',
    'range',
    ' ',
  ];
  defaultDisplayedColumns: string[] = [
    'name',
    'type',
    'percentage',
    'quantityRange',
    'operator',
    'range',
  ];

  constructor(
    public dialog: MatDialog,
    private productPricingMethodService: ProductPricingMethodService,
    private productService: EcommerceProductService
  ) {}

  operators = {
    less: { icon: 'chevron_left', value: Operator.LESS_THAN },
    greater: { icon: 'chevron_right', value: Operator.GREATER_THAN },
    equal: { icon: 'drag_handle', value: Operator.EQUAL },
  };

  marginOnCostRange = [];
  marginOnCost = [];
  PerecentageOnRetail = [];
  allPricings = [];
  rangesPricing = [];
  defaultMethodType = [];
  loading = false;

  ngOnInit() {
    this.loadPricingMethods();
  }

  addQtyBreaks() {
    this.dialogRef = this.dialog.open(PricingMethodsQtyBreaksDialogComponent, {
      minHeight: '200px',
      minWidth: '300px',
      data: {
        priceBreaks: this.displayedColumns,
      },
    });

    this.dialogRef.afterClosed().subscribe((updatePricingBreaks: string[]) => {
      const updatedColumns = [];
      this.defaultDisplayedColumns.forEach((value) => {
        updatedColumns.push(value);
      });
      if (updatePricingBreaks) {
        updatePricingBreaks.forEach((element) => {
          updatedColumns.push(element);
        });
      }

      updatedColumns.push(' ');

      this.displayedColumns = [...new Set(updatedColumns)];
    });
  }

  private loadPricingMethods() {
    this.loading = true;
    this.rangesPricing = [];
    this.marginOnCostRange = [];
    this.marginOnCost = [];
    this.PerecentageOnRetail = [];
    this.allPricings = [];
    this.defaultMethodType = [];
    this.PerecentageOnRetail = [];
    this.marginOnCost = [];

    this.productPricingMethodService
      .getPricingMethodList()
      .subscribe((pricingMethods: PricingMethodBreaksInterface[]) => {
        console.log('raw pricingMethods ... ', pricingMethods);
        pricingMethods.forEach((element: any) => {
          // this.deleteById(element.id);
          this.allPricings.push(element);
 
          if(element.id === '1'){
            const name = element.name;
            const defaultRangesinglePricingRow: SinglePricingRow = {
              name: name,
              type: '',
              range: null,
              operator: null,
              id: element.id,
              methodType: null,
              marginDetailQty: null,
              marginDetailMargin: null,
              percentage: null,
              quantityRange: []
            };
            console.log(
              'element.type .. default pricing row  ...   ',
              defaultRangesinglePricingRow
            );
            this.defaultMethodType.push(defaultRangesinglePricingRow);
          }

          if (element.type === '1' && element.id !== '1') {
            const type = element.type;
            const name = element.name;
            const methodType = element.methodType;

            console.log('element ... ', element);
            console.log('element type ... ', element.type);
            console.log('element name ... ', element.name);
            console.log('element methodType ... ', element.methodType);

            const quantityRangesinglePricingRow: SinglePricingRow = {
              name: name,
              type: methodType,
              range: '0',
              operator: null,
              id: element.id,
              methodType: type,
              marginDetailQty: '0',
              marginDetailMargin: '0',
              percentage: element.percentage,
              quantityRange: element.quantityRange,
            };
            console.log(
              'element.type .. quantityRangesinglePricingRow ...   ',
              quantityRangesinglePricingRow
            );
            this.defaultMethodType.push(quantityRangesinglePricingRow);
          } else if (element.type === '3'  && element.id !== '1') {
            const type = element.type;
            const name = element.name;
            const methodType = element.methodType;

            console.log('element ... ', element);
            console.log('element type ... ', element.type);
            console.log('element name ... ', element.name);
            console.log('element methodType ... ', element.methodType);

            const quantityRangesinglePricingRow: SinglePricingRow = {
              name: name,
              type: methodType,
              range: '0',
              operator: null,
              id: element.id,
              methodType: type,
              marginDetailQty: '0',
              marginDetailMargin: '0',
              percentage: element.percentage,
              quantityRange: element.quantityRange,
            };
            console.log(
              'quantityRangesinglePricingRow .... ',
              quantityRangesinglePricingRow
            );
            this.PerecentageOnRetail.push(quantityRangesinglePricingRow);
          } else if (element.type === '2'  && element.id !== '1') {
            if (element) {
              const type = element.type;
              const name = element.name;
              const methodType = element.methodType;

              element.costRange.forEach(
                (costRange: PricingCostRangeInterface) => {
                  const pricing = costRange.cost;
                  const operator = costRange.operator;

                  const singlePricingRow: SinglePricingRow = {
                    name: name,
                    type: methodType,
                    range: pricing,
                    operator: operator,
                    id: element.id,
                    methodType: type,
                    marginDetailQty: '0',
                    marginDetailMargin: '0',
                    percentage: element.percentage,
                    quantityRange: element.quantityRange,
                  };

                  if (costRange.marginDetails) {
                    costRange.marginDetails.forEach(
                      (marginDetail: { qty: any; margin: string }) => {
                        const qty = marginDetail.qty;
                        const margin = marginDetail.margin;
                        const index = this.displayedColumns.indexOf(' ');
                        if (index > -1) {
                          this.displayedColumns.splice(index, 1);
                        }

                        singlePricingRow.marginDetailQty = qty;
                        singlePricingRow.marginDetailMargin = margin;
                        if (!this.displayedColumns.includes(qty)) {
                          console.log('qty adding to display col ', qty);
                          if( qty !== '0'){
                            this.displayedColumns.push(qty);
                          }
                          console.log('actual displayed columns ', this.displayedColumns);
                        }
                        singlePricingRow[qty] = margin;
                      }
                    );
                  }
                  if (!this.displayedColumns.includes(' ')) {
                    this.displayedColumns.push(' ');
                  }
                  this.rangesPricing.push(singlePricingRow);
                }
              );
              this.marginOnCostRange = [];
              const uniqueList = this.rangesPricing.filter(
                (v, i, a) =>
                  a.findIndex(
                    (t) => JSON.stringify(t) === JSON.stringify(v)
                  ) === i
              );
              this.marginOnCostRange = [...this.rangesPricing];
            }
          }
        });

        const allMethodsPricingLevel = [
          ...this.marginOnCostRange,
          ...this.marginOnCost,
          ...this.PerecentageOnRetail,
          ...this.defaultMethodType
        ];

        const allMethods = [...new Set(allMethodsPricingLevel)];
        console.log('all methods should be updated ', allMethods);
        this.dataSource = new PricingMethodsTableDataSource(allMethods);

        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.table.dataSource = this.dataSource;
        this.loading = false;
      });
  }

  ngAfterViewInit() {}

  editRow(event) {
    console.log('edit row ', event);
    console.log('edit rangesPricing ', this.rangesPricing);

    const editPricing = this.allPricings.filter(
      (pricing) => pricing.id === event.id
    );

    console.log('editPricing .... ', editPricing);
    const columns: Array<string> = [];
    this.displayedColumns.forEach((column: string) => {
      const columnNumber = parseInt(column);

      if (!isNaN(columnNumber)) {
        columns.push(column.toString());
      }
    });

    this.dialogRef = this.dialog.open(EditPricingMethodDialogComponent, {
      minWidth: '50%',
      minHeight: '60%',
      data: {
        action: event,
        columns: columns,
        rangesPricing: event,
        pricingMethodTypeNumber: event.methodType,
        editCostRangeMethod: editPricing,
      },
    });

    this.dialogRef.afterClosed().subscribe((newPricingLevel) => {
      this.loadPricingMethods();
    });
  }

  deleteRow(event) {
    this.loading = true;
    // for single row, missing for whole prod
    // missing d
    console.log('event ', event);

    const deletePricing = this.allPricings.filter(
      (pricing) => pricing.id === event.id
    );

    console.log('deletPricing original .... ', deletePricing);

    const deleteRow = deletePricing[0].costRange.filter(
      (pricingRow) => pricingRow.cost !== event.range
    );

    if (deleteRow && deleteRow.length > 0) {
      console.log('delete row,,,, ', deleteRow);

      deletePricing[0].costRange = [...deleteRow];

      console.log('delete pricing method updated ... ', deletePricing);
      this.productPricingMethodService
        .updatePricingMethodList(deletePricing[0])
        .subscribe((updatedPricings) => {
          console.log('updatedPricings ', updatedPricings);
          this.loadPricingMethods();
        });
    } else {
      const pricingId = deletePricing[0].id;
      console.log('pricing Id ', pricingId);
      this.deleteById(event.id);
    }
  }

  private deleteById(idToRemove: any) {
    this.productService.deletePricingMethods([idToRemove]).subscribe(
      (response) => {
        if (response) {
          this.loadPricingMethods();
        }
      },
      (err) => {}
    );
  }

  newPricingMethod() {
    this.dialogRef = this.dialog.open(NewPricingMethodDialogComponent, {
      data: {
        action: 'new pricing level',
        priceBreaks: this.displayedColumns,
      },
    });

    this.dialogRef.afterClosed().subscribe((newPricingLevel) => {
      this.dataSource.data = [];
      this.marginOnCost = [];
      this.loadPricingMethods();
    });
  }

  addMethodRanges() {
    let costRangeMethods = [];
    costRangeMethods = this.allPricings.filter((method) => method.type === '2');
    this.dialogRef = this.dialog.open(NewPriceRangeDialogComponent, {
      data: {
        action: 'edit pricing ranges',
        pricingMethods: costRangeMethods,
      },
    });

    this.dialogRef.afterClosed().subscribe((newPricingLevel) => {
      console.log('newPricingLevel when close', newPricingLevel);
      this.dialogRef = null;
      this.dataSource.data = [];
      this.marginOnCost = [];
      this.loadPricingMethods();
    });
  }
}
