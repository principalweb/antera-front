import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import * as htmlToPdfmake from 'html-to-pdfmake';
// import { pdfMake } from 'pdfmake/build/pdfmake';
// import { pdfFonts } from 'pdfmake/build/vfs_fonts';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}
@Component({
  selector: 'simple-quote-content-editor',
  templateUrl: './simple-quote-content-editor.component.html',
  styleUrls: ['./simple-quote-content-editor.component.scss']
})
export class SimpleQuoteContentEditorComponent implements OnInit {
  Editor = ClassicEditor;
  @ViewChild('editor') editor: ElementRef;
  form: FormGroup;
  loading: boolean;
  // TODO find out type of productsGroupByIds
  productsGroupByIds: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SimpleQuoteContentEditorComponent>,
    private fb: FormBuilder,
    private api: ApiService
  ) { 
  this.productsGroupByIds = groupBy(this.data.quotesAllProducts, 'id');
  }

  ngOnInit() {
    this.form = this.createForm();
  }

  get simpleQuoteContentArray(): FormArray {
    return this.form.get('simpleQuoteContent') as FormArray;
  }
  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close(false);
  }

  createForm() {
    const items = this.getApplicableItems();
    const simpleQuoteContentArray = this.fb.array(
      items.map((item) => this.fb.group({'id' : item.lineItemUpdateId, 'itemNo' : item.itemNo, 'productName' : item.productName, 'imageUrl' : item.quoteCustomImage[0] ? item.quoteCustomImage[0] : '', 'simpleQuoteProductHeading' : item.simpleQuoteProductHeading ? item.simpleQuoteProductHeading : item.productName, 'simpleQuoteProductDescription' : item.simpleQuoteProductDescription ? item.simpleQuoteProductDescription : this.getDefaultSimpleQuoteProductDescription(item)}))
    );
    const form = this.fb.group({
      simpleQuoteContent: simpleQuoteContentArray
    });

    return form;
  }
  

    getDefaultSimpleQuoteProductDescription(item){
        let product = this.productsGroupByIds[item.id];
        const attributes = this.uniqueSizesAndColors(product[0]);
        let showAttribSize = '';
        let showAttribColor = '';
        let showPriceBreak = this.priceBreakTable(item, product[0]);

        if (item.showAttribSize == '1' && attributes.sizes) {
            showAttribSize = `<tr><td style="width:150px;"><b>Sizes:</b></td><td style="width:510px;">${attributes.sizes.join(', ')}</td></tr>`;
        }
        if (item.showAttribColor == '1' && attributes.colors) {
            showAttribColor = `<tr><td style="width:150px;"><b>Colors:</b></td><td style="width:510px;">${attributes.colors.join(', ')}</td></tr>`;
        }
	let defaultSimpleQuoteProductDescription = `<table style="width:660px;"  align="left">
	  <tr>
	    <td colspan="2"><h1>${item.productName}</h1></td>
	  </tr>
	  <tr>
	    <td colspan="2"><p>${item.customerDescription}</p></td>
	  </tr>
	  <tr>
	    <td>Product Number</td>
	    <td style="width:100px;">${item.itemCode}</td>
	  </tr>
	  ${showAttribSize}
	  ${showAttribColor}
	</table><br>${showPriceBreak}`;
	return defaultSimpleQuoteProductDescription;
    }
    processSimpleQuoteProductDescription(simpleQuoteProductDescription){
        let defaultSimpleQuoteProductDescription = '';
        defaultSimpleQuoteProductDescription =  htmlToPdfmake( simpleQuoteProductDescription , {tableAutoSize:true});
        return defaultSimpleQuoteProductDescription;
    }
    uniqueSizesAndColors(product) {
        const sizes = [];
        const colors = [];
        let quantities = [];
        if(typeof product.ProductPartArray !=='undefined' && typeof product.ProductPartArray.ProductPart !=='undefined' ){
		product.ProductPartArray.ProductPart.forEach(part => {
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
        }

        return {
            sizes: sizes.filter(distinct),
            colors: colors.filter(distinct)
        };
    }
    getApplicableItems() {
        return this.data.order.lineItems
            .filter((item) => {
                return item.hideLine != '1' && item.lineType != '4' && item.lineType != '5';
            });
    }

    priceBreakTable(item, product) {
        let html = ``;
        if(typeof product.ProductPartArray !=='undefined' && typeof product.ProductPartArray.ProductPart !=='undefined' ){
		const parts = product.ProductPartArray.ProductPart;
		if (parts) {
		    product.minQtys = parts.reduce((qtys, part, index) => {
			const partPrice = part.partPrice.PartPriceArray.PartPrice;
			for (let i = 0; i < partPrice.length; i++) {
			    const key = +partPrice[i].minQuantity;
			    const qtyIndex = qtys.indexOf(key);
			    if (qtyIndex === -1) {
				qtys.push(key);
			    }
			}
			return qtys;
		    }, []);
		    product.minQtys.sort((a, b) => a - b);
		    product.priceTableArray = parts.reduce((rows, part, index) => {
			const partPrice = part.partPrice.PartPriceArray.PartPrice;

			for (let i = 0; i < partPrice.length; i++) {

			    if (item.modifiedPriceBreaks && item.modifiedPriceBreaks.priceBreaks) {
				const modified = item.modifiedPriceBreaks.priceBreaks[i];

				if (modified) {
				    partPrice[i].margin = modified.margin;
				    partPrice[i].price = modified.price;
				    partPrice[i].salePrice = modified.salePrice;
				}
			    }

			    const sizeIndex = rows.findIndex((row) => row.label === part.ApparelSize.labelSize);
			    if (sizeIndex === -1) {
				const row = { label: part.ApparelSize.labelSize };
				row[partPrice[i].minQuantity] = partPrice[i];
				rows.push(row);
			    } else {
				rows[sizeIndex][partPrice[i].minQuantity] = partPrice[i];
			    }
			}
			return rows;
		    }, []);
		    if (product.priceTableArray && product.priceTableArray.length) {
			product.priceTableColumns = [
			    'label',
			    ...product.minQtys
			];
		    }
		    html = `<b>Pricing</b><br><table style="width:660px;" align="left">`;

		    const tableData = product.priceTableArray.reduce((rows, row) => {
			const rowNode = [];
			html +='<tr>';
			product.priceTableColumns.forEach((column) => {
			    if (column === 'label') {
				rowNode.push({ text: ` ${row[column]} `, alignment: 'right' });
				html +=`<td style="width:150px;">${row[column]}</td>`;
			    } else {


				let priceValue = '';
				if (row[column] && row[column].salePrice) {
				    priceValue = row[column].salePrice;
				}

				rowNode.push({ text: priceValue });
				html +=`<td style="width:150px;">${priceValue}</td>`;
			    }
			});
			rows.push(rowNode);
			html +='</tr>';
			return rows;
		    }, []);

		    const node: any = {
			stack: [
			    { text: 'Pricing', bold: true },
			    {
				layout: 'order',
				table: {
				    widths: product.priceTableColumns.map((col, colIndex) => {
					return colIndex === 0 ? '*' : 'auto';
				    }),
				    headerRows: 1,
				    body: [
					product.priceTableColumns.map((col) => {
					    if (col === 'label') {
						return { text: '', style: 'tableHeader' };
					    }
					    return { text: col, style: 'tableHeader' };
					}),
					...tableData
				    ],
				},
				margin: [0, 0, 0, 16],
				alignment: 'center'
			    }
			]
		    };
		    //return node;
		    html += `</table>`;
		}
        }
        return html;
    }

}
