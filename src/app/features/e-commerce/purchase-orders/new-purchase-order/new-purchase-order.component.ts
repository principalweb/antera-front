import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy, HostListener, ElementRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, Observable, Subscription, of } from 'rxjs';
import { Store, select } from "@ngrx/store";
import { GenerateDialogComponent } from "./generate-dialog/generate-dialog.component";
import { takeUntil, tap, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import * as fromPurchaseNeed from "../state/purchase-needs.state";
import * as purchaseNeedSelectors from "../state/selectors/purchase-needs.selectors";
import { PurchaseNeedsService } from '../services/purchase-needs.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import * as PurchaseNeedsActions from "../store/purchase-needs.actions";
import { PurchaseNeed } from 'app/models';
import { ApiService } from 'app/core/services/api.service';
import { StepTwoComponent } from "./step-two/step-two.component";
import * as _ from 'lodash';


@Component({
  selector: "new-purchase-order",
  templateUrl: "./new-purchase-order.component.html",
  styleUrls: ["./new-purchase-order.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class NewPurchaseOrderComponent implements OnInit, OnDestroy {
  displayedColumns = [
    "checkbox",
    //'orderNumber',
    "item",
    "name",
    //'description',
    //'vendor',
    //'customer',
    "quantityNeeded",
    //'quantityOrdered',
    //'estimatedCost',
    //'actualCost'
  ];

  filterForm: FormGroup;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  formValueSubscription: Subscription;
  orderNumbersSubscription: Subscription;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("orderInput") orderInput: ElementRef<HTMLInputElement>;
  @ViewChild("stepper") stepper: MatStepper;
  // @ViewChild(FusePerfectScrollbarDirective) scrollbar: FusePerfectScrollbarDirective ;
  // @ViewChild('scrollEl') scrollEl: ElementRef;
  dataSource: ItemListDataSource | null;
  loading: boolean = false;
  dialogSubscription: Subscription;
  selectedAll: boolean = false;
  finalLoad: boolean = false;
  selectedAllDetails: { [key: number]: boolean } = {};
  fluxProductCheckboxes: { [key: number]: boolean } = {};
  customers: Observable<any>;
  customerSubscription: Subscription;
  constructor(
    private fb: FormBuilder,
    private ngZone: NgZone,
    public itemService: PurchaseNeedsService,
    private dialog: MatDialog,
    private api: ApiService,
    private store: Store<fromPurchaseNeed.State>
  ) {}

  ngOnInit() {
    this.subscribeToLoading();
    this.setupDataSource();
    this.createFilterForm();
    this.subscribeToCustomerAutocomplete();
    this.subscribeToRefresh();
    this.subscribeToFinalLoad();
    this.subscribeToProductCheckboxes();
    this.subscribeToProductsGroups();
    this.subscribeToShowInventory();
  }

  loadVariations() {
    console.log("loading variations");
  }

  populateOrderNumbers() {
    //this.filterForm.controls.orderNumbers.patchValue(this.filterForm.controls.orderNumbers.value);
    this.itemService.orderNumberAutocomplete("");
  }

  manageSteps(event) {
    if (event.selectedIndex === 2) {
      this.itemService.calculatePriceBreak();
    } else if (event.selectedIndex === 1 && this.itemService.selectionChanged){
      this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
      this.itemService.getPurchaseNeedsByProductIds();
      this.store.dispatch(new PurchaseNeedsActions.SelectionChanged(false));
    }
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.formValueSubscription.unsubscribe();
    this.orderNumbersSubscription.unsubscribe();
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      name: [""],
      //description: [''],
      vendor: [""],
      customer: [""],
      orderNumbers: [""],
      supplierProductId: [""],
    });
    this.subscribeToFilterForm();
  }

  remove(chip) {
    if(chip){
    const orderNumber = chip.split(" ")[0];
    this.store.dispatch(
      new PurchaseNeedsActions.RemoveMultiSelectOrderNumberFilter(orderNumber)
    );
  };
    this.itemService.removeChip(chip);
    this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
    this.itemService.getPurchaseProductNeeds();
  }

  clearFilters() {
    const previousOrderNumbers = this.itemService.productFilters.refSalesOrderNo;
    const productFilters = { ...this.itemService.productFilters};
    delete productFilters["refSalesOrderNo"];
    this.store.dispatch(
      new PurchaseNeedsActions.AddMultiSelectOrderNumberFilter([])
    );
    this.itemService.clearChips();
    this.orderInput.nativeElement.value = "";
    if (Object.values(productFilters).every(el => el === "") && previousOrderNumbers.length){
      this.itemService.getPurchaseProductNeeds();
    }
    this.initSelection(false);
    this.filterForm.patchValue({
      name: "",
      description: "",
      vendor: "",
      customer: "",
      supplierProductId: "",
    });
  }

  subscribeToLoading() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedSelectors.getLoadingState)
      )
      .subscribe((loading: boolean) => {
        this.loading = loading;
      });
  }

  subscribeToShowInventory(){
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedSelectors.getShowInventoryState))
    .subscribe((showInventory: boolean) => {
      if (this.selectedAll && !showInventory){
        this.store.dispatch(new PurchaseNeedsActions.DeselectMultipleProductLevelNeed(
          this.itemService.productGroup)
        );
      }
    });
  }

  subscribeToProductsGroups() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedSelectors.getPurchaseNeedsProductList)
      )
      .subscribe((purchaseNeedsProductList: PurchaseNeed[]) => {
        if (this.selectedAll){
          this.initSelection(false);
          this.initSelection(true);
        }
      });
  }

  setupDataSource() {
    this.dataSource = new ItemListDataSource(this.store);
  }

  subscribeToOrderNumbers() {
    this.orderNumbersSubscription = this.filterForm.controls.orderNumbers.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((val: string) => {
       this.itemService.orderNumberAutocomplete(val);
      });
  }

  subscribeToFilterForm() {
    this.formValueSubscription = this.filterForm.valueChanges
      .pipe(
        tap((val) => {
          //console.log("filter form value", val);
          const newVal = val;
          delete newVal["orderNumbers"];
          this.store.dispatch(
            new PurchaseNeedsActions.TrackProductFilters(newVal)
          );
        }),
        debounceTime(300),
        distinctUntilChanged((prev, curr) => {
          delete prev["orderNumbers"];
          delete curr["orderNumbers"];
          return _.isEqual(prev, curr);
        })
      )
      .subscribe((value) => {
        this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
        this.itemService.getPurchaseProductNeeds();
        this.itemService.getPurchaseNeedsByProductIds();
      });
    this.subscribeToOrderNumbers();
  }

  subscribeToRefresh() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedSelectors.getRefreshState)
      )
      .subscribe((refresh: null) => {
        this.refresh();
      });
  }

  refresh() {
    if (
      this.paginator.pageSize === undefined ||
      this.paginator.pageIndex === undefined
    )
      return;
    this.itemService.getPurchaseProductNeeds();
    this.itemService.getPurchaseNeedsByProductIds();
  }

  ordersSelected(e) {
    this.store.dispatch(
      new PurchaseNeedsActions.AddMultiSelectOrderNumberFilter(e.value)
    );
    this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
    this.itemService.getPurchaseProductNeeds();
  }

  selectOrder(e) {
    this.store.dispatch(new PurchaseNeedsActions.AddSingleOrderNumberFilter(e.option.value));
    this.itemService.addChip(e.option.viewValue);
    this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
    this.itemService.getPurchaseProductNeeds();
    this.orderInput.nativeElement.value = ""
    setTimeout(() => {
      this.itemService.orderNumberAutocomplete("");
      this.orderInput.nativeElement.blur();
      this.orderInput.nativeElement.focus();
      this.filterForm.controls.orderNumbers.patchValue("1");
      this.filterForm.controls.orderNumbers.patchValue("");
    }, 200);
  }

  add(event) {
    console.log("add event", event);
  }


  selectCustomer(event) {
    const customer = event.option.value;
    this.filterForm.controls.customer.patchValue(customer.name);
  }

  subscribeToCustomerAutocomplete() {
    this.customers = this.filterForm.controls.customer.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((val) => this.api.getCustomerAutocomplete(val))
    );
  }

  toggleAll() {
    if (this.selectedAll) {
      this.initSelection(false);
    } else {
      this.initSelection(true);
    }
  }

  // toggleAllDetail(productId) {
  //   console.log("first product Id", productId);
  //   if (this.selectedAllDetails[productId]) {
  //     this.initDetailSelection(false, productId);
  //   } else {
  //     this.initDetailSelection(true, productId);
  //   }
  //   console.log("productId", productId);
  //   console.log("checkboxes", this.checkboxes);
  // }

  // initDetailSelection(val = false, productId: number) {
  //   if (val) {
  //     this.selectedAllDetails[productId] = true;
  //   } else {
  //     this.selectedAllDetails[productId] = false;
  //   }
  //   const purchaseNeeds = this.itemService.normalDetailMeta.find(
  //     (detailMeta: detailMeta) => detailMeta.productId === productId
  //   ).purchaseNeeds;
  //   const purchaseObjects = {};

  //   if (val) {
  //     purchaseNeeds.forEach(
  //       (purchaseNeed: PurchaseNeed) =>
  //         (purchaseObjects[purchaseNeed.id] = true)
  //     );
  //     this.store.dispatch(
  //       new PurchaseNeedsActions.SelectMultipleNeeds(purchaseNeeds)
  //     );
  //   } else {
  //     purchaseNeeds.forEach(
  //       (purchaseNeed: PurchaseNeed) =>
  //         (purchaseObjects[purchaseNeed.id] = false)
  //     );
  //     this.store.dispatch(
  //       new PurchaseNeedsActions.DeselectAllProductNeedsByProduct(productId)
  //     );
  //   }
  //   this.store.dispatch(
  //     new PurchaseNeedsActions.DetailCheckbox(purchaseObjects)
  //   );
  //   purchaseNeeds.forEach((purchaseNeed: PurchaseNeed) => {
  //     this.checkboxes[purchaseNeed.id] = val;
  //   });
  // }

  phaseOneComplete() {
    for (let key in this.itemService.productCheckboxes) {
      if (this.itemService.productCheckboxes[key] === true) return true;
    }
    return false;
  }

  initSelection(val = false) {
    if (val) {
      this.selectedAll = true;
    } else {
      this.selectedAll = false;
    }
    this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
    if (val) {
      this.store.dispatch(
        new PurchaseNeedsActions.SelectMultipleProductLevelNeed(
          this.itemService.productGroup
        )
      );
      //this.itemService.getPurchaseNeedsByProductIds();
      
    } else {
      this.store.dispatch(
        new PurchaseNeedsActions.DeselectMultipleProductLevelNeed(
          this.itemService.productGroup
        )
      );
    }

    if (val) {
      //this.itemService.getPurchaseNeedsByProductIds();
    } else {
      this.store.dispatch(new PurchaseNeedsActions.DeselectMultipleNeeds());
      this.store.dispatch(new PurchaseNeedsActions.AllDetailChexboxesFalse());
    }
    //this.itemService.getEstimatedTotal();
    this.store.dispatch(new PurchaseNeedsActions.SelectionChanged(true));
  }

  // onSelectedChange(purchaseNeedId, clickEvent, purchaseNeed: PurchaseNeed) {
  //   this.checkboxes[purchaseNeedId] = clickEvent.checked;
  //   clickEvent.checked ? this.store.dispatch(new PurchaseNeedsActions.SelectSingleNeed(purchaseNeed)) :
  //   this.store.dispatch(new PurchaseNeedsActions.DeselectSingleNeed(purchaseNeedId));
  // }

  getDetail(productId: number, event, purchaseNeed: PurchaseNeed) {
    this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
    this.store.dispatch(
      new PurchaseNeedsActions.ProductCheckbox({ [productId]: event.checked })
    );
    if (event.checked) {
      this.store.dispatch(
        new PurchaseNeedsActions.SelectSingleProductLevelNeed(purchaseNeed)
      );
      //this.itemService.getPurchaseNeedsByProductIds();
    } else {
      this.store.dispatch(
        new PurchaseNeedsActions.DeselectProductId(productId)
      );
    }
    //this.itemService.getEstimatedTotal();
    this.store.dispatch(new PurchaseNeedsActions.SelectionChanged(true));
  }

  expand(purchaseNeed: PurchaseNeed) {
    const event = {};
    if (!this.fluxProductCheckboxes[purchaseNeed.productId]) {
      event["checked"] = true;
    } else {
      event["checked"] = false;
    }
    this.getDetail(purchaseNeed.productId, event, purchaseNeed);
  }

  paginate(event) {
    this.store.dispatch(new PurchaseNeedsActions.ProductPageEvent(event));
  }

  subscribeToFinalLoad() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedSelectors.getConfirmation)
      )
      .subscribe((confirmation: boolean) => {
        if (confirmation) {
          this.finalLoad = true;
        }
      });
  }

  subscribeToProductCheckboxes() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedSelectors.getProductChexboxes)
      )
      .subscribe(
        (productCheckboxes) => (this.fluxProductCheckboxes = productCheckboxes)
      );
  }

  // generatePurchaseOrders() {
  //   console.log("generate purchase order");
  //   const generateDialog = this.dialog.open(GenerateDialogComponent, {
  //     panelClass: ["antera-details-dialog", "generate-dialog"],
  //   });
  // }
}


export class ItemListDataSource extends DataSource<any>{
  page = {
    pageIndex: 0,
    pageSize: 50,
  }
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constructor(private store: Store<fromPurchaseNeed.State>){
    super();
  }


  handlePagination(array){
    const begin = ((this.page.pageIndex + 1) - 1) * this.page.pageSize;
    const end = begin + this.page.pageSize;
    return array.slice(begin, end);
  }
  connect(): Observable<any[]> {
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedSelectors.getProductPage))
    .subscribe((page: fromPurchaseNeed.PageEvent) => this.page = page);

    return this.store.pipe(takeUntil(this.destroyed$), 
    select(purchaseNeedSelectors.getPurchaseNeedsProductList), map((productGroups: PurchaseNeed[]) => {
      const begin = ((this.page.pageIndex + 1) - 1) * this.page.pageSize;
      const end = begin + this.page.pageSize;
      return productGroups.slice(begin, end);
    }));
  }

  disconnect(){
    this.destroyed$.next(true);
  }
}
