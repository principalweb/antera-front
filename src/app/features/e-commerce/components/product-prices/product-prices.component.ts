import { Component, EventEmitter, OnInit, OnDestroy, Input, ViewEncapsulation, Output, Inject, ElementRef, ViewChild, Renderer2, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PriceOption, PriceBreak, ProductDetails } from '../../../../models';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { EcommerceProductService } from '../../product/product.service';


const distinct = (value, index, self) => {
	return self.indexOf(value) === index;
}

@Component({
  selector: 'app-product-prices',
  templateUrl: './product-prices.component.html',
  styleUrls: ['./product-prices.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductPricesComponent implements OnInit, OnDestroy, OnChanges {

  pricesForm: FormGroup;

  @Input() priceOptions: PriceOption[] = [ new PriceOption() ];
  @Input() action = 'edit';
  @Input() sColor = '';
  @Input() product = new ProductDetails();

  @Output() add = new EventEmitter();
  @Output() priceBreaksChanged = new EventEmitter();
  @Output() save = new EventEmitter();
  
  onProductChanged: Subscription;

  colors = [];
  sPriceOption = new PriceOption();
  priceBreaks: any[] = [];
  priceBreakControls: FormArray;

  filteredColors: string[];

  listLimit = 100;

  @ViewChild('colorInput') colorInput: ElementRef;
  attributesValues: any;


  constructor(
    private productService: EcommerceProductService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private msg: MessageService,
    private render: Renderer2

  ) {
      this.onProductChanged =
        this.productService.onProductChanged
            .subscribe(product => {
              this.product = product;
              this.ngOnInit();
            });
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.priceOptions || changes.sColor) {
      this.ngOnInit();
    }
  }

  ngOnInit() {
    this.colors = [];
    if (this.product.ProductPartArray && this.product.ProductPartArray.ProductPart && this.product.ProductPartArray.ProductPart.length > 0){
      this.product.ProductPartArray.ProductPart.forEach(part => {
        const color = (part && (part.ColorArray && (part.ColorArray.Color && part.ColorArray.Color.colorName))) || '';
        this.colors.push(color);
      });
      this.colors = this.colors.filter((v, i, a) => a.indexOf(v) == i);
      this.colors = this.colors.sort();
    }

    if (this.colors.length < this.listLimit)
    {
      this.colors.splice(0,0,'+ Add New Color');
    }
    else{
      this.render.listen(this.colorInput.nativeElement, 'keyup', (event) => {
          this.filteredColors = this.colorInput.nativeElement.value === '' ? this.colors.slice() : this.filter(this.colorInput.nativeElement.value);
          this.filteredColors.splice(0,0,'+ Add New Color');
      });
    }

    // Need update for autocomplete
    if(this.sColor == "" || this.sColor == undefined || this.sColor == "No Color") {
        if (this.colors.length > 1) {
          this.sColor = this.colors[1];
        } else  {
          this.sColor = this.colors[0];
        }
    }

    if (this.priceOptions && this.priceOptions.length > 0 && this.action === 'edit')
      this.sPriceOption = this.priceOptions.find(priceOption => priceOption.color === this.sColor) || new PriceOption();
    else 
      this.sPriceOption = new PriceOption();

    this.initForm();

  }
  ngOnDestroy() {
    this.onProductChanged.unsubscribe();
  }
  
  initForm(){

    this.priceBreaks = this.sPriceOption.priceBreaks;
    const priceBreakForms =
      this.priceBreaks.map(prb =>
        this.fb.group({
          ...prb
        })
      );

    this.priceBreakControls = this.fb.array(priceBreakForms);

    this.pricesForm = this.fb.group({
      name: [this.sPriceOption.name, Validators.required],
      value: [this.sPriceOption.value, Validators.required],
      prCode: [this.sPriceOption.prCode],
      sColor: [this.sColor],
      partId: [this.sPriceOption.partId],
      min: [this.sPriceOption.min],
      max: [this.sPriceOption.max],
      saleStartDate: [this.sPriceOption.saleStartDate],
      saleEndDate: [this.sPriceOption.saleEndDate],
      priceType: [this.sPriceOption.priceType],
      sku: [{value: this.sPriceOption.sku, disabled: true},Validators.required],
      priceBreaks: this.priceBreakControls
    });

    this.priceBreakControls.valueChanges.subscribe((res) => {
      this.priceBreaksChanged.emit(res);
    });

  }

  switchColor(ev, value){
    if (ev) return;
    if (value === '+ Add New Color')
    {
      let dialogRef = this.dialog.open(ColorInputDialogComponent, {
        width: '250px',
        data: { colors: this.colors }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (!result)
        {
          this.sColor = this.colors[1];
          return;
        }
        if (this.colors.indexOf(result) > -1)
        {
          this.sColor = this.colors[1];
          this.msg.show('The color you put already exists. Please put another color','success');
        }  
        else 
        {
          this.sColor = result;
          this.colors.push(this.sColor);
          this.sPriceOption = this.priceOptions[0]; // For consistent standard prices, get first price option
          this.sPriceOption.partId = '';
          this.sPriceOption.color = this.sColor;

          this.initForm();
          this.handleSaveOption();
        }
      });
    }
    else {
      this.sColor = value;
      this.sPriceOption = this.priceOptions.find(priceOption => priceOption.color === this.sColor) || this.priceOptions[0]; // Temporary fix for new color price option
      this.initForm();
    }
  }

  addNewPbrForm() {
    const prb = new PriceBreak();
    this.priceBreakControls.push(this.fb.group(prb));
    this.priceBreaks.push(prb);
  }

  updateQty(ev, i) {
    this.priceBreaks[i].minQuantity = Number(ev.target.value);
  }

  updateSalesPrice(ev, i) {
    this.priceBreaks[i].updateSalesPrice(Number(ev.target.value));
    // On API we have condition checking for this margin, which then set the margin based on new salePrice and price
    this.priceBreaks[i].margin = 9999;
    this.updatePbrFormValues(i);
  }

  updateMargin(ev, i) {
    this.priceBreaks[i].updateMargin(Number(ev.target.value));
    this.updatePbrFormValues(i);
  }

  updateUnitCost(ev, i) {
    this.priceBreaks[i].updatePrice(Number(ev.target.value));
    this.updatePbrFormValues(i);
}

  updateUnitProfit(ev, i) {
    this.priceBreaks[i].updateProfit(Number(ev.target.value));
    this.updatePbrFormValues(i);
  }

  updatePbrFormValues(i) {
    const prbForms = this.pricesForm.controls['priceBreaks'] as FormArray;
    prbForms.at(i).setValue(this.priceBreaks[i]);
    this.handleSaveOption();
  }

  getTotalSalesPrice(i) {
    return this.priceBreaks[i].totalSalesPrice;
  }

  getTotalCost(i) {
    return this.priceBreaks[i].totalCost;
  }

  getTotalProfit(i) {
    return this.priceBreaks[i].totalProfit;
  }

  removePriceBreak(i) {
    const prbForms = this.pricesForm.controls['priceBreaks'] as FormArray;
    prbForms.removeAt(i);
    this.priceBreaks.splice(i, 1);
  }

  handleSaveOption() {

    if (this.pricesForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    if (this.sColor === '+ Add New Color')
    { 
      this.msg.show('Please Choose or add the color','success');     
      return;
    }
    const option = new PriceOption();
    option.priceBreaks = this.priceBreaks;

    const values = this.pricesForm.getRawValue();
    option.name = values.name;
    option.value = values.value;
    option.prCode = values.prCode;
    option.color = values.sColor;
    option.partId = values.partId;
    option.sku = values.sku;
    option.min = values.min;
    option.max = values.max;
    
    if (this.action === 'edit' && option.partId != '') {
      this.save.emit(option);
    } else {
      this.add.emit(option);
    }
  }

  filter(val: string): string[] {
    return this.colors.filter(color =>
      color.toLowerCase().includes(val.toLowerCase()));
  }

  getParts() {
    this.attributesValues['size'] = this.product.ProductPartArray.ProductPart.flatMap((part) => part.ApparelSize.labelSize).filter(distinct);
    this.attributesValues['color'] = this.product.ProductPartArray.ProductPart.flatMap((part) => part.ColorArray.Color.colorName).filter(distinct);
  }

}

@Component({
  selector: 'dialog-overview-example-dialog',
  template: `
  <div mat-dialog-content>
    <p>Please type the color name you want to add.</p>
    <mat-form-field>
        <input matInput tabindex="1" [(ngModel)]="data.colorName">
    </mat-form-field>
  </div>
  <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data.colorName" tabindex="2">Ok</button>
      <button mat-button (click)="onNoClick()" tabindex="-1">No Thanks</button>
  </div>
  `
})
export class ColorInputDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ColorInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
