import { Component, OnInit, ViewEncapsulation, ViewChild, Inject, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, forkJoin, of } from 'rxjs';
import { values, every, some, forEach, find, isEmpty } from 'lodash';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from '../../../../core/services/api.service';
import { EcommerceOrderService } from '../../order.service';
import { AttachCategoryComponent } from './attach-category/attach-category.component';
import { ConfigureVendorComponent } from './configure-vendor/configure-vendor.component';
import { chain, plural } from '../../utils';
import { map, switchMap } from 'rxjs/operators';
import { MatrixRow } from 'app/models';

@Component({
  selector: 'product-universal-search',
  templateUrl: './product-universal-search.component.html',
  styleUrls: ['./product-universal-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductUniversalSearchComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() afterFinished: EventEmitter<any> = new EventEmitter();

  searchText = '';
  databases = {};
  loading = false;
  searchedText = '';
  list = [];
  datasource: MatTableDataSource<any>;
  defaultImage = 'assets/images/ecommerce/product-image-placeholder.png';

  displayedColumns = ['checkbox', 'itemNo', 'image', 'name', 'brand', 'vendor', 'price', 'source', 'category'];
  checkboxes = {};
  allChecked = false;
  anyChecked = false;
  filterForm: FormGroup;
  sources = [];
  preferredVendor = false;
  eqpVendor = false;
  exactMatch = false;

  saving = false;

  reqChain: any;
  searchList = [];
  currentSearch = "";
  errors: any = [];
  results: any = {};
    private dialogRefCat: MatDialogRef<AttachCategoryComponent>;
    private dialogRefVen: MatDialogRef<ConfigureVendorComponent>;
  private forceCategory = false;
  view = 'search';
  productDetail = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private orderService: EcommerceOrderService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<ProductUniversalSearchComponent>,
    private msg: MessageService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      'productId': [''],
      'name': [''],
      'category': [''],
      'vendor': [''],
      'productBrand': [''],
      'salepriceMin': [''],
      'salepriceMax': [''],
      'source': ['']
    });
    this.apiService.getAdvanceSystemConfigAll({module: 'Products'})
    .subscribe((response: any) => {
      this.forceCategory = false;
      if (response.settings.forceCategory === '1') {
        this.forceCategory = true;
      }
    });
  }

  ngOnInit() {
    this.datasource = new MatTableDataSource([]);
    this.sources = this.orderService.universalProductAPIs;
    this.sources.forEach((v) => {
      this.databases[v.api] = true;
    });
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    setTimeout(() => {
      if (this.orderService.productUniversalSearch) {
        this.filterForm.setValue(this.orderService.productUniversalSearch.form);
        this.list = this.orderService.productUniversalSearch.list;
        this.datasource.data = [...this.list];
        this.preferredVendor = this.orderService.productUniversalSearch.preferredVendor;
        this.eqpVendor = this.orderService.productUniversalSearch.eqpVendor;
        this.exactMatch = this.orderService.productUniversalSearch.exactMatch;
        this.orderService.productUniversalSearch = null;
      }
    }, 0);
  }

  search() {
    this.loading = true;
    this.datasource.data = [];
    this.list = [];

    const dbs = this.orderService.universalProductAPIs.filter(db =>
      !this.filterForm.value.source || db.code === this.filterForm.value.source
    );
    const obArr = [];

    const params = { ...this.filterForm.value };
    if (this.eqpVendor) {
      params.eqpVendor = "1";
    } else {
      params.eqpVendor = "";
    }
    if (this.preferredVendor) {
      params.preferredVendor = "1";
    } else {
      params.preferredVendor = "";
    }
    params.exactMatch = this.exactMatch;

    delete params.source;

    if (isEmpty(params)) {
      this.msg.show('Please enter keywords to search', 'error');
      return;
    }

    const handleResult = (res: any) => {
      const c = this.list.length;
      if (res.msg.length > 0) {
        res.msg.forEach(msg => {
          this.msg.show(msg, 'error');
        });
      }
      const listWithID = res.results.map((item, i) => {
        const api = find(dbs, { code: item.api }) || {};

        return {
          ...item,
          source: api.api,
          index: c + i
        }
      });

      this.list = [
        ...this.list,
        ...listWithID
      ];

      this.datasource.data = this.list;
      return res.results.length;
    }

    this.searchList = [];
    dbs.forEach(db => {
      if (this.databases[db.api]) {
        if (db.sub) {
          db.sub.forEach(sub => {
            const subscription = this.apiService.getUniversalProducts(
              db.code, sub.code, params
            ).pipe(
              map(handleResult)
            );

            obArr.push(subscription);
            this.searchList.push({ name: sub.name });
          });
        } else {
          const subscription = this.apiService.getUniversalProducts(
            db.code, null, params
          ).pipe(
            map(handleResult)
          );

          obArr.push(subscription);
          this.searchList.push({ name: db.api });
        }
      }
    });

    if (obArr.length > 0) {
      this.reqChain = chain(obArr);
      if (this.searchList[0] && this.searchList[0].name) {
        this.currentSearch = this.searchList[0].name;
      }
      this.reqChain.finished.subscribe(
        () => {
          this.loading = false;
          this.currentSearch = "";
          this.searchList = [];
        },
        () => {
          this.loading = false;
        }
      );
      this.reqChain.trigger.subscribe(
        (i) => {
          if (this.searchList[i] && this.searchList[i].name) {
            this.currentSearch = this.searchList[i].name;
          } else {
            this.currentSearch = "";
          }
        },
        () => {
        }
      );
      return;
    }

    this.loading = false;
  }

  cancelSearch() {
    this.reqChain.cancel();
    this.loading = false;
  }

  checkSelection(i) {
    this.checkboxes[i] = !this.checkboxes[i];
    const varr = values(this.checkboxes).filter(Boolean);
    const pageSize = this.getPageItemsCount();
    this.allChecked = varr.length >= pageSize;
    this.anyChecked = varr.length < pageSize && varr.length > 0;
  }

  toggleAll() {
    if (this.allChecked) {
      this.checkboxes = {};
      this.anyChecked = false;
      this.allChecked = false;
    } else {
      this.checkboxes = {};

      const c = this.getPageItemsCount();
      for (let i = 0; i < c; i++) {
        this.checkboxes[i] = 1;
      }

      this.allChecked = true;
      this.anyChecked = false;
    }
  }

  refreshChecks() {
    this.checkboxes = {};
    this.allChecked = false;
    this.anyChecked = false;
    }



    addProduct(category = []) {
        let uniqueVendor = {};
        let uniqueVendorArray = [];

        let pageSize = this.getPageItemsCount();
        forEach(this.checkboxes, (v, k) => {
          // TODO test that casting k into a parse int is valid
            if (v && parseInt(k) < pageSize) {
                let i = this.paginator.pageIndex * this.paginator.pageSize + parseInt(k);
                if (uniqueVendor[this.datasource.data[i].vendor] === undefined) {
                    uniqueVendor[this.datasource.data[i].vendor] = { vendor: this.datasource.data[i].vendor, indexes: [], final: "", matchItems: [], formControlName: "" };
                }
                uniqueVendor[this.datasource.data[i].vendor].indexes.push(i);
            }
        });

        for (let key in uniqueVendor) {
            uniqueVendorArray.push(uniqueVendor[key]);
        }
        
        let dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
    
        //dialogConfig.maxWidth = 600;;
        dialogConfig.panelClass=['vendor-selector'];
        dialogConfig.data = uniqueVendorArray;


        this.dialogRefVen = this.dialog.open(ConfigureVendorComponent, dialogConfig);



        this.dialogRefVen.afterClosed()
            .subscribe((response) => {
                let process = false;
                if (response !== undefined) {
                    for (let key in response) {
                        process = true;
                        if (response[key].final == "")
                            continue;
                        for (let j = 0; j < response[key]["indexes"].length; j++) {
                            this.datasource.data[response[key]["indexes"][j]].vendor = response[key].final;
                        }

                    }
                }
                if (!process) {
                    return;
                }
                this.addProductForward(category);
            });
    }

    addProductForward(category = []) {
    const obArr = [];

    const pageSize = this.getPageItemsCount();
    forEach(this.checkboxes, (v, k) => {
      // TODO test that casting k into a parse int is valid
      if (v && parseInt(k) < pageSize) {
        const i = ((this.paginator.pageIndex * this.paginator.pageSize) + Number(k));
        obArr.push(
          this.apiService.getUniversalConvertedProduct(this.datasource.data[Number(i)], category)
        );
      }
    });

    if (obArr.length === 0) {
      this.msg.show('Please select products to add', 'success');
      return;
    }

    if (this.loading) {
      this.cancelSearch();
    }

    this.saving = true;
    this.apiService.getAdvanceSystemConfigAll({ module: 'Orders' })
      .subscribe((res: any) => {
        const orderConfig: any = res.settings;
        chain(obArr).finished
          .pipe(
            switchMap((rst: any) => {
              const order = this.orderService.order;
              const products = rst.result.filter(p => {
                if ((p.err && p.err == "error" && p.msg)) {
                  this.msg.show(p.msg, 'error');
                  return false;
                }
                if (!p || !p.productId) {
                  this.msg.show('An error occurred with the product import, please contact your supplier to ensure you have access to the product.', 'error');
                  return false;
                }
                return true;
              }).map(p => {
                const defaultImage = p.MediaContent && p.MediaContent[0] && p.MediaContent[0].url;

                const product = {
                  ...p,
                  productId: p.id,
                  itemNo: p.productId,
                  showAttribColor: p.showColor,
                  showAttribSize: p.showSize,
                  quoteCustomImage: [defaultImage],
                  ...orderConfig
                };

                // Add first matrix row
                if (this.data.addFirstRow) {
                  if (p.ProductPartArray && p.ProductPartArray.ProductPart) {
                    const defaultSku = p.ProductPartArray.ProductPart[0];
                    const color = defaultSku.ColorArray.Color.colorName;
                    const size = defaultSku.ApparelSize.labelSize;

                    let image;
                    if (color) {
                      const colorImage = p.MediaContent.find((media) => media.color === color);
                      if (colorImage) {
                        image = colorImage.url;
                      }
                    }
                    if (!image) {
                      image = defaultImage;
                    }

                    const matrixRow = new MatrixRow({
                      color: color,
                      size: size,
                      quantity: 1,
                      poType: 'DropShip',
                      priceStrategy: orderConfig.defaultProductPriceStrategy || 'MANUAL',
                      costStrategy: orderConfig.defaultProductCostStrategy || 'MANUAL',
                      imageUrl: image,
                      fulfillments: [{ quantity: 1, type: 'DropShip' }]
                    });
                    product.matrixRows = [matrixRow];
                  }
                }

                return product;
              });
              return forkJoin([
                this.apiService.updateLineItem(order.id, products).pipe(
                  switchMap(() => this.orderService.getOrder(order.id))
                ),
                of(rst)
              ]);
            })
          ).subscribe(
            (rst: any) => {
              this.saving = false;
              const fc = rst[1].failed.length;
              if (fc > 0) {
                this.msg.show(`Failed to add ${plural('product', fc)}`, 'error');
              }

              if (rst[1].result.length > 0) {
                this.dialogRef.close('add_to_product');
              }
            }
          );
      }, () => {
        this.saving = false;
      });
  }

  showCategoryDialog(forward) {
    if(this.forceCategory) {
      this.dialogRefCat = this.dialog.open(AttachCategoryComponent, {
        panelClass: ['antera-details-dialog', 'app-product-mass-update'],
        data: {}
      });
      this.dialogRefCat.afterClosed()
          .subscribe((response) => {
              if (response) {
              if (forward === 'product') {
                this.saveForLater(response);
              } else {
                this.addProduct(response);
              }
            }
          });
    } else {
      if (forward === 'product') {
        this.saveForLater();
      } else {
        this.addProduct();
      }
    }
  }

    saveForLater(category = []) {
        let uniqueVendor = {};
        let uniqueVendorArray = [];
        let pageSize = this.getPageItemsCount();
        forEach(this.checkboxes, (v, k) => {
          // TODO test that casting k into a parse int is valid
            if (v && parseInt(k) < pageSize) {
                let i = this.paginator.pageIndex * this.paginator.pageSize + parseInt(k);
                if (uniqueVendor[this.datasource.data[i].vendor] === undefined) {
                    uniqueVendor[this.datasource.data[i].vendor] = { vendor: this.datasource.data[i].vendor, indexes: [], final: "", matchItems: [], formControlName: "" };
                }
                uniqueVendor[this.datasource.data[i].vendor].indexes.push(i);
            }
        });
        for (let key in uniqueVendor) {
            uniqueVendorArray.push(uniqueVendor[key]);
        }
        
        let dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
    
        //dialogConfig.maxWidth = 600;;
        dialogConfig.panelClass=['vendor-selector'];
        dialogConfig.data = uniqueVendorArray;


        this.dialogRefVen = this.dialog.open(ConfigureVendorComponent, dialogConfig);

        this.dialogRefVen.afterClosed()
            .subscribe((response) => {
                let process = false;
                if (response !== undefined) {
                    for (let key in response) {
                        process = true;
                      if (response[key].final == "")
                          continue;
                      for (let j = 0; j < response[key]["indexes"].length; j++) {
                          this.datasource.data[response[key]["indexes"][j]].vendor = response[key].final;
                      }
                    
                    }
                }
                if (!process) {
                    return;
                }
                this.saveForLaterForward(category);
            });
    }

  saveForLaterForward(category = []) {
          const obArr = [];

    const pageSize = this.getPageItemsCount();
    forEach(this.checkboxes, (v, k) => {
      // TODO test that casting k into a parse int is valid
      if (v && parseInt(k) < pageSize) {
        const i = this.paginator.pageIndex * this.paginator.pageSize + parseInt(k);
        
        obArr.push(
          this.apiService.getUniversalConvertedProduct(this.datasource.data[i], category).pipe(
            map((res: any) => {
              res.product = this.datasource.data[i];
              return res;
            })
          )
        );
      }
    });

    if (obArr.length === 0) {
      this.msg.show('Please select products to save', 'success');
      return;
      }

    this.saving = true;

    const parent = this.data.parent;
    this.orderService.productUniversalSearch = {
      form: this.filterForm.value,
      list: this.list,
      eqpVendor: this.eqpVendor,
      preferredVendor: this.preferredVendor,
      exactMatch: this.exactMatch
    };

    chain(obArr).finished
      .subscribe(
        (rst: any) => {
          let moveIndexes = [];
          rst.result.forEach((row) => {
            if (row.err && row.err == "error" && row.msg) {
              this.msg.show(row.msg, 'error');
            } else if (!row.productId) {
              const index = rst.result.indexOf(row);
              moveIndexes.push(index);
              rst.failed.push({ ...row });
            }
          });
          moveIndexes.forEach((index) => {
            rst.result.splice(index, 1);
          });
          const fc = rst.failed.length;
          this.results = rst;
          if (fc > 0) {
            this.errors = rst.failed;
            this.saving = false;
          } else if (this.data.addTo === 'order' || this.data.addTo === 'product') {
            const rc = rst.result.length;
            this.msg.show(`${rc} out of ${obArr.length} product${rc > 1 ? 's' : ''} saved successfully to database`, 'error');
            this.saving = false;
            this.dialogRef.close();
          }
          this.afterFinished.emit(true);

        }
      );
  }

  openManualEntry() {
    this.dialogRef.close('manual-entry');
  }

  closeDialog() {
    this.dialogRef.close();
  }

  clearFilters() {
    this.filterForm.reset();
    this.list = [];
    this.datasource.data = [];
  }

  private getPageItemsCount() {
    const n = this.list.length - this.paginator.pageIndex * this.paginator.pageSize;
    return Math.min(n, this.paginator.pageSize);
  }

  showDetail(product) {
    this.productDetail = product;
    this.view = 'detail';
  }

  closeDetail() {
    this.view = 'search';
  }
}
