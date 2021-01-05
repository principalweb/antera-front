import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit, SimpleChanges } from '@angular/core';
import { Account } from 'app/models';
import { VendorDecorationPriceStrategy } from 'app/models/vendor-decoration-price-strategy';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ApiService } from 'app/core/services/api.service';
import { formatInteger } from 'app/utils/helper';
import { Subscription, Observable, forkJoin } from 'rxjs';
import { AccountsService } from '../../accounts.service';
import { find, filter } from 'lodash';
import { fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';


@Component({
  selector: 'vendor-decoration-price-strategy',
  templateUrl: './vendor-decoration-price-strategy.component.html',
  styleUrls: ['./vendor-decoration-price-strategy.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class VendorDecorationPriceStrategyComponent implements OnInit {
  @Input() account: Account;
  @Input() tabName = '';
  @Output() edit = new EventEmitter();

  filteredPriceStrategy : any;
  editingInfo = false;
  priceStrategy: VendorDecorationPriceStrategy;
  fieldLabel = fieldLabel;
  visibleField = visibleField;
  requiredField = requiredField;
  priceStrategyList : any;
  loading = false;
  fields = [];
  decoTypes = [];

  priceStrategyForm: FormGroup;
  onModuleFieldsChangedSubscription: Subscription;
  onPriceStrategyChanged: Subscription;
  onDropdownOptionsForAccountChangedSubscription: Subscription;


  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    private accountsService: AccountsService,
    private authService: AuthService,
    private msg: MessageService
  ) { }


  ngOnInit() {
    this.onModuleFieldsChangedSubscription =
        this.accountsService.onModuleFieldsChanged
            .subscribe((fields: any[]) => {
              this.fields = fields;
            });

    this.onDropdownOptionsForAccountChangedSubscription =
      this.accountsService.onDropdownOptionsForAccountChanged
          .subscribe((res: any[]) => {
              if (!res) return;

              const accountVendorDecorationPriceStrategyDropdown = find(res, {name: 'sys_vendor_decoration_price_strategy'});
              this.filteredPriceStrategy = accountVendorDecorationPriceStrategyDropdown && accountVendorDecorationPriceStrategyDropdown.options;              

          });

    forkJoin([
      this.api.getDecoratorTypes()
    ]).subscribe((res: any) => {
        this.decoTypes = res[0];
        console.log(this.decoTypes);
    });
    
    this.priceStrategy = new VendorDecorationPriceStrategy();
    this.priceStrategyForm = this.createForm();
    this.getPriceStrategyPerAccount();
  }

  ngOnDestory() {
    this.onDropdownOptionsForAccountChangedSubscription.unsubscribe();
    this.onPriceStrategyChanged.unsubscribe();
    if (this.onModuleFieldsChangedSubscription) this.onModuleFieldsChangedSubscription.unsubscribe();
  }

  getPriceStrategyPerAccount() {
    this.onPriceStrategyChanged =
            this.api.getVendorDecorationPriceStrategyList({term : {accountId: this.account.id}}).subscribe(priceStrategy => {
                     this.priceStrategyList = priceStrategy;
                 });
  }

  savePriceStrategy() {
    this.loading = true;
    this.editPriceStrategy();
    //this.edit.emit({type: 'PriceStrategy', dataForm: this.priceStrategyForm});
    this.api.createVendorDecorationPriceStrategy(this.priceStrategyForm.getRawValue()).subscribe((res: any) => {
	     this.loading = false;
	     if(res && res.status == 'success'){
		 this.msg.show(res.msg, 'success');
		 this.getPriceStrategyPerAccount();
	     }else{
		 this.msg.show(res.msg, 'error');
	     }
	 });
  }

  editPriceStrategy() {
    this.editingInfo = !this.editingInfo;
  }

  selectFilteredPriceStrategy(ev) {
        const ps = this.filteredPriceStrategy.find(filteredPriceStrategy => filteredPriceStrategy.value == ev.value);
        this.priceStrategyForm.patchValue({
            priceStrategy: ps.value
        });
  }

  deletePriceStrategy(id) {
    this.loading = true;
    this.api.deleteVendorDecorationPriceStrategy({ids : {id}}).subscribe((res: any) => {
	     this.loading = false;
	     if(res && res.status == 'success'){
		 this.msg.show(res.msg, 'success');
		 this.getPriceStrategyPerAccount();
	     }else{
		 this.msg.show(res.msg, 'error');
	     }
	 });
  }


  selectDecoType(ev) {
        const dt = this.decoTypes.find(decoType => decoType.id == ev.value);
        this.priceStrategyForm.patchValue({
            decoTypeId: dt.id
        });
  }

  createForm() {
    return this.formBuilder.group({
        id                   : requiredField('id', this.fields) ? [this.priceStrategy.id] : [this.priceStrategy.id],
        accountId         : requiredField('accountId', this.fields) ? [this.account.id] : [this.account.id],
        decoTypeId               : requiredField('decoTypeId', this.fields) ? [this.priceStrategy.decoTypeId] : [this.priceStrategy.decoTypeId],
        priceStrategy               : requiredField('priceStrategy', this.fields) ? [this.priceStrategy.priceStrategy] : [this.priceStrategy.priceStrategy],
    });
  }
}
