import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Activity } from 'app/models';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute, Router, NavigationStart, Params } from '@angular/router';
import { ApiService } from 'app/core/services/api.service';
import { take, map, takeUntil } from 'rxjs/operators';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Injectable({
  providedIn: 'root'
})
export class NoteService implements Resolve<any>, OnDestroy {
  // order tab subjects
  basicInfoNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  productsNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  documentsNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  filesNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  historyNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  vouchingNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  invoiceNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  //

  //doc note subjects
  docInvoiceNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  docOrderConfirmationNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  docPackingListNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  docQuoteNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  docMultiQuoteNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  docProformaInvoiceNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  docPurchaseOrderNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  docDecorationPONotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  docWorkOrderNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  docOrderRecapNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  docPickListNotes: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  //** doc note subjects */

  currentTab: BehaviorSubject<string> = new BehaviorSubject<string>("");
  displayedActivites: BehaviorSubject<Activity[]> = new BehaviorSubject<Activity[]>([]);
  open: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  refresh: Subject<boolean> = new Subject();

  destroyed$: Subject<boolean> = new Subject<boolean>();
  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService){ }
  orderId: string;
  orderTabIndex: number;

  payload = {
    offset: 0,
    limit: 50,
    order: '',
    orient: 'asc',
    term: {
      type: '',
      name: '',
      refId: '',
      refType: 'Order',
      refName: '',
      assigned: '',
      dueDate: '',
      dateEntered: '',
      owner: '',
      status: '',
      direction: '',
      phone: '',
      userId: ''
    }
  }

  resolve(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
      if (route.data.refType) {
        this.payload.term.refType = route.data.refType;
      }
     
    this.getAllActivities(route.params.id);
    
    this.subscribeToRefresh();
  }

  getAllActivities(id){
    console.log('basicInfoNotes ', this.basicInfoNotes);
    this.getActivities(id, "Order Details", this.basicInfoNotes);
    this.getActivities(id, "Products", this.productsNotes);
    this.getActivities(id, "Files", this.filesNotes);
    this.getActivities(id, "History", this.historyNotes);
    this.getActivities(id, "Vouching", this.vouchingNotes);
    this.getActivities(id, "Invoicing", this.invoiceNotes);
  }

  formatIndex(idx: number){
  const tabs = ["Order Details",
        "Products",
        "Documents",
        "Activities",
        "Files",
        "History",
        "Vouching"];
    const currentTab = tabs[idx];
    this.changeTab({
      tab: {
        textLabel: currentTab
      }
    });
  }

  changeTab(event: any){
    switch(event.tab.textLabel){
      case "Order Details": {
        this.displayedActivites.next([...this.basicInfoNotes.value]);
        this.currentTab.next("OrderDetails");
        break;
      }
      case "Products": {
        console.log('products notes selected .... ', this.productsNotes.value);
        this.displayedActivites.next([...this.productsNotes.value]);
        this.currentTab.next("Products");
        break;
      }
      case "Documents": {
        this.getOrderDocumentActivities("Order Confirmation");
        this.currentTab.next("Order Confirmation");
        break;
      }
      case "Files": {
        this.displayedActivites.next([...this.filesNotes.value]);
        this.currentTab.next("Files");
        break;
      }
      case "History": {
        this.displayedActivites.next([...this.historyNotes.value]);
        this.currentTab.next("History");
      }
      default: {
        this.displayedActivites.next([]);
        this.currentTab.next("");
      }
    }
  }

  getOrderId(){
    const pathName = window.location.pathname;
    if (pathName.includes("/e-commerce/orders/")){
      return pathName.split("/e-commerce/orders/").join("");
    }
    return "";
  }

  getActivities(refId: string, orderTab: string, behaviorSubject: BehaviorSubject<Activity[]>){
   this.api.getActivities({ ...this.payload, term: { ...this.payload.term, orderTab, refId} })
      .pipe(take(1), map((activities: any[] ) => activities.map(activity => new Activity(activity))))
      .subscribe(basicInfoActivities => {
        behaviorSubject.next(basicInfoActivities);
        if (behaviorSubject === this.basicInfoNotes && this.orderTabIndex != 3) this.displayedActivites.next(basicInfoActivities);
      });
  }

  numberOfNotes(): string {
    const number = this.displayedActivites.value.length.toString();
    //console.log("number", number);
    return number;
  }

  closeSideNav(event){
    this.open.next(false);
  }

  showButton(): boolean {
    return this.displayedActivites.value.length > 0;
  }

  toggleSideNav(event){
    //console.log("clicked", event);
    event.stopPropagation();
    this.open.next(!this.open.value);
   // console.log("value change", this.open.value);
  }

  getOrderDocumentActivities(orderDoc: string){
    this.api.getActivities({ ...this.payload, term: { ...this.payload.term, orderTab: "Documents", refId: this.getOrderId(), orderDoc} })
      .pipe(take(1), map((activities: any[]) => activities.map(activity => new Activity(activity))))
      .subscribe(orderConfirmationActivities => {
        // this.docOrderConfirmationNotes.next(orderConfirmationActivities);
        // console.log("Order Confirmation", orderConfirmationActivities);
        this.displayedActivites.next(orderConfirmationActivities);
      });
  }

  


  subscribeToRefresh(){
    this.refresh.pipe(takeUntil(this.destroyed$))
    .subscribe(val => this.getAllActivities(this.getOrderId() ? this.getOrderId() : ""));
  }

  

  ngOnDestroy(){
    this.destroyed$.next(true);
  }

  
}
