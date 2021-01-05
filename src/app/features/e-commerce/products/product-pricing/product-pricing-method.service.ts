import { Injectable } from '@angular/core';
import { ApiService } from 'app/core/services/api.service';
import { EcommerceProductService } from '../../product/product.service';

@Injectable({
  providedIn: 'root'
})
export class ProductPricingMethodService {

  constructor(
    private api: ApiService,
    private ecommerceProductService: EcommerceProductService
    ) { }

getProductPricingDetails(productLevelId){
  const id = this.getProductIdFromRoute();
  
  return this.api.post('/content/get-product-addon-pricing-by-method-id', { 'productId': id, 'pricingMethodId': productLevelId});
}

getPricingLevels(){
  const id = this.getProductIdFromRoute();
  return this.api.post('/content/get-product-addon-pricing', { 'productId': id});
}

createPricingMethods(productLevelId, addonPricing){
  const id = this.getProductIdFromRoute();
  return this.api.post('/content/save-product-addon-pricing-by-method-id', { 'productId': id, 'pricingMethodId': productLevelId, addonPricing: addonPricing});
}

resetPricingMethodCalculation(productLevelId){
  const id = this.getProductIdFromRoute();
  
  return this.api.post('/content/get-product-addon-pricing-by-method-id', { 'productId': id, 'pricingMethodId': productLevelId, reset: '1'});
}

updatePricingMethods(product){
  const id = this.getProductIdFromRoute();
  console.log('product to send ', product);
  return this.api.post('/content/save-product-addon-pricing-by-method-id', product );
}

getProductDetails() {
  const id = this.getProductIdFromRoute();
  return this.api.post('/content/get-product', { id });
}

reloadUpdatePricingMethods(productLevelId){
  const id = this.getProductIdFromRoute();
  return this.api.post('/content/get-product-addon-pricing-by-method-id', { 'productId': id, 'pricingMethodId': productLevelId} );
}

deletePricingMethods(productLevelId){
  const id = this.getProductIdFromRoute();
  return this.api.post('/content/remove-product-addon-pricing-by-method-id', { 'productId': id, 'pricingMethodId': productLevelId});
}

deletePricingLevelMethods(productLevelId){
const payload = {'ids': [productLevelId]};
  return this.api.post('/content/delete-pricing-methods', payload);
}

  private getProductIdFromRoute() {
    const route = this.ecommerceProductService.getCurrentRoute();
    const id = route && route.params !== undefined ? route.params.id : '';
    return id;
  }

createPricingMethodsWithPercentage(pricingMethod){
  return this.api.post('/content/create-pricing-methods', pricingMethod);
}

getPricingMethodList(){
  const payload = {
    offset: 0,
    order: 'name',
    orient: 'asc',
    term: {},
  };

  try {
    return this.api.post('/content/get-pricing-methods-list', payload);
  } catch (error) {
    console.log('error ', error);
  }
}

updatePricingMethodList(pricingMethod){
  // update-pricing-methods 
  try {
    return this.api.post('/content/update-pricing-methods', pricingMethod);
  } catch (error) {
    console.log('error ', error);
  }
}

}
