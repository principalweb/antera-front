import { Component, OnInit, Input, OnChanges, SimpleChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subject ,  forkJoin } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { SelectionService } from 'app/core/services/selection.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { UpdateSkuDialogComponent } from './update-sku-dialog/update-sku-dialog.component';
import { ApiService } from 'app/core/services/api.service';
import { GlobalConfigService } from 'app/core/services/global.service';

const distinct = (value, index, self) => {
  return self.indexOf(value) === index;
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
@Component({
  selector: 'app-product-variation-editor',
  templateUrl: './product-variation-editor.component.html',
  styleUrls: ['./product-variation-editor.component.scss'],
  providers: [
    SelectionService,
  ]
})
export class ProductVariationEditorComponent implements OnInit, OnChanges, OnDestroy {

  @Input() product: any;
  @Input() priceTable: any;

  @Output() save = new EventEmitter();

  public editAttributes: boolean;
  attributeForm: FormGroup;
  filterForm: FormGroup;
  sizes: any[];
  colors: any[];
  quantities: any[];
  filteredSkus: any[];
  showInactive: boolean = false;

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
      data.forEach(item => {
        this.currencyList.push({code: item.code, symbol: item.symbol});
      });
      if(this.currencyList.length == 0) {
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
            term: { module : 'Products',fieldName : 'productCurrency' }
        }
    this.api.getFieldsList(productsModuleFieldParams)
            .subscribe((res: any[])=> {
               console.log("res",res)
              if(res[0].isVisible === "0") {
                this.currencyDisp = false;
              } else {
                this.currencyDisp = true;
              }
              
            },() => {this.currencyDisp = true;});

     
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
    // Save attribute changes
    const chips = this.attributeForm.value;

    let removedColors = this.colors.filter((x) => !chips.colors.map(chip => chip.value).includes(x));
    let removedSizes = this.sizes.filter((x) => !chips.sizes.map(chip => chip.value).includes(x));
    let removedQuantities = this.quantities.filter((x) => !chips.quantities.map(chip => chip.value).includes(x));

    let parts = [...this.product.ProductPartArray.ProductPart];

    // If a color is removed filter out all sku's of that color
    removedColors.forEach((color) => {
      parts = parts.filter(part => part.ColorArray.Color.colorName !== color);
    });

    // If a size is removed filter out all sku's of that size
    removedSizes.forEach((size) => {
      parts = parts.filter(part => part.ApparelSize.labelSize !== size);
    });

    // If a quantity is removed filter out all
    removedQuantities.forEach((qty) => {
      parts = parts.map(part => {
        // Filter out matching price break quantities
        part.partPrice.PartPriceArray.PartPrice = part.partPrice.PartPriceArray.PartPrice.filter((partPrice) => {
          return partPrice.minQuantity != qty;
        });
        return part;
      });
    });

    // Add new parts for each size, and color
    const priceBreaks = [];
    let defaultMargin = this.config ? this.config.productsMargin : 40;
    chips.quantities.forEach(quantity => {
      priceBreaks.push(
        {
          'minQuantity': quantity.value,
          'price': '0',
          'salePrice': '0',
          'margin': defaultMargin, // Use default margin
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
          // Filter out matching price break quantities
          priceBreaks.forEach((_break) => {
            const match = matchingPart.partPrice.PartPriceArray.PartPrice.find(partPrice => {
              return partPrice.minQuantity == _break.minQuantity;
            });
            if (!match) {
              matchingPart.partPrice.PartPriceArray.PartPrice.push(_break);
            }
          });

        } else {
          // Create new part with quantities
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
    this.product.showSize = this.attributeForm.value.showSize;
    this.product.showColor = this.attributeForm.value.showColor;
    this.product.orderMinPricebreak = this.attributeForm.value.orderMinPricebreak;
    this.save.emit(parts);
    this.editAttributes = false;
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

    // Hydrate form
    const quantityFormArray = form.get('quantities') as FormArray;
    this.quantities.forEach((quantity) => {
      quantityFormArray.push(this.fb.group({
        _saved: true,
        value: quantity.trim(),
      }));
    });

    const colorsFormArray = form.get('colors') as FormArray;
    this.colors.forEach((color) => {
      colorsFormArray.push(this.fb.group({
        _saved: true,
        value: color.trim(),
      }));
    });

    const sizesFormArray = form.get('sizes') as FormArray;
    this.sizes.forEach((size) => {
      sizesFormArray.push(this.fb.group({
        _saved: true,
        value: size.trim()
      }));
    });

    return form;

  }

  generateUsedAttributes() {
    const sizes = [];
    const colors = [];
    let quantities = [];

    this.product.ProductPartArray.ProductPart.forEach(part => {
      // Group price options by sizes
      const size = part.ApparelSize.labelSize;
      sizes.push(size);

      // Update form
      const color = part.ColorArray.Color.colorName;
      colors.push(color);

      const _quantities = part.partPrice.PartPriceArray.PartPrice
        .flatMap(price => price.minQuantity);

      quantities = [...quantities, ..._quantities];
    });


    this.sizes = sizes.filter(distinct);
    this.colors = colors.filter(distinct);
    this.quantities = quantities.filter(distinct);

  }

  removeSize() {

  }

  // Filters
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

    this.filteredSkus = this.product.ProductPartArray.ProductPart.filter((part) => {

      // Clear selection
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

  addSizeFilter(event: MatChipInputEvent, form: FormGroup): void {
    const input = event.input;
    const value = event.value;

    // Add size
    if ((value || '').trim()) {
      const control = <FormArray>form.get('sizes');
      control.push(
        this.fb.group({
          _saved: false,
          value: value.trim()
        })
      );
    }

    // Reset the input value
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
    // Add our requirement
    if ((value || '').trim()) {
      const quantities = this.attributeForm.get('quantities') as FormArray;
      quantities.push(this.fb.group({
        _saved: false,
        value: value.trim(),
      }));
    }

    // Reset the input value
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
    // Add our requirement
    if ((value || '').trim()) {
      const colors = this.attributeForm.get('colors') as FormArray;
      colors.push(this.fb.group({
        _saved: false,
        value: value.trim()
      }));
    }

    // Reset the input value
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

    // Add our requirement
    if ((value || '').trim()) {
      const sizes = this.attributeForm.get('sizes') as FormArray;
      sizes.push(this.fb.group({
        _saved: false,
        value: value.trim()
      }));
    }

    // Reset the input value
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
    let selected = this.selection.selected;
    this.selection.clear();
    selected.forEach(s => {
      let pf = this.product.ProductPartArray.ProductPart.find(p => p.sku == s.sku);
      if (pf) {
        pf.active = true;
      }
    });
  }

  deactivateSkus() {
    let selected = this.selection.selected;
    this.selection.clear();
    selected.forEach(s => {
      let pf = this.product.ProductPartArray.ProductPart.find(p => p.sku == s.sku);
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
              'margin': updatedPriceBreak.margin, // Use default margin
              'unitProfit': updatedPriceBreak.unitProfit,
              'totalPrice': updatedPriceBreak.totalPrice,
              'totalSalesPrice': updatedPriceBreak.totalSalesPrice,
              'totalProfit': updatedPriceBreak.totalProfit
            }
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

  // Selection
  // Whether the number of selected elements matches the total number of rows.
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.filteredSkus.length;
    return numSelected === numRows;
  }

  // Selects all rows if they are not all selected; otherwise clear selection.
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.filteredSkus.forEach(row => this.selection.select(row));
  }

  // Allow keyboard on input inside mat-chip
  onMatChipKeyPress(event) {
    event.stopImmediatePropagation();
  }


}
