import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';

import { ApiService } from 'app/core/services/api.service';
import { EcommerceProductService } from '../../product/product.service';
import { ProductDetails } from '../../../../models';

@Component({
  selector: 'app-product-supplier-description',
  templateUrl: './product-supplier-description.component.html',
  styleUrls: ['./product-supplier-description.component.scss']
})
export class ProductSupplierDescriptionComponent implements OnInit {
    @Input() product = new ProductDetails();
    @Input() form: FormGroup
    @Input() descriptions: any[] 

    constructor() { }

    ngOnInit() {
    }

}
