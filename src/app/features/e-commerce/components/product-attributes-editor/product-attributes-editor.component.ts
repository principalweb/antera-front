import { GlobalConfigService } from './../../../../core/services/global.service';
import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'app/core/services/api.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs/internal/Subject';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatChipInputEvent } from '@angular/material/chips';
import { takeUntil } from 'rxjs/operators';
import { Validators, FormArray } from '@angular/forms';
import { UpdateSkuDialogComponent } from '../product-variation-editor/update-sku-dialog/update-sku-dialog.component';
import { ProductDetails } from 'app/models';

const distinct = (value, index, self) => {
  return self.indexOf(value) === index;
};
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
@Component({
  selector: 'product-attributes-editor',
  templateUrl: './product-attributes-editor.component.html',
  styleUrls: ['./product-attributes-editor.component.css']
})
export class ProductAttributesEditorComponent implements OnInit {

  @Input() product = new ProductDetails();
  @Input() priceTable: any;
  @Output() save = new EventEmitter();
  @Input() showPriceBreakOnly = false;

  public editAttributes: boolean;
  attributeForm: FormGroup;
  filterForm: FormGroup;
  sizes: any[] = [];
  colors: any[] = [];
  quantities: any[] = [];
  filteredSkus: any[] = [];
  showInactive = false;

  selection = new SelectionModel<any>(true, []);

  private destroyed$ = new Subject();
  config: any;
  decimalConfig: string;

  currencyList = [];
  currencyDisp = true;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private api: ApiService,
    public globalConfig: GlobalConfigService,
  ) { }

  ngOnInit() {
    this.setupFilters();

    this.decimalConfig = '1.2-' + this.globalConfig.config.sysconfigOrderFormCostDecimalUpto;

    this.api.getAdvanceSystemConfigAll({ module: 'Orders' }).subscribe((config: any) => {
      this.config = config.settings;
    });
    this.api.getCurrencyListForDropDownDOnly().subscribe((data: any) => {
      this.currencyList = [];
      if (data){
        data.forEach(item => {
          this.currencyList.push({code: item.code, symbol: item.symbol});
        });
      }

      if (this.currencyList.length == 0) {
        this.currencyList.push({code: 'USD', symbol: '$'});
        this.currencyList.push({code: 'CAD', symbol: '$'});
      }
    });
    const productsModuleFieldParams =
        {
            offset: 0,
            limit: 200,
            order: 'module',
            orient: 'asc',
            term: { module : 'Products', fieldName : 'productCurrency' }
        };
    this.api.getFieldsList(productsModuleFieldParams)
            .subscribe((res: any[]) => {
               console.log('res', res);
              if (res[0].isVisible === '0') {
                this.currencyDisp = false;
              } else {
                this.currencyDisp = true;
              }
              
            }, () => {this.currencyDisp = true; });

     
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.generateUsedAttributes();
    this.attributeForm = this.createAttributeForm();
    this.filterSkus();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  saveAttributes() {
    const chips = this.attributeForm.value;

    const removedColors = this.colors.filter((x) => !chips.colors.map(chip => chip.value).includes(x));
    const removedSizes = this.sizes.filter((x) => !chips.sizes.map(chip => chip.value).includes(x));
    const removedQuantities = this.quantities.filter((x) => !chips.quantities.map(chip => chip.value).includes(x));

    let parts = [...this.product.ProductPartArray.ProductPart];
    if (parts){
    if (removedColors){
    removedColors.forEach((color) => {
      parts = parts.filter(part => part.ColorArray.Color.colorName !== color);
    });
    }
    if (removedSizes){
      removedSizes.forEach((size) => {
        parts = parts.filter(part => part.ApparelSize.labelSize !== size);
      }); 
    }

    if (removedQuantities){
    removedQuantities.forEach((qty) => {
      parts = parts.map(part => {
        part.partPrice.PartPriceArray.PartPrice = part.partPrice.PartPriceArray.PartPrice.filter((partPrice) => {
          return partPrice.minQuantity != qty;
        });
        return part;
      });
    });
  }

    const priceBreaks = [];
    const defaultMargin = this.config ? this.config.productsMargin : 40;
    if (chips){
    chips.quantities.forEach(quantity => {
      priceBreaks.push(
        {
          'minQuantity': quantity.value,
          'price': '0',
          'salePrice': '0',
          'margin': defaultMargin,
          'unitProfit': 0,
          'totalPrice': 0,
          'totalSalesPrice': 0,
          'totalProfit': 0
        }
      );
    });

    chips.sizes.forEach((size) => {

      chips.colors.forEach((color) => {

        const matchingPart = parts.find((_part) => _part.ApparelSize.labelSize == size.value && _part.ColorArray.Color.colorName == color.value);

        if (matchingPart) {
          priceBreaks.forEach((_break) => {
            const match = matchingPart.partPrice.PartPriceArray.PartPrice.find(partPrice => {
              return partPrice.minQuantity == _break.minQuantity;
            });
            if (!match) {
              matchingPart.partPrice.PartPriceArray.PartPrice.push(_break);
            }
          });

        } else {
          const newPart = {
            partId: '',
            ColorArray: { Color: { colorName: color.value } },
            ApparelSize: { labelSize: size.value },
            partPrice: {
              PartPriceArray: {
                PartPrice: priceBreaks
              }
            }
          };
          parts.push(newPart);
        }

      });
    });
  }
    this.product.showSize = this.attributeForm.value.showSize;
    this.product.showColor = this.attributeForm.value.showColor;
    this.product.orderMinPricebreak = this.attributeForm.value.orderMinPricebreak;
    this.save.emit(parts);
    this.quantities = [];
    this.generateUsedAttributes();
    this.editAttributes = false;
  }
  }
  createAttributeForm() {
    const form = this.fb.group({
      orderMinPricebreak: [this.product.orderMinPricebreak || false],
      showColor: [this.product.showColor || false],
      showSize: [this.product.showSize || false],
      quantities: this.fb.array([], Validators.required),
      colors: this.fb.array([], Validators.required),
      sizes: this.fb.array([], Validators.required)
    });

    const quantityFormArray = form.get('quantities') as FormArray;
    if (this.quantities){
    this.quantities.forEach((quantity) => {
      quantityFormArray.push(this.fb.group({
        _saved: true,
        value: quantity.trim(),
      }));
    });
  }
    const colorsFormArray = form.get('colors') as FormArray;
    if (this.colors){
    this.colors.forEach((color) => {
      colorsFormArray.push(this.fb.group({
        _saved: true,
        value: color.trim(),
      }));
    });
  }
    const sizesFormArray = form.get('sizes') as FormArray;
    if (this.sizes){
    this.sizes.forEach((size) => {
      sizesFormArray.push(this.fb.group({
        _saved: true,
        value: size.trim()
      }));
    });
  }
    return form;

  }

  generateUsedAttributes() {
    const sizes = [];
    const colors = [];
    let quantities = [];
    if (this.product && this.product.ProductPartArray && this.product.ProductPartArray.ProductPart){
    this.product.ProductPartArray.ProductPart.forEach(part => {
      const size = part.ApparelSize.labelSize;
      sizes.push(size);

      const color = part.ColorArray.Color.colorName;
      colors.push(color);

      const _quantities = part.partPrice.PartPriceArray.PartPrice
        .flatMap(price => price.minQuantity);

      quantities = [...quantities, ..._quantities];
    });
  }

    this.sizes = sizes.filter(distinct);
    this.colors = colors.filter(distinct);
    this.quantities = quantities.filter(distinct);

  }

  removeSize() {

  }

  private setupFilters() {
    this.filterForm = this.createFilterForm();
    this.filterSkus();
    this.filterForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((filters) => {
      this.filterSkus();
    });
  }

  createFilterForm() {
    return this.fb.group({
      sku: [''],
      colors: [],
      sizes: [],
    });
  }
  private filterSkus() {
    if (!this.filterForm) {
      return;
    }
    const filters = this.filterForm.value;
    filters.sku = escapeRegExp(filters.sku);

    if (this.product && this.product.ProductPartArray && this.product.ProductPartArray.ProductPart){

    this.filteredSkus = this.product.ProductPartArray.ProductPart.filter((part) => {

      this.selection.clear();

      if (filters.sku && filters.sku != part.sku) {
        const match = part.sku.match(new RegExp(filters.sku, 'i'));
        if (!match) {
          return false;
        }
      }
      if (filters.colors && filters.colors.length) {

        const match = filters.colors
          .some((color) => part.ColorArray.Color.colorName == color);
        if (!match) {
          return false;
        }
      }
      if (filters.sizes && filters.sizes.length) {
        const match = filters.sizes
          .some((size) => part.ApparelSize.labelSize == size);
        if (!match) {
          return false;
        }
      }
      if (!part.active && !this.showInactive) {
        return false;
      }
      return true;
    });
  }
}

  addSizeFilter(event: MatChipInputEvent, form: FormGroup): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      const control = <FormArray>form.get('sizes');
      control.push(
        this.fb.group({
          _saved: false,
          value: value.trim()
        })
      );
    }

    if (input) {
      input.value = '';
    }
  }

  removeSizeFilter(form, index) {
    form.get('sizes').removeAt(index);
  }

  addQuantityAttribute(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      const quantities = this.attributeForm.get('quantities') as FormArray;
      quantities.push(this.fb.group({
        _saved: false,
        value: value.trim(),
      }));
    }

    if (input) {
      input.value = '';
    }
  }
  removeQuantityAttribute(event, index): void {
    const quantities = this.attributeForm.get('quantities') as FormArray;

    if (index >= 0) {
      quantities.removeAt(index);
    }
  }

  addColorAttribute(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      const colors = this.attributeForm.get('colors') as FormArray;
      colors.push(this.fb.group({
        _saved: false,
        value: value.trim()
      }));
    }

    if (input) {
      input.value = '';
    }
  }

  removeColorAttribute(color, index) {
    const colors = this.attributeForm.get('colors') as FormArray;

    if (index >= 0) {
      colors.removeAt(index);
    }
  }

  addSizeAttribute(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      const sizes = this.attributeForm.get('sizes') as FormArray;
      sizes.push(this.fb.group({
        _saved: false,
        value: value.trim()
      }));
    }

    if (input) {
      input.value = '';
    }
  }

  removeSizeAttribute(size, index) {
    const sizes = this.attributeForm.get('sizes') as FormArray;

    if (index >= 0) {
      sizes.removeAt(index);
    }
  }

  updateSku(sku) {
    this.selection.clear();
    this.selection.select(sku);
    const dialogRef = this.dialog.open(UpdateSkuDialogComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        selection: this.selection.selected,
        quantities: this.quantities,
        config: this.config,
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      this.updateModifiedSkus(res);
    });
  }

  activateSkus() {
    const selected = this.selection.selected;
    this.selection.clear();
    selected.forEach(s => {
      const pf = this.product.ProductPartArray.ProductPart.find(p => p.sku == s.sku);
      if (pf) {
        pf.active = true;
      }
    });
    
  }

  deactivateSkus() {
    const selected = this.selection.selected;
    this.selection.clear();
    selected.forEach(s => {
      const pf = this.product.ProductPartArray.ProductPart.find(p => p.sku == s.sku);
      if (pf) {
        pf.active = false;
      }
    });
  }

  updateSelectedSkus(sku) {
    const dialogRef = this.dialog.open(UpdateSkuDialogComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        selection: this.selection.selected,
        quantities: this.quantities,
      },
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.updateModifiedSkus(res);
    });
  }

  updateModifiedSkus(res) {
    if (!res) {
      return;
    }
    let parts = [...this.product.ProductPartArray.ProductPart];
    if (!parts){
      return;
    }
    parts = parts.map((part) => {
      const isSelected = this.selection.isSelected(part);

      if (isSelected) {
        const priceBreaks = [...part.partPrice.PartPriceArray.PartPrice];

        res.partPrice.forEach((updatedPriceBreak) => {
          const matchingPrice = priceBreaks.find((price) => price.minQuantity == updatedPriceBreak.minQuantity);
          if (!matchingPrice) {
            const newPrice = {
              'minQuantity': updatedPriceBreak.minQuantity,
              'price': updatedPriceBreak.price,
              'salePrice': updatedPriceBreak.salePrice,
              'margin': updatedPriceBreak.margin,
              'unitProfit': updatedPriceBreak.unitProfit,
              'totalPrice': updatedPriceBreak.totalPrice,
              'totalSalesPrice': updatedPriceBreak.totalSalesPrice,
              'totalProfit': updatedPriceBreak.totalProfit
            };
            priceBreaks.push(newPrice);
          } else {
            matchingPrice.minQuantity = updatedPriceBreak.minQuantity;
            matchingPrice.price = updatedPriceBreak.price;
            matchingPrice.salePrice = updatedPriceBreak.salePrice;
            matchingPrice.margin = updatedPriceBreak.margin;
            matchingPrice.unitProfit = updatedPriceBreak.unitProfit;
            matchingPrice.totalPrice = updatedPriceBreak.totalPrice;
            matchingPrice.totalSalesPrice = updatedPriceBreak.totalSalesPrice;
            matchingPrice.totalProfit = updatedPriceBreak.totalProfit;
          }
        });

        part = {
          ...part,
          min: res.min,
          max: res.max,
          prCode: res.prCode,
          priceType: res.priceType,
          saleStartDate: res.saleStartDate,
          saleEndDate: res.saleEndDate,
          partPrice: {
            PartPriceArray: {
              PartPrice: priceBreaks
            }
          },
        };
      }
      return part;
    });

    this.save.emit(parts);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.filteredSkus.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.filteredSkus.forEach(row => this.selection.select(row));
  }

  onMatChipKeyPress(event) {
    event.stopImmediatePropagation();
  }


}
