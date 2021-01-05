import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { AuthService } from 'app/core/services/auth.service';

import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AnteraMeta, AnteraSort } from 'app/models';
import { RestParams } from 'app/models/rest-params';
import { POFilters } from "app/features/e-commerce/purchase-orders/state/purchase-orders.state";
import { PNFilters, PNPFilters } from "app/features/e-commerce/purchase-orders/state/purchase-needs.state";
import { IFilters } from 'app/features/e-commerce/ar-invoice/state/invoices.state';
import { InvoiceFilters, LineItemFilters } from 'app/features/e-commerce/ar-invoice/state/pendingInvoices.state';
import { CurrencyItem } from 'app/features/admin/currency/interface/interface';
import { SummaryInvoicePayload } from 'app/features/e-commerce/ar-invoice/interface/interface';
import { environment } from 'environments/environment';
@Injectable()
export class ApiService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  get(url, params = {}) {
      return this.http.get(`${environment.baseUrl}${url}`, params).pipe(
      map(resp => {
        if (!resp && resp[0] && resp[0].status === 'error') {
          alert(resp[0].msg);
        }

        return resp;
      })
    );
  }

  post(url, data, httpOptions = {}) {
      return this.http.post(`${environment.baseUrl}${url}`, data, httpOptions).pipe(
      map(resp => {
        if (resp && resp[0] && resp[0].status === 'error') {
          alert(resp[0].msg);
        }

        return resp;
      }));
  }

  put(url, data, httpOptions = {}) {
      return this.http.put(`${environment.baseUrl}${url}`, data, httpOptions).pipe(
      map(resp => {
        if (resp && resp[0] && resp[0].status === 'error') {
          alert(resp[0].msg);
        }

        return resp;
      }));
  }

  delete(url, data, httpOptions = {}) {
      return this.http.delete(`${environment.baseUrl}${url}`, data).pipe(
      map(resp => {
        if (resp && resp[0] && resp[0].status === 'error') {
          alert(resp[0].msg);
        }

        return resp;
      }));
  }

  postWithHeader(url, data, header) {
      return this.http.post(`${environment.baseUrl}${url}`, data, header).pipe(
      map(resp => {
        if (resp && resp[0] && resp[0].status === 'error') {
          alert(resp[0].msg);
        }

        return resp;
      })
    );
  }

  getFileFromUrl(url) {
    return this.http.get(url, { responseType: 'arraybuffer' }).pipe(
      map(resp => {
        return resp;
      })
    );
  }

  createListParams(filter, meta: AnteraMeta, sort: AnteraSort) {
    let params:  HttpParams = new HttpParams();
    // the concept is to add an 'operator' object to filter if any comparison other than like is required
    // any operator available from yii2 rest api can be utilized here
    // tslint:disable-next-line: forin
    for (const p in filter.terms) {
      if (filter.operator && filter.operator[p]) {
        switch (filter.operator[p]) {
          case '=':
          default:
            params = params.set('filter[' + p + ']', filter.terms[p]);
            break;
          case 'like':
            params = params.set('filter[' + p + ']' + '[like]', filter.terms[p]);
            break;
        }
      } else {
        params = params.set('filter[' + p + ']' + '[like]', filter.terms[p]);
      }
    }
    // tslint:disable-next-line: forin
    params = params.set('currentPage', (meta.currentPage + 1).toString());
    params = params.set('perPage', meta.perPage.toString());
    if (sort.orient === 'asc') {
      params = params.set('sort', sort.order);
    } else {
      params = params.set('sort', '-' + sort.order);
    }
    return { params };
  }
  // create a list of params for non modified yii2 rest controller
  createQueryString(filter, restParams: RestParams) {
    let params:  HttpParams = new HttpParams();
    // the concept is to add an 'operator' object to filter if any comparison other than like is required
    // any operator available from yii2 rest api can be utilized here
    // tslint:disable-next-line: forin
    for (const p in filter.terms) {
      if (filter.operator && filter.operator[p] && filter.terms[p].length > 0) {
        switch (filter.operator[p]) {
          case '=':
          default:
            params = params.set('filter[' + p + ']', filter.terms[p]);
            break;
          case 'like':
            params = params.set('filter[' + p + ']' + '[like]', filter.terms[p]);
            break;
        }
      } else if (filter.terms[p].length > 0) {
        params = params.set('filter[' + p + ']' + '[like]', filter.terms[p]);
      }
    }
    // tslint:disable-next-line: forin
    params = params.set('page', restParams.page.toString());
    params = params.set('per-page', restParams.perPage.toString());
    if (restParams.orient === 'asc') {
      params = params.set('sort', restParams.order);
    } else {
      params = params.set('sort', '-' + restParams.order);
    }
    return { params };
  }


  createDeleteParams(id: string[]) {
    let params:  HttpParams = new HttpParams();
    id.forEach((v, i) => {
      params = params.set('id[' + i + ']', v);
    });
    return { params };
  }

  // Account APIs

  createAccount(account) {
    const req = {
      data: account,
      permUserId: this.authService.getCurrentUser().userId
    };

    return this.post('/content/create-account', req);
  }


  processYtdDetails(id) {
    return this.post('/content/process-ytd-details', { id });
  }

  getAccountDetails(id) {
    return this.post('/content/get-account-details', { id });
  }

  getCategoryCount(){
    return this.get('/content/get-category-count');
  }

  updateAccountsRanking() {
    return this.get('/content/update-accounts-ranking');
  }

  getAccountAwsFilesLocation(id) {
    const data = {
      accountId: id,
    };
    return this.post('/content/get-account-aws-files-location', data).toPromise();
  }

  getAwsFilesByTag(payload: { accountId: string, folderType: string, designNumber: string, tags: string[] }) {
    return this.post('/content/get-files-by-tag', payload);
  }

  getAwsFiles(path, offset, limit, isRoot = '0') {
    const data = {
      path: path,
      offset: offset,
      limit: limit,
      isRoot: isRoot,
    };
    return this.post('/content/list-file-manager', data).toPromise();
  }

  getAccountEmail(id) {
    return this.post('/content/get-account-email', { id });
  }

  qboCleanEntity(entity, id, relatedId = ''){
      return this.post('/content/qbo-clean-entity', {entity:entity, id:id, relatedId:relatedId});
  }

  getPoEmails(orderId, vendorId, tagName) {
    return this.post('/content/get-po-emails', { orderId: orderId, vendorId: vendorId, tagName: tagName });
  }
  getTaggedEmails(orderId, tagName) {
    return this.post('/content/get-tagged-emails', { orderId: orderId, tagName: tagName });
  }
  getRelatedAccounts(params) {
    return this.post('/content/get-related-accounts', params);
  }

  updatePortalAccess(data: { accountId: string, contactId: string, portalAccessLevel: string, portalAllowedStatus: string[], displayWithOthers: string }){
    return this.post(`/content/update-portal-level-access`, data);
  }

  getRelatedAccountsCount(params) {
    return this.post('/content/get-related-accounts-count', params);
  }

  deleteAccounts(ids) {
    return this.post('/content/delete-account', { id: ids, permUserId: this.authService.getCurrentUser().userId });
  }

  linkAccountContact(accId, contactId) {
    return this.post('/content/add-account-contact-relationship', {
      contactId: contactId,
      accountId: accId
    });
  }

  removeLinkAccountContact(accId, contactId) {
    return this.post('/content/remove-account-contact-relationship', {
      contactId: contactId,
      accountId: accId
    });
  }

  getLocationsForAccount(accountId) {
    return this.post('/content/get-locations-for-account', { accountId });
  }

  // Contact APIs

  getContactDetails(id) {
    return this.post('/content/get-contact-details', { id });
  }

  getRelatedContacts(params) {
    return this.post('/content/get-related-contacts', params);
  }

  getRelatedContactsCount(params) {
    return this.post('/content/get-related-contacts-count', params);
  }

  deleteContacts(ids) {
    return this.post('/content/delete-contact', { id: ids, permUserId: this.authService.getCurrentUser().userId });
  }

  checkContactEmail(email) {
    return this.post('/content/check-contact-email', { email: email, permUserId: this.authService.getCurrentUser().userId });
  }

  // Order APIs

  createOrder(order) {
   order.permUserId = this.authService.getCurrentUser().userId;
    order.permUserName = this.authService.getCurrentUser().userName;
    return this.post('/content/create-quote-order', order);
  }

  updateOrder(order) {
    const neworder = Object.assign({permUserId: this.authService.getCurrentUser().userId,   permUserName: this.authService.getCurrentUser().userName}, order);
     //return

    return this.post('/content/update-quote-order', neworder);
  }

  cancelOrders(ids) {
    return this.post('/content/cancel-orders', { ids: ids, permUserId: this.authService.getCurrentUser().userId });
  }

  getOrderDetails(id) {
    return this.post('/content/get-quote-order-details/', { id });
  }

  getOrderDetailsPerDocType(data) {
    return this.post('/content/get-quote-order-details/', data);
  }

  deleteOrders(ids) {
    return this.post('/content/delete-order', { id: ids, permUserId: this.authService.getCurrentUser().userId });
  }

  copyQuoteOrder(data) {
    data.permUserId = this.authService.getCurrentUser().userId;
    return this.post('/content/copy-quote-order', data);
  }

  updateEmailSentStatus(id, docType) {
    return this.post('/content/update-email-sent-status', { id: id, docType: docType });
  }

  getReadyToBill(orderIds) {
    return this.post('/content/get-ready-to-bill', { orderIds });
  }

  cleanOrderWorkflow(id) {
    return this.post('/content/clean-order-workflow/', { id });
  }

  mergeOrders(orderIds) {
    return this.post('/content/merge-quote-order', { orderIds });
  }

  initMergeQuoteOrderInBatch(orderIds) {
    return this.post('/content/init-merge-quote-order-in-batch', { orderIds });
  }

  processMergeQuoteOrderInBatch(baseOrderId, orderIds) {
    return this.post('/content/process-merge-quote-order-in-batch', { baseOrderId: baseOrderId, orderIds : orderIds });
  }

  convertQuote(id) {
    return this.post('/content/convert-quote', { id: id });
  }

  getStatuses(module) {
    return this.post('/content/get-statuses', { module: module });
  }

  // Product APIs

  getProductList(terms, offset = 0, limit = 10) {
    const data = {
      offset,
      limit,
      term: terms,
      permUserId: this.authService.getCurrentUser().userId
    };

    return this.post('/content/get-product-list', data);
  }

  productSearch(query: string, offset = 0, limit = 10) {
    const payload = {
      offset,
      limit,
      terms: [],
      search: query,
      permUserId: this.authService.getCurrentUser().userId
    };

    return this.post('/content/get-product-list', payload).pipe(catchError(error => of([])));
  }

  getProductDetails(id) {
    return this.post('/content/get-product', { id });
  }

  getProductDetailsCurrency(id){
    return this.post("/content/get-product-currency-converted", { id })
  }

  getProductLogoDetails(id) {
    return this.post('/content/get-product-logo-details', { productId: id });
  }

  setProductLogoDetails(id, logoDetails) {
    return this.post('/content/set-product-logo-details', { productId: id, logoInfo: logoDetails });
  }
/** Add the logged in user id to clone permission surrounding the original product. It needs to clone the original products user permission groups */
  saveProduct(product) {
    return this.post('/content/save-get-product', { product: product, permUserId: this.authService.getCurrentUser().userId });
  }

  saveProductByPricingLevel(product){
    return this.post('/content/save-product-addon-pricing-by-method-id', product);
  }

  getProductBriefDetails(ids) {
    return this.post('/content/get-product-brief-details', { productIds: ids });
  }
  
  /** Add the logged in user id to clone permission surrounding the original product */
  cloneProducts(ids) {
    return this.post('/content/clone-product', { id: ids, permUserId: this.authService.getCurrentUser().userId});
    }
  recoverProducts(ids) {
        return this.post('/content/recover-product', { id: ids, permUserId: this.authService.getCurrentUser().userId });
    }
  deleteTrashProducts(ids) {
        return this.post('/content/delete-trash-product', { id: ids, permUserId: this.authService.getCurrentUser().userId });
    }

  deleteProducts(ids) {
    return this.post('/content/delete-product', { id: ids, permUserId: this.authService.getCurrentUser().userId });
  }

  getProductSources() {
    return this.post('/content/get-product-sources', {});
  }

  getUniversalApis() {
    return this.post('/content/get-universal-apis', {});
  }

  getUniversalProducts(api, sub, term) {
    return this.post('/content/search-universal-products', {
      api, sub, term
    });
  }

  getProductGroupAttributeValues(type) {
    return this.post('/content/get-product-group-attribute-values', { type: type });
  }

  getUniversalProduct(product) {
    return this.post('/content/get-universal-product', { product });
  }

  getUniversalConvertedProduct(product, category = []) {
    return this.post('/content/get-universal-converted-product', { product: product, category: category, permUserId: this.authService.getCurrentUser().userId });
  }

  getProductLiveInventory(pid, live, color = '') {
    return this.post('/content/get-universal-live-inventory', {
      productId: pid,
      color: color,
      live
    });
  }

  getProductInventory(id, oId = "") {
    return this.post('/content/get-product-inventory', { id: id, orderId: oId });
  }

  updateProductShell(pid, shell) {
    return this.post('/content/save-shell-status', {
      id: pid, shell
    });
  }

  getUniversalFob(pid) {
    return this.post('/content/get-universal-fob', { productId: pid });
  }

  getAnteraFob() {
    return this.post('/content/get-fob', {});
  }

  updateLineItem(orderId, lineItems) {
    return this.post('/content/update-quote-order-line-item', {
      orderId,

      lineItems
    });
  }

  getOrderPricing(id) {
    return this.post('/content/get-order-pricing', { id: id });
  }

  getOrderPicklist(id) {
    return this.post('/content/get-picklist', { orderId: id });
  }

  deleteLineItems(orderId, lineItemUpdateIds) {
    return this.post('/content/delete-quote-order-line-item', {
      orderId,
      lineItemUpdateIds,
      permUserId: this.authService.getCurrentUser().userId,
      permUserName: this.authService.getCurrentUser().userName
    });
  }

  updateLineItemMatrixRows(orderId, lineItemUpdateId, rows) {
    return this.post('/content/update-line-item-matrix-row', {
      orderId,
      lineItemUpdateId,
      matrixRows: rows
    });
  }

  deleteLineItemMatrixRows(orderId, lineItemUpdateId, mrIds) {
    return this.post('/content/delete-line-item-matrix-row', {
      orderId,
      lineItemUpdateId,
      matrixUpdateIds: mrIds
    });
  }

  createAddonCharges(orderId, lineItemUpdateId, addonCharges) {
    return this.post('/content/create-line-item-addon-charge', {
      orderId,
      lineItemUpdateId,
      addonCharges
    });
  }

  updateAddonCharges(orderId, lineItemUpdateId, addonCharges) {
    return this.post('/content/update-line-item-addon-charge', {
      orderId,
      lineItemUpdateId,
      addonCharges
    });
  }

  deleteAddonCharges(orderId, lineItemUpdateId, addonChargeUpdateIds) {
    return this.post('/content/delete-line-item-addon-charge', {
      orderId,
      lineItemUpdateId,
      addonChargeUpdateIds
    });
  }

  uploadProductImage(imgData) {
    return this.post('/content/upload-product-image', imgData);
  }

  uploadProductImageUrl(imgData) {
    return this.post('/content/upload-product-image-url', imgData);
  }


  // Addon charges for decoration & line item

  getAddonCharges(params) {
    return this.post('/content/get-addon-charges-list', params);
  }

  // Sources

  getSourcesCount(params) {
    return this.post('/content/get-sourcing-count', params);
  }

  getSourcesList(params) {
    return this.post('/content/get-sourcing-list', params);
  }

  getSource(id) {
    return this.post('/content/get-sourcing-details', { id });
  }

  createSource(source) {
    return this.post('/content/create-sourcing', source);
  }

  updateSource(source) {
    return this.post('/content/update-sourcing', source);
  }

  getSourceDetails(id) {
    return this.post('/content/get-sourcing-details', { id });
  }

  getBoardSources() {
    return this.post('/content/sourcing-boards', {
      'limit': 1000,
      'offset': 0,
      'order': 'dateEntered',
      'orient': 'desc',
      'term': {},
      'termIn': {},
      'termNotIn': {},
      'permUserId': this.authService.getCurrentUser().userId
    });
  }

  deleteSources(ids) {
    return this.post('/content/delete-sourcing', { ids: ids });
  }

  uploadSourceImage(data) {
    return this.post('/content/upload-sourcing-to-file-manager', data);
  }

  getRelatedSourcingFactories(sourceId) {
    return this.post('/content/get-related-sourcing-factories', { sourcingId: sourceId });
  }

  createSourcingFactoriesRelation(sourceId, vendorId) {
    return this.post('/content/create-sourcing-factories-relation', { sourcingId: sourceId, vendorId: vendorId });
  }

  removeSourcingFactoriesRelation(sourceId, vendorId) {
    return this.post('/content/remove-sourcing-factories-relation', { sourcingId: sourceId, vendorId: vendorId });
  }

  // Sourcing Details

  getSourcingDetailsBySourcingId(sourceId: string) {
    return this.post('/content/get-sourcing-details-by-sourcing-id', { sourcingId: sourceId });
  }

  createSourcingSubmission(submission) {
    return this.post('/content/create-sourcing-submissions', submission);
  }

  updateSourcingSubmission(submission) {
    return this.post('/content/update-sourcing-submissions', submission);
  }

  getSourcingSubmissionsList(filter) {
    return this.post('/content/get-sourcing-submissions-list', filter);
  }

  getSourcingSubmissionsCount(filter) {
    return this.post('/content/get-sourcing-submissions-count', filter);
  }

  getSourcingSubmissionsDetails(id) {
    return this.post('/content/get-sourcing-submissions-details', { id: id });
  }

  convertSourcingSubmissionToQuote(id) {
    return this.post('/content/convert-sourcing-submission-to-quote', { id: id });
  }

  getSourcingSubmissionsVendorDetails(sourcingId) {
    return this.post('/content/get-sourcing-submissions-vendor-details', { sourcingId: sourcingId });
  }

  uploadFileToSourcingSubmissions(formData) {

    const request = new HttpRequest(
      'POST',
      '/content/upload-file-to-sourcing-submissions',
      formData,
      { reportProgress: true }
    );
  }

  // Opportunities

  getOpportunitiesCount(params) {
    return this.post('/content/get-opportunities-count', params);
  }

  getOpportunitiesList(params) {
    return this.post('/content/get-opportunities-list', params);
  }

  getOpportunity(id) {
    return this.post('/content/get-opportunities-details', { id });
  }

  createOpportunity(opportunity) {
    return this.post('/content/create-opportunities', opportunity);
  }

  updateOpportunity(opportunity) {
    return this.post('/content/update-opportunities', opportunity);
  }

  getOpportunityDetails(opportunityId) {
    return this.post('/content/get-opportunities-details', {
      id: opportunityId
    });
  }

  getBoardOpportunities() {
    return this.post('/content/opportunity-boards', {
      'offset': 0,
      'limit': 1500,
      'permUserId': this.authService.getCurrentUser().userId
    });
  }

  getOpportunityBusinessTypes() {
    return this.post('/content/get-dropdowns', {
      dropdown: ['opportunity_type_dom']
    });
  }

  deleteOpportunities(ids) {
    return this.post('/content/delete-opportunities', { ids: ids, permUserId: this.authService.getCurrentUser().userId });
  }

  getOpportunitiesSalesStage() {
    return this.get('/content/get-opportunities-sales-stages');
  }

  // art proofs

  getArtProofs(params) {
    return this.get('/api/v1/decorations/proofs', params);
  }

  createArtProof(data) {
    return this.post('/api/v1/decorations/proofs', data);
  }

  updateArtProof(id, data) {
      return this.http.put('/protected/api/v1/decorations/proofs/' + id, data);
  }

  transitionArtProof(id, data) {
      return this.http.post('/protected/api/v1/decorations/proofs/' + id + '/transition', data);
  }
  deleteArtProof(id) {
      return this.http.delete('/protected/api/v1/decorations/proofs/' + id);
  }


  // artworks

  getArtworkList(params) {
    return this.post('/content/get-artwork-list', params);
  }

  getArtworkCount(params) {
    return this.post('/content/get-artwork-count', params);
  }

  getArtworkDetails(id) {
    return this.post(`/content/get-artwork-details`, { id });
  }

  createArtwork(data) {
    return this.post('/content/create-artwork', data);
  }

  updateArtwork(data) {
    return this.post('/content/update-artwork', data);
  }

  deleteArtwork(ids: any[]) {
    return this.post('/content/delete-artwork', { id: ids });
  }

  cloneArtwork(ids: any[]) {
    return this.post('/content/clone-artwork', { ids: ids });
  }

  assignSelectedArtworks(data) {
    return this.post('/content/assign-selected-artworks', data);
  }

  updateArtworkStatusById(id, status) {
    return this.post('/content/update-artwork-status-by-id', { id: id, status: status });
  }
  
  updateArtworkStatusByDesignId(designId, status, name = '', notes = '', email = '') {
    return this.post('/content/update-artwork-status-by-design-id', { designId : designId, status: status, name : name, notes: notes, email: email });
  }

  getArtworkStatusList() {
    return this.get('/content/get-artwork-status-list');
  }

  upsertArtworkStatus(status, id = '') {
    let payload;
    if (id) {
      payload = { id, label: status };
    } else {
      payload = { name: status, label: status };
    }
    return this.post('/content/artwork-status', payload);
  }

  deleteArtworkStatus(id) {
    return this.post('/content/delete-artwork-status', { id });
  }

  getAllDesignTypes() {

    return this.get('/content/get-decorator-types-all');
  }

  getAllDesignTypesDetailsOptions() {

    return this.get('/content/get-deco-type-details-options');
  }

  getArtworkIdFromDesignId(did) {
    return this.post('/content/get-artwork-id-by-design-id', { id: did });
  }

  getArtworkIdFromOrderIdVendorId(params) {
    return this.post('/content/get-artwork-id-by-order-id-vendor-id', { params });
  }

  artworkSetPinned(id, pinned) {
    return this.post('/content/artwork-set-pinned', { id, pinned });
  }

  getDecoDetailsForArtCard(id) {
    return this.post('/content/get-deco-details-for-art-card', { id: id });
  }

  updateArtworkVariationToOrder(artworkVariation, orderVariation) {
    return this.post('/content/update-artwork-variation-to-order', { artworkVariation: artworkVariation, orderVariation: orderVariation });
  }

  revertArtworkVariationFromOrder(orderVariation) {
     return this.post('/content/revert-artwork-variation-from-order', { orderVariation: orderVariation });
   }



  // Design API

  updateDesign(params) {
    return this.post('/content/update-design', params);
  }

  getDesignDetails(id) {
    return this.post('/content/get-design-details', { id });
  }

  getDecoratorVendorsByDecoType(params) {
    return this.post('/content/get-decorator-vendors-by-deco-type', params);
  }

  isDecoratorVendor(vendorId) {
    return this.post('/content/is-decorator-vendor', { id: vendorId });
  }


  // Decoration API

  linkDesignToLineItem(designId, orderId, lineItemId, matrixRowIds) {
    return this.post('/content/link-design-to-line-item', {
      designId,
      orderId,
      lineItemId,
      matrixRowIds
    });
  }

  linkDesignToLineItemWithVariation(designId, orderId, lineItemId, matrixRowIds, variationToChooseFrom) {
    return this.post('/content/link-design-to-line-item-with-variation', {
      designId,
      orderId,
      lineItemId,
      matrixRowIds,
      variationToChooseFrom
    });
  }

  deleteDesignFromLineItem(params) {
    return this.post('/content/delete-deco-vendor-from-line-item', params);
  }

  updateDecoVendors(orderId, lineItemId, vendors) {
    return this.post('/content/update-deco-vendor-to-line-item', {
      decoVendors: vendors,
      orderId,
      lineItemId
    });
  }

  linkDecoChargeToDecoVendor(vendor) {
    return this.post('/content/link-deco-charge-to-deco-vendor', vendor);
  }

  getDecoratorDropdown(decoType, vendorId) {
    return this.post('/content/get-decorator-detail-dropdown', { decoType, vendorId });
  }

  // Decoration Charges API
  getDecoChargesList(params) {
    return this.post('/content/get-deco-charges-list', params);
  }

  getDecoChargesCount(params) {
    return this.post('/content/get-deco-charges-count', params);
  }

  getDecoChargeDetail(id) {
    return this.post('/content/get-deco-charges-details', { id });
  }

  createDecoCharge(params) {
    return this.post('/content/create-deco-charges', params);
  }

  updateDecoCharge(params) {
    return this.post('/content/update-deco-charges', params);
  }

  deleteDecoCharges(ids) {
    return this.post('/content/delete-deco-charges', { ids });
  }

  getDecoratorTypes() {
    return this.get('/content/get-decorator-types-all');
  }

  getFinancialAccountList() {
    return this.get('/content/get-financial-accounts');
  }

  // Module Fields API
  getFieldsList(params) {
    return this.post('/content/get-fields-list', params);
  }
  getFieldsCount(params) {
    return this.post('/content/get-fields-count', params);
  }
  updateModuleField(params) {
    return this.post('/content/update-field', params);
  }

  // Vouchings API
  getVouchingsList(params) {
    return this.post('/content/get-vouching-list', params);
  }

  getVouchingsCount(params) {
    return this.post('/content/get-vouching-count', params);
  }

  isOrderVouched(params) {
    return this.post('/content/is-order-vouch', params);
  }

  getVouchingDetails(id) {
    return this.post('/content/get-vouching-details', { id });
  }

  getVouchingDetailsByVendor(params) {
    return this.post('/content/get-vouching-details-by-vendor', params);
  }

  createVouching(vouching) {
    return this.post('/content/create-vouching', vouching);
  }

  updateVouching(vouching) {
    return this.post('/content/update-deco-type', vouching);
  }

  deleteVouchings(params) {
    return this.post('/content/delete-vouching', params);
  }

  // Workflow API
  getWorkflowList(params) {
    params.permUserId = this.authService.getCurrentUser().userId;
    return this.post('/content/workflow-list', params);
  }

  getWorkflowListCount(params) {
    params.permUserId = this.authService.getCurrentUser().userId;
    return this.post('/content/workflow-list-count', params);
  }

  // Decoration Types API
  getDecorationTypesList(params) {
    return this.post('/content/get-deco-types-list', params);
  }

  getDecorationTypesCount(params) {
    return this.post('/content/get-deco-types-count', params);
  }

  getDecorationTypeDetail(id) {
    return this.post('/content/get-deco-type-details', { id });
  }

  updateDecorationType(decoTypeDetails) {
    return this.post('/content/update-deco-type', decoTypeDetails);
  }

  createDecorationType(decoTypeDetails) {
    return this.post('/content/create-deco-type', decoTypeDetails);
  }

  // Deco Type Group API
  getDecoTypeGroupsList(params) {
    return this.post('/content/get-deco-type-group-list', params);
  }

  getDecoTypeGroupsListOnly(params) {
    return this.post('/content/get-deco-type-group-list-only', params);
  }

  getDecoTypeGroupsCount(params) {
    return this.post('/content/get-deco-type-group-count', params);
  }

  getDecoTypeGroupsDetail(id) {
    return this.post('/content/get-deco-type-group-details', { id });
  }

  updateDecoTypeGroups(decoTypeGroupsDetails) {
    return this.post('/content/update-deco-type-group', decoTypeGroupsDetails);
  }

  createDecoTypeGroups(decoTypeGroupsDetails) {
    return this.post('/content/create-deco-type-group', decoTypeGroupsDetails);
  }

  // Dropdowns API
  getDropdownsList(params) {
    return this.post('/content/get-dropdowns-list', params);
  }

  getDropdownsCount(params) {
    return this.post('/content/get-dropdowns-count', params);
  }

  deleteDropdowns(params) {
    return this.post('/content/delete-dropdown-options', params);
  }

  getDropdownOptions(params) {
    return this.post('/content/get-dropdown-vars-with-options', params);
  }

  createDropdownOption(params) {
    return this.post('/content/create-dropdown-options', params);
  }

  updateDropdownOption(params) {
    return this.post('/content/update-dropdown-options', params);
  }

  deleteDropdownOption(params) {
    return this.post('/content/delete-dropdown-options', params);
  }

  getShippingAllInfo(params) {
    return this.post('/content/get-shipping-all-info', params);
  }

  getShippingInfo(params) {
    return this.post('/content/get-shipping-info', params);
  }


  createShippingInfo(params) {
    return this.post('/content/create-shipping-info', params);
  }

  updateShippingInfo(params) {
    return this.post('/content/update-shipping-info', params);
  }

  getShippingMethodsDropdown() {
    return this.get('/content/get-shipping-methods');
  }

  // Manage TimeZones

  getTimeZonesDropdown() {
    return this.get('/content/get-time-zones');
  }

  createTimeZone(timeZone) {
    return this.post('/content/create-time-zone', timeZone);
  }

  updateTimeZone(timeZone) {
    return this.post('/content/update-time-zone', timeZone);
  }

  // Decoration Locations API
  getDecorationLocationsList(params) {
    return this.post('/content/get-deco-locations-list', params);
  }

  // Decoration Locations API
  getLogoLocations(params) {
    return this.post('/content/get-logo-locations', params);
  }

  getDecorationLocationsCount(params) {
    return this.post('/content/get-deco-locations-count', params);
  }

  deleteDecorationLocations(params) {
    return this.post('/content/delete-deco-locations', params);
  }

  getDecorationLocationDetail(id) {
    return this.post('/content/get-deco-locations-details', { id: id });
  }

  createDecorationLocationDetail(decoLocationDetail) {
    return this.post('/content/create-deco-locations', decoLocationDetail);
  }

  updateDecorationLocationDetail(decoLocationDetail) {
    return this.post('/content/update-deco-locations', decoLocationDetail);
  }

  // Additional Charges API
  getAdditionalChargesList(params) {
    return this.post('/content/get-addon-charges-list', params);
  }

  getAdditionalChargesCount(params) {
    return this.post('/content/get-addon-charges-count', params);
  }

  deleteAdditionalCharges(params) {
    return this.post('/content/delete-addon-charges', params);
  }

  getAdditionalChargeDetail(id) {
    return this.post('/content/get-addon-charges-details', { id: id });
  }

  createAdditionalChargeDetail(addChargeDetail) {
    return this.post('/content/create-addon-charges', addChargeDetail);
  }

  updateAdditionalChargeDetail(addChargeDetail) {
    return this.post('/content/update-addon-charges', addChargeDetail);
  }

  // Commissions API
  getCommissionsList(params) {
    return this.post('/content/get-commission-list', params);
  }

  getCommissionsCount(params) {
    return this.post('/content/get-commission-count', params);
  }

  deleteCommissions(ids) {
    return this.post('/content/delete-commission', { ids: ids });
  }

  updateCommission(commissionDetail) {
    return this.post('/content/update-commission', commissionDetail);
  }

  getCommissionDetail(id) {
    return this.post('/content/get-commission-details', { id: id });
  }
  createCommission(commissionDetail) {
    return this.post('/content/create-commission', commissionDetail);
  }

  // Commission Groups API
  createCommissionGroup(commissionDetail) {
    return this.post('/content/create-commission-group', commissionDetail);
  }
  getCommissionGroupsList(params) {
    return this.post('/content/get-commission-group-list', params);
  }

  getCommissionGroupsCount(params) {
    return this.post('/content/get-commission-group-count', params);
  }

  deleteCommissionGroups(ids) {
    return this.post('/content/delete-commission-group', { ids: ids });
  }

  cloneCommissionGroups(ids) {
    return this.post('/content/clone-commission-group', { ids: ids });
  }

  updateCommissionGroup(data) {
    return this.post('/content/update-commission-group', data);
  }

  getCommissionGroupDetail(id) {
    return this.post('/content/get-commission-group-details', { id: id });
  }

  getCommissionsForGroup(id) {
    return this.post('/content/get-commissions-for-group', { groupId: id });
  }

  addCommissionsToGroup(groupId, ids) {
    return this.post('/content/add-commissions-to-group', { groupId: groupId, commissionIds: ids });
  }

  removeCommissionsFromGroup(groupId, ids) {
    return this.post('/content/remove-commissions-from-group', { groupId: groupId, commissionIds: ids });
  }

  // Faqs API
  getFaqsList(params) {
    return this.post('/content/get-faq-list', params);
  }

  getFaqsCount(params) {
    return this.post('/content/get-faq-count', params);
  }

  createFaq(params) {
    return this.post('/content/create-faq', params);
  }

  updateFaq(params) {
    return this.post('/content/update-faq', params);
  }

  deleteFaqs(ids) {
    return this.post('/content/delete-faq', { ids: ids });
  }

  updateFaqStatus(params) {
    return this.post('/content/update-faq-status', params);
  }

  // Leads API

  getLeadsList(params) {
    return this.post('/content/get-leads-list', params);
  }

  getLeadsCount(params) {
    return this.post('/content/get-leads-count', params);
  }

  getLeadDetails(id) {
    return this.post('/content/get-leads-details', { id });
  }

  createLead(params) {
    return this.post('/content/create-leads', params);
  }

  updateLead(params) {
    return this.post('/content/update-leads', params);
  }

  deleteLeads(ids) {
    return this.post('/content/delete-leads', { ids: ids, permUserId: this.authService.getCurrentUser().userId });
  }

  initConvertLead(id) {
    return this.post('/content/init-convert-lead', { id });
  }

  convertLead(params) {
    return this.post('/content/convert-lead', params);
  }

  // Campaign APIs

  getCampaignsList(params) {
    return this.post('/content/get-campaigns-list', params);
  }

  getCampaignsCount(params) {
    return this.post('/content/get-campaigns-count', params);
  }

  // Auto Completes

  getUserAutocomplete(term) {
    return this.post('/content/user-auto', {
      search: term
    });
  }
  autocompleteNotificationGroup(term) {
    return this.get('/notification-groups/auto?search='+encodeURIComponent(term));
  }

  getCustomerAutocomplete(term) {
    return this.post('/content/customer-auto', {
      search: term,
      permUserId: this.authService.getCurrentUser().userId
    });
  }

  getContactAutocomplete(term, email = false) {
    return this.post('/content/contact-auto', {
      search: term,
      email,
      permUserId: this.authService.getCurrentUser().userId
    });
  }

  getVendorAutocomplete(term) {
    return this.post('/content/vendor-auto', {
      search: term,
      permUserId: this.authService.getCurrentUser().userId
    });
  }

  getAccountAutocomplete(term) {
    return this.post('/content/account-auto', {
      search: term,
      permUserId: this.authService.getCurrentUser().userId
    });
  }

  getOrderAutocomplete(term) {
    return this.post('/content/order-auto', {
      search: term,
      permUserId: this.authService.getCurrentUser().userId
    });
  }

  getQuoteAutocomplete(term) {
    return this.post('/content/quote-auto', {
      search: term,
      permUserId: this.authService.getCurrentUser().userId
    });
  }

  getProductCategoryList(term) {
    return this.post('/content/get-category-list', term);
  }

  getProductAdditionalCharges(id) {
    return this.post('/content/get-product-addon-charges', { id: id });
  }

  getCampaignAuto(text) {
    return this.post('/content/campaigns-auto', {
      offset: 0,
      limit: 5,
      term: { name: text }
    });
  }

  getCampaignAutoId(id) {
    return this.post('/content/campaigns-auto', {
      offset: 0,
      limit: 1,
      term: { id }
    });
    }

    getLeadsAutocomplete(term) {
        return this.post('/content/leads-auto', {
            search: term
        });
    }

    getSourcingcomplete(term) {
        return this.post('/content/sourcing-auto', {
            search: term
        });
    }

    getArtworkcomplete(term) {
        return this.post('/content/artwork-auto', {
            search: term
        });
    }

  getOpportunityAutocomplete(term) {
    return this.post('/content/opportunities-auto', {
      search: term
    });
    }
    getOpportunityAutocompleteByName(term) {
        return this.post('/content/opportunities-auto-name', {
            search: term
        });
    }

  getDesignTypeAuto(term) {
    return this.post('/content/design-auto', {
      search: term
    });
  }

  getDesignLocations() {
    return this.get('/content/get-design-locations/');
  }

  getProductDecorationLocations(productId) {
    return this.get('/content/get-product-decoration-locations?productId='+productId);
  }

  // Locations API

  getLocationDetails(locationId) {
    return this.post('/content/get-locations-details', {
      id: locationId
    });
  }

  // Menu
  getDisplayMenu() {
    return this.get('/content/get-display-menu');
  }

  // Logo upload
  getLogo() {
    return this.get('/content/get-client-logo');
  }

  getAddonLogo() {
    return this.get('/content/get-client-addon-logo');
  }
  
  uploadLogo(data) {
    return this.post('/content/set-client-logo', data);
  }
  uploadAddonLogo(data) {
    return this.post('/content/set-client-addon-logo', data);
  }

  uploadAccountLogo(data) {
    return this.post('/content/upload-account-logo', data);
  }

  getIdentityLogo(data) {
    return this.post('/content/get-identity-logo', data);
  }

  // Documents

  getPromoStandardsVendors(payload = {}) {
    return this.post('/content/get-ps-po-vendors', payload);
  }

  pushPromoStandardsPO(payload: { orderId: string, vendorId: string }) {
    return this.post('/content/ps-po-push', payload);
  }

  getDocumentLabels(data) {
    return this.post('/content/get-document-labels', data);
  }

  updateInvoiceDate(data) {
    return this.post('/content/update-invoice-date', data);
  }

  updateProformaDate(data) {
    return this.post('/content/update-proforma-date', data);
  }

  updateVoidDate(data) {
    return this.post('/content/update-void-date', data);
  }

  // Payment
  doPayment(data) {
    return this.post('/content/do-payment', data);
  }

  refundPayment(data) {
    return this.post('/content/refund-payment', data);
  }

  voidPayment(data) {
    return this.post('/content/void-payment', data);
  }

  inquirePayment(data) {
    return this.post('/content/inquire-payment', data);
  }

  deletePayment(data) {
    return this.post('/content/delete-payment-info', data);
  }


  isSandbox() {
    return this.postWithHeader('/content/is-sandbox', {}, { responseType: 'text' });
  }

  getPaymentTracks(data) {
    return this.post('/content/get-payment-track', data);
  }

  verifyOrderForInvoice(oId) {
    return this.post('/content/validate-invoicing', {orderId: oId});
  }

  pushPaymentToQb(data) {
    return this.post('/content/qb-push-payments', data);
  }
  ////  BOLT API SETTINGS
  getBoltCreds() {
    return this.get('/content/get-bolt-creds');
  }

  saveBoltCreds(params) {
    return this.post('/content/save-bolt-creds', params);
  }

  getBoltConnect(params) {
    return this.post('/content/connect-bolt', params);
  }

  getBoltPayment(params) {
    return this.post('/content/auth-bolt', params);
  }

  // Dropdown
  dropdownList(data) {
    return this.post('/content/get-dropdowns', data);
  }

  // Stores
  getStoreList(data = {}) {
    return this.post('/content/get-store-list', data);
  }

  getTagList(payload) {
    return this.post('/content/get-tag-list', payload)
  }

  pushProductsToStores(data) {
    return this.post('/content/push-products-to-stores', data);
  }

  tagProductsToStores(data) {
    return this.post('/content/tag-products-to-stores', data);
  }

  // Saved search
  saveSearch(data) {
    return this.post('/content/set-user-setting', data);
  }

  getSavedSearches(data) {
    return this.post('/content/get-user-module-setting', data);
  }

  getUserSetting(userId, moduleName) {
    return this.post('/content/get-user-module-setting', { userId: userId, module: moduleName });
  }

  // Saved search
  setUserSetting(data) {
    return this.post('/content/set-user-setting', data);
  }

  deleteSavedSearch(data) {
    return this.post('/content/delete-user-setting', data);
  }

  // Saved Objective api
  setUserObjectiveSetting(data) {
    return this.post('/api/v1/objectives/user-objectives', data);
  }


  // Advance System Settings
  getAdvanceSystemConfigAll(data) {
    return this.post('/content/get-advance-system-config-all', data);
  }

  getAdvanceSystemConfig(data) {
    return this.post('/content/get-advance-system-config', data);
  }

  updateAdvanceSystemConfigAll(data) {
    return this.post('/content/update-advance-system-config-all', data);
  }

  updateAdvanceSystemConfig(data) {
    return this.post('/content/update-advance-system-config', data);
  }

  // System settings
  getSystemConfigs() {
    return this.get('/content/get-system-config-all');
  }

  saveSystemConfigs(params) {
    return this.post('/content/update-system-config-all', params);
  }

  // Purge record API

  getModuleListToPurge(data) {
    return this.post('/content/get-module-list-to-purge', data);
  }

  initPurgeRecords(modules) {
    return this.post('/content/init-purge-records', {
      modules: modules,
    });
  }

  processPurgeRecords(modules, confirmKey) {
    return this.post('/content/process-purge-records', {
      modules: modules,
      confirmKey: confirmKey,
    });
  }


  // Import API
  initImport(data) {
    return this.post('/content/init-import', data);
  }

  processImport(data) {
    return this.post('/content/process-import', data);
  }

  getPendingImport(data) {
    return this.post('/content/get-pending-import', data);
  }

  getImportProgress(data) {
    return this.post('/content/get-import-progress', data);
  }

  uploadImportFile(data) {
    return this.post('/content/upload-import-file', data);
  }

  uploadAnyFile(data) {
    return this.post('/content/file-upload', data);
  }

  // File Manager API

  uploadToFileManger(data) {
    return this.post('/content/upload-to-file-manager', data);
  }

  uploadOrderDocsToCloud(data) {
    return this.post('/content/upload-order-docs-to-cloud', data);
  }

  uploadPoDocsToCloud(data) {
    return this.post('/content/upload-po-docs-to-cloud', data);
  }

  uploadRoyaltyReportsToCloud(data) {
    return this.post('/content/upload-royalty-reports-to-cloud', data);
  }


  updateAwsFilesTags(path, tags) {
    return this.post('/content/update-file-manager-tags', { path: path, tags: tags });
  }

  updateAwsFilesBasics(path, basics) {
    return this.post('/content/update-file-manager-basics', { path: path, basics: basics });
  }

  renameAwsEntry(path, name, type) {
    return this.post('/content/rename-file-manager', { path: path, name: name, type: type });
  }

  copyAwsEntry(path, newPath, type) {
    return this.post('/content/copy-file-manager', { path: path, newPath: newPath, type: type });
  }

  moveAwsEntry(path, newPath, type) {
    return this.post('/content/move-file-manager', { path: path, newPath: newPath, type: type });
  }

  deleteFromFileManger(accountId, path, selectedFilesFolders) {
    return this.post('/content/delete-from-file-manager', { accountId: accountId, path: path, selectedFilesFolders: selectedFilesFolders });
  }

  createDirInFileManager(data) {
    return this.post('/content/create-dir-in-file-manager', data);
  }

  uploadArtworkToFileManger(data) {
    return this.post('/content/upload-artwork-to-file-manager', data);
  }

  uploadProjectFileToFileManager(data) {
    return this.post('/content/upload-project-file-to-file-manager', data);
  }


  moveArtworkFromOrder(accountId, orderNumber, designNumber, fileName) {
    return this.post('/content/move-artwork-from-order', { accountId: accountId, orderNumber: orderNumber, designNumber: designNumber, fileName: fileName });
  }

  // Mail SMTP API
  getMailCredentials(userId) {
      return this.http.get<any>('protected/content/get-user-setting?userId=' + userId + '&module=Mail&setting=MailCredentials&mode=s');
  }

  saveMailCredentials(mailCredentials) {
      return this.http.post<any>('protected/content/set-user-setting', mailCredentials);
  }

  // Mail SMTP API
  getUserEmailSetting(userId) {
      return this.http.post<any>('protected/content/get-user-email-setting', { userId: userId });
  }

  setUserEmailSetting(mailCredentials) {
      return this.http.post<any>('protected/content/set-user-email-setting', mailCredentials);
  }

  removeUserEmailSetting(id) {
      return this.http.post<any>('protected/content/remove-user-email-setting', { id: id });
  }

  sendMailSMTP(data) {
    return this.postWithHeader('/content/send-email', data, { 'Content-Type': 'multipart/form-data' });
  }

  getEmails(param) {
    //return this.post('/content/get-email', param);
    if (param.clearCache > 0) {
      return this.get('/content/get-my-email?userId=' + param.userId + '&from=' + param.from + '&folder=' + param.folder + '&search=' + param.search + '&page=' + param.page + '&pageSize=' + param.pageSize + '&clearCache=' + param.clearCache);
    }
    return this.get('/content/get-my-email?userId=' + param.userId + '&from=' + param.from + '&folder=' + param.folder + '&search=' + param.search + '&page=' + param.page + '&pageSize=' + param.pageSize);
  }

  getAttachmentData(param) {
    return this.post('/content/get-attachment-data', param);
  }

  // production
  getProductionList(params) {
    return this.post('/content/get-job-list', params);
  }

  getProductionCount(params) {
    return this.post('/content/get-job-count', params);
  }

  getProductionDetails(id) {
    return this.post('/content/get-job-details', { id });
  }

  updateProduction(data) {
    return this.post('/content/update-job', data);
  }

  deleteProduction(ids: any[]) {
  }

  getProductionStatusList() {
    return this.get('/content/get-job-statuses');
  }

  addProductionStatus(label){
    return this.post("/content/create-production-status", label);
  }

  deleteProductionStatus(id){
    return this.post("/content/delete-production-status", id);
  }

  getProductionPriorityList() {
    return this.get('/content/get-job-priorities');
  }

  updateProductionStatus(status, id = '') {
  }

  getEquipment() {
    return this.get('/content/get-equipment');
  }

  createEquipment(data) {
    return this.post('/content/create-equipment', data);
  }

  updateEquipment(data) {
    return this.post('/content/update-equipment', data);
  }

  deleteEquipment(id) {
    return this.post('/content/delete-equipment', { id });
  }

  updateProductionStatusLabel(label, id) {
    return this.post('/content/update-production-status-label', { label, id });
  }

  getProductionProcesses() {
    return this.get('/content/production-get-processes');
  }

  productionCreateProcess(data) {
    return this.post('/content/production-create-process', data);
  }

  productionUpdateProcess(data) {
    return this.post('/content/production-update-process', data);
  }

  productionDeleteProcess(id: Number) {
    return this.post('/content/production-delete-process', { id });
  }

  productionGetCurrentDecoTypes() {
    return this.get('/content/production-get-current-deco-types');
  }

  productionGetCurrentDesignVariations() {
    return this.get('/content/production-get-current-design-variations');
  }

  productionBatchJobs(ids: any) {
    return this.post('/content/production-batch-jobs', ids);
  }

  productionDeleteBatch(id) {
    return this.post('/content/production-delete-batch', { id });
  }

  productionUpdateJobStatus(jobId, statusId, machineId, reasonId = '') {
    console.log("updated status here");
    return this.post('/content/production-update-job-status', { jobId, statusId, machineId, reasonId });
  }

  productionUpdateJobStatusByOrderNumber(statusId, orderNo){
    return this.put("/content/production-update-similar-jobs-status-by-order", { statusId, orderNo });
  }
  productionUpdateJobStatusByWorkOrderNumber(statusId, workOrderNo){
    return this.put("/content/production-update-similar-jobs-status", { statusId, workOrderNo });
  }

  productionMachineGraph() {
    return this.get('/content/production-machine-graph');
  }

  productionGetFilterOptions() {
    return this.get('/content/production-get-filter-options');
  }

  productionUpdateJobEquipment(machineId, jobId) {
    return this.post('/content/production-update-job-equipment', { machineId, jobId });
  }

  productionAddToBatch(masterJob, job) {
    return this.post('/content/production-add-to-batch', { masterJob, job });
  }

  productionDelFromBatch(jobId) {
    return this.post('/content/production-del-from-batch', { jobId });
  }

  productionSetPinned(id, pinned) {
    return this.post('/content/production-set-pinned', { id, pinned });
  }

  productionGetJobOrders() {
      return this.get('/content/production-get-job-orders');
  }

  productionBatchAllByDesign() {
    return this.post('/content/production-batch-all-by-design', {op: true});
  }

  productionUnbatchAll() {
    return this.post('/content/production-unbatch-all', {op: true});
  }

  // Workflow Status
  updateWorkflowEvent(orderId, vendorId, stageId, eventId) {
    const data = {
      vendorId: vendorId,
      orderId: orderId,
      stageId: stageId,
      eventId: eventId
    };
      this.http.post('protected/content/update-step-record', data)
      .subscribe((response: any) => {
      });
  }

  // Workflow Status
  updateWorkflowEventForPO(poId, vendorId,stageId, eventId, user) {
    const data = {
      vendorId: vendorId,
      poId: poId,
      stageId: stageId,
      eventId: eventId,
      user: user
    };
      this.http.post('/protected/api/v2/purchase-orders/update-workflow-status', data)
       .subscribe((response: any) => {
    });
  }

  // Purchase Need Status
  updatePONeedsStatus(orderId, vendorId) {
    const data = {
      vendorId: vendorId,
      orderId: orderId
    };
   // this.post('/api/v2/purchase-needs/update-needs-to-done', data);
      this.http.post('/protected/api/v2/purchase-needs/update-needs-to-done', data)
       .subscribe((response: any) => {
    });
  }

  getCardConnectCreds() {
      return this.get('/content/get-cardconnect-creds');
  }

  saveCardConnectCreds(params) {
      return this.post('/content/save-cardconnect-creds', params);
  }

  updateAccountFlag(id, s) {
    const data = {
      id: id,
      status: s
    };

    return this.post('/content/update-account-flag', data);
  }
  // REPORT SETTINGS API

  updateReports(params) {
    return this.post('/content/update-reports', params);
  }

  getAllReports(params) {
    return this.post('/content/all-reports', params);
  }

  getAllReportsCount(params) {
    return this.post('/content/all-reports-count', params);
  }

  getAdminReportsCount(params) {
    return this.post('/content/admin-reports-count', params);
  }

  getAdminReports(params) {
    return this.post('/content/admin-reports', params);
  }

  // ROYALTY API
  getFrachiseList(params) {
    return this.post('/content/get-franchise-list', params);
  }

  getFranchiseCount(params) {
    return this.post('/content/get-franchise-count', params);
  }

  getFranchiseDetails(id) {
    return this.post('/content/get-franchise-details', { id });
  }

  createFranchise(params) {
    return this.post('/content/create-franchise', params);
  }

  updateFranchise(params) {
    return this.post('/content/update-franchise', params);
  }

  deleteFranchise(id) {
    return this.post('/content/delete-franchise', { id: id });
  }

  getCapCodes() {
    return this.get('/content/get-cap-codes');
  }

  getCapByCodes(params) {
    return this.post('/content/get-cap-by-code', params);
  }

  getCapList(params) {
    return this.post('/content/get-cap-list', params);
  }

  getCapCount(params) {
    return this.post('/content/get-cap-count', params);
  }

  getCapDetails(id) {
    return this.post('/content/get-cap-details', { id });
  }

  getCapFranchiseDetails(id) {
    return this.post('/content/get-cap-franchise-details', { id });
  }

  createCap(params) {
    return this.post('/content/create-caps-code', params);
  }

  updateCap(params) {
    return this.post('/content/update-caps-code', params);
  }

  createRoyaltyReport(params) {
    return this.post('/content/create-royalty-report', params);
  }

  getRoyaltySuperReport(params) {
    return this.post('/content/get-royalty-super-report', params);
  }


  getRoyaltyReport(params) {
    return this.post('/content/get-royalty-report', params);
  }

  downloadRoyaltyReport(params, headers = {}) {
    return this.post('/Documents/royalties/download', params, { responseType: 'arraybuffer', headers: headers });
    // return this.http.post('http://kwilliams.anterasaas.com/protected/Documents/royalties/download', params, {responseType: 'arraybuffer',headers:headers} );
  }


  // permissions
  createPermissionGroup(data) {
    return this.post('/content/permission-create-group', data);
  }
  getPermissionGroups() {
    return this.get('/content/permission-get-groups');
  }

  getPermissionGroup(id) {
    return this.get('/content/permission-get-group?id=' + id);
  }

  setPermissionGroupEntityTypeValues(data) {
    return this.post('/content/permission-set-group-entity-type-values', data);
  }

  addUserToPermissionGroup(data) {
    return this.post('/content/permission-add-user-to-group', data);
  }

  delUserFromPermissionGroup(data) {
    return this.post('/content/permission-del-user-from-group', data);
  }

  setPermissionGroupActiveStatus(data) {
    return this.post('/content/permission-set-group-active-status', data);
  }

  checkUserPermissions(userId, entityId, entityType) {
    return this.get(
      '/content/permission-check-user?userId=' + userId + '&entityId=' + entityId + '&entityType=' + entityType
    );
  }

  checkUserAction(userId, action) {
    return this.get('/content/permission-check-user-action?userId=' + userId + '&action=' + action);
  }

  checkModuleAccess(userId, entityType) {
    return this.get('/content/permission-check-module-access?userId=' + userId + '&entityType=' + entityType);
  }

  setPermissionStatus(st) {
    return this.post('/content/permission-set-status', { status: st });
  }

  getPermissionStatus(userId = null) {
    return this.get('/content/permission-get-status?userId=' + userId);
  }

  getPermissionEntityGroups(entityId, entityType) {
    return this.get('/content/permission-get-entity-groups?entityId=' + entityId + '&entityType=' + entityType);
  }

  addPermissionEntityGroup(data) {
    return this.post('/content/permission-add-entity-group', data);
  }

  removePermissionEntityGroup(data) {
    return this.post('/content/permission-remove-entity-group', data);
  }

  getPermissionUserGroups(userId) {
    return this.get('/content/permission-get-user-groups?userId=' + userId);
  }

  editPermissionGroupName(id, name) {
    return this.post('/content/permission-edit-group-name', { id, name });
  }

  permissionGetEntityTypes() {
    return this.get('/content/permission-get-entity-types');
  }

  permissionGetEntityType(id) {
    return this.get('/content/permission-get-entity-type?id=' + id);
  }

  permissionUpdateEntityTypeEnabled(id, val) {
    return this.post('/content/permission-update-entity-type-enabled', { id, val });
  }

  permissionUpdateEntityTypeOptionEnabled(id, val) {
    return this.post('/content/permission-update-entity-type-option-enabled', { id, val });
  }

  permissionGetActions() {
    return this.get('/content/permission-get-actions');
  }

  permissionSetGroupActionValues(data) {
    return this.post('/content/permission-set-group-action-values', data);
  }

  permissionAddRelation(parentId, childId, detailId) {
    return this.post('/content/permission-add-relation', { parentId, childId, detailId });
  }

  permissionDelRelation(id, detailId) {
    return this.post('/content/permission-del-relation', { id, detailId });
  }

  permissionGetUserActions(userId) {
    return this.get('/content/permission-get-user-actions?userId=' + userId);
  }

  // end permissions
  getOrderStatusList(module) {
    return this.post('/content/get-statuses', { module: module });
  }

  // Email templates

  getEmailTemplatesList(params = {}) {
    return this.post('/content/get-email-templates-list', params);
  }
  getEmailTemplatesCount(params = {}) {
    return this.post('/content/get-email-templates-count', params);
  }
  getEmailTemplate(id: string) {
    return this.post('/content/get-email-templates-details', { id: id });
  }
  createEmailTemplate(data: any) {
    return this.post('/content/create-email-templates', data);
  }
  updateEmailTemplate(data: any) {
    return this.post('/content/update-email-templates', data);
  }
  deleteEmailTemplates(ids: string[]) {
    return this.post('/content/delete-email-templates', { ids: ids });
  }
  processEmailTemplateByName(params = {}) {
    return this.post('/content/process-email-template-by-name', params);
  }

  // Contact Tags
  getContactTagsList(payload = {}) {
    return this.post('/content/get-tags-list', payload);
  }

  getContactTagsCount(payload = {}) {
    return this.post('/content/get-tags-list', payload);
  }

  getContactTagsDetails(id: string) {
    return this.post('/content/get-tags-list', { id: id });
  }

  updateContactTag(payload: any) {
    return this.post('/content/update-tags', payload);
  }

  createContactTag(payload: any) {
    return this.post('/content/create-tags', payload);
  }

  assignContactTag(payload: any) {
    return this.post('/content/assign-tags-to-record', payload);
  }

  assignTagNameToBulkRecords(payload: any) {
    return this.post('/content/assign-tag-name-to-bulk-records', payload);
  }


  removeContactTags(ids: string[]) {
    return this.post('/content/remove-tags-from-record', { RelateTagIds: ids });
  }

  // Logistics

  getLogisticsList(payload: {}) {
    return this.post('/content/get-logistics-list', payload);
  }

  getLogisticsCount(payload: {}) {
    return this.post('/content/get-logistics-count', payload);
  }

  getBoardLogistics(payload: {}) {
    return this.post('/content/get-logistics-count', payload);
  }

  createLogistic(payload: any) {
    return this.post('/content/create-logistics', payload);
  }
  deleteLogistics(ids: string[]) {
    return this.post('/content/delete-logistics', { ids: ids });
  }

  getLogistic(id: string) {
    return this.post('/content/get-logistics-details', { id: id });
  }

  updateLogistic(payload: any) {
    return this.post('/content/update-logistics', payload);
  }

  // Identity
  getIdentity(id) {
    return this.post('/content/get-identity-list', { id: id });
  }

  getIdentityList(params = {}) {
    const _params = { 'offset': 0, 'limit': 50, 'order': 'name', 'orient': 'asc', 'id': '', 'term': { 'name': '' } };
    return this.post('/content/get-identity-list', { ..._params, ...params });
  }

  getIdentityCount(params = {}) {
    const _params = { 'offset': 0, 'limit': 50, 'order': 'name', 'orient': 'asc', 'id': '', 'term': { 'name': '' } };
    return this.post('/content/get-identity-count', { ..._params, ...params });
  }
  // Ship Station Carriers Saved as Default Products
  getShipStationCarriers() {
    return this.get('/content/get-ship-station-carriers');
  }
  // get all events or events based on the feature
  getSystemEvents(feature = '') {
    return this.post('/content/get-system-events', { feature: feature });
  }

  updateLineItemsNonTaxable(params) {
    return this.post('/content/update-line-item-non-taxable', params);
  }
  // integrations
  getProvinceTaxRates() {
    return this.get('/content/get-province-tax-rates');
  }

  // integrations
  integrationApiEnabled() {
    return this.get('/content/integration-api-enabled');
  }

  integrationEnableApi(enable: boolean) {
    return this.post('/content/integration-enable-api', { enable });
  }

  integrationGetToken() {
    return this.get('/content/integration-get-token');
  }

  integrationGenerateToken() {
    return this.get('/content/integration-generate-token');
  }

  integrationImportTaxCategories() {
    return this.get('/api/v1/tax-category/import-categories');
  }

  integrationGetTaxCategories(filters, restParams) {
    const params = this.createQueryString(filters, restParams);
    return this.get('/api/v1/tax-category', params);
  }

  // taxjar
  integrationRelateProductTaxCategory(taxCategoryId: number, productId: number) {
    const params = {
      entityId: productId
    }

    this.post('/api/v1/tax-category/' + taxCategoryId.toString(), params);
  }

  integrationRelateDecotypeCategory(taxCategoryId: number, decotypeId: number) {
    const params = {
      entityId: decotypeId
    }

    this.post('/api/v1/tax-category/' + taxCategoryId.toString(), params);
  }

  integrationRelateProductCategoryTaxCategory(taxCategoryId: number, productCategoryId: number) {
    const params = {
      entityId: productCategoryId
    }

    this.post('/api/v1/tax-category/' + taxCategoryId.toString(), params);
  }

  integrationRelateChargeTaxCategory(taxCategoryId: number, chargeId: string) {
    const params = {
      entityId: chargeId
    }

    this.post('/api/v1/tax-category/' + taxCategoryId.toString(), params);

  }

  /*
   * Purchse Order - vendorId
   */
  checkElectronicEndpoint(entity, id, orderId = '') {
    return new Promise((resolve, reject) => {
      this.post('/content/check-electronic-endpoint', { entity: entity, vendorId: id, orderId: orderId })
        .subscribe((response: any) => {
          resolve(response);
        }, err => reject(err));
    });
  }

  pushElectronicEntity(endpoint, entity, vendorId, entityId) {
    return new Promise((resolve, reject) => {
      this.post("/content/call-electronic-endpoint", { endpoint: endpoint, entity: entity, vendorId: vendorId, entityId: entityId })
        .subscribe((response: any) => {
          resolve(response);
        }, err => reject(err));
    });
  }

  getReasons() {
    return this.get('/content/get-reason');
  }

  addReason(params) {
    return this.post('/content/add-reason', params);
  }

  addCreditToAccount(params) {
    return this.post('/content/add-credit-to-account', params);
  }

  getCreditPerAccount(params) {
    return this.post('/content/get-credit-per-account', params);
  }

  getCurrentCreditAmount(params) {
    return this.post('/content/get-current-credit-amount', params);
  }

  deleteCreditAccount(params) {
    return this.post('/content/delete-credit-account', params);
  }

  getAccountBalance(data) {
    return this.post('/content/get-account-balance', data);
  }

  isDuplicateReference(data) {
    return this.post('/content/is-duplicate-reference', data);
  }

  getTaxJarCategories() {
    return this.get('/content/get-tax-jar-categories');
  }

  // UOM Group API
  getUomGroupsList(params) {
    return this.post('/content/get-uom-groups-list', params);
  }

  getUomGroupsListOnly() {
    return this.get('/content/get-uom-groups-list-only');
  }

  getUomGroupsCount(params) {
    return this.post('/content/get-uom-groups-count', params);
  }

  getUomGroupsDetail(id) {
    return this.post('/content/get-uom-groups-details', { id });
  }

  updateUomGroups(params) {
    return this.post('/content/update-uom-groups', params);
  }

  createUomGroups(params) {
    return this.post('/content/create-uom-groups', params);
  }

  // UOM API
  getUomList(params) {
    return this.post('/content/get-uom-list', params);
  }

  getUomListOnly() {
    return this.get('/content/get-uom-list-only');
  }

  getUomCount(params) {
    return this.post('/content/get-uom-count', params);
  }

  getUomDetail(id) {
    return this.post('/content/get-uom-details', { id });
  }

  updateUom(params) {
    return this.post('/content/update-uom', params);
  }

  createUom(params) {
    return this.post('/content/create-uom', params);
  }

  // Vendor Decoration Price Strategy API
  getVendorDecorationPriceStrategyList(params) {
    return this.post('/content/get-vendor-decoration-price-strategy-list', params);
  }

  getVendorDecorationPriceStrategyListOnly() {
    return this.get('/content/get-vendor-decoration-price-strategy-list-only');
  }

  getVendorDecorationPriceStrategyCount(params) {
    return this.post('/content/get-vendor-decoration-price-strategy-count', params);
  }

  getVendorDecorationPriceStrategyDetail(id) {
    return this.post('/content/get-vendor-decoration-price-strategy-details', { id });
  }

  updateVendorDecorationPriceStrategy(params) {
    return this.post('/content/update-vendor-decoration-price-strategy', params);
  }

  createVendorDecorationPriceStrategy(params) {
    return this.post('/content/create-vendor-decoration-price-strategy', params);
  }

  deleteVendorDecorationPriceStrategy(params) {
    return this.post('/content/delete-vendor-decoration-price-strategy', params);
  }

  // Additional Charges API
  getCannedMessagesList(params) {
    return this.post('/content/get-canned-messages-list', params);
  }

  getCannedMessagesCount(params) {
    return this.post('/content/get-canned-messages-count', params);
  }

  deleteCannedMessages(params) {
    return this.post('/content/delete-canned-messages', params);
  }

  getCannedMessagesDetails(id) {
    return this.post('/content/get-canned-messages-details', { id: id });
  }

  createCannedMessages(params) {
    return this.post('/content/create-canned-messages', params);
  }

  updateCannedMessages(params) {
    return this.post('/content/update-canned-messages', params);
  }

  updateDocsDefaultOptions(params) {
    return this.post('/content/update-docs-default-options', params);
  }

  getDocsDefaultOptions(params) {
    return this.post('/content/get-docs-default-options', params);
  }

  getDocsAllDefaultOptions(params) {
    return this.post('/content/get-docs-all-default-options', params);
  }

  // Projects API

  getProjectList(params) {
    return this.post('/content/get-projects-list', params);
  }

  getProjectCount(params) {
    return this.post('/content/get-projects-count', params);
  }

  getProjectAutocomplete(term) {
    return this.post('/content/projects-auto', {
      search: term,
      permUserId: this.authService.getCurrentUser().userId
    });
  }

  getProjectDetails(id) {
    return this.post('/content/get-projects-details', { id });
  }

  createProject(params) {
    return this.post('/content/create-projects', params);
  }

  updateProject(params) {
    return this.post('/content/update-projects', params);
  }

  deleteProjects(ids) {
    return this.post('/content/delete-projects', { ids: ids, permUserId: this.authService.getCurrentUser().userId });
  }

  cloneProjects(ids) {
    return this.post('/content/clone-projects', { ids: ids, permUserId: this.authService.getCurrentUser().userId });
  }

  getProjectStatusList() {
    return this.get('/content/get-project-status-list');
  }

  projectSetPinned(id, pinned) {
    return this.post('/content/project-set-pinned', { id, pinned });
  }

  deleteProjectStatus() {
    return [];
  }

  convertProjectToArtwork(id) {
    return this.post('/content/convert-project-to-artwork', { id });
  }


// Billing

  getBillingCount(params) {
    return this.post('/content/get-quote-order-count', params);
  }

  getBillingList(params) {
    return this.post('/content/get-quote-order-list', params);
  }

  getBilling(id) {
    return this.post('/content/get-billing-details', { id });
  }

  createBilling(billing) {
    return this.post('/content/create-billing', billing);
  }

  updateBilling(billing) {
    return this.post('/content/update-billing', billing);
  }

  getBillingDetails(id) {
    return this.post('/content/get-billing-details', { id });
  }

  getBoardBilling() {
    return this.post('/content/get-quote-order-board', {
      'limit': 1000,
      'offset': 0,
      'order': '',
      'orient': 'desc',
      'term': {
          orderStatus: [],
          orderType: ['Fulfillment'],
          orderNo: "",
          inHouseOrderNo: "",
          orderIdentity: "",
          contactName: "",
          accountName: "",
          orderDate: "",
          totalPrice: "",
          salesPerson: "",
          cloudOrderLink: "",
          inHandByDate: "",
          paymentStatus: [],
          modifiedDate: "",
          csrId: "",
          userId: "",
          action: ""
          },
      'termIn': {},
      'termNotIn': {},
      'permUserId': this.authService.getCurrentUser().userId,

    });
  }

  deleteBilling(ids) {
    return this.post('/content/delete-quote-order', { ids: ids });
  }

  updateOrderBillingStage(id, stage){
    return this.post('/content/update-billed-order-stage', { id: id, stage:stage });
  }

  uploadBillingImage(data) {
    return this.post('/content/upload-billing-to-file-manager', data);
  }

  getRelatedBillingFactories(billingId) {
    return this.post('/content/get-related-billing-factories', { billingId: billingId });
  }

  createBillingFactoriesRelation(billingId, vendorId) {
    return this.post('/content/create-billing-factories-relation', { billingId: billingId, vendorId: vendorId });
  }

  removeBillingFactoriesRelation(billingId, vendorId) {
    return this.post('/content/remove-billing-factories-relation', { billingId: billingId, vendorId: vendorId });
  }

  // Billing Details

  getBillingDetailsByBillingId(billingId: string) {
    return this.post('/content/get-billing-details-by-billing-id', { billingId: billingId });
  }

  createBillingSubmission(submission) {
    return this.post('/content/create-billing-submissions', submission);
  }

  updateBillingSubmission(submission) {
    return this.post('/content/update-billing-submissions', submission);
  }

  getBillingSubmissionsList(filter) {
    return this.post('/content/get-billing-submissions-list', filter);
  }

  getBillingSubmissionsCount(filter) {
    return this.post('/content/get-billing-submissions-count', filter);
  }

  getBillingSubmissionsDetails(id) {
    return this.post('/content/get-billing-submissions-details', { id: id });
  }

  convertBillingSubmissionToQuote(id) {
    return this.post('/content/convert-billing-submission-to-quote', { id: id });
  }

  getBillingSubmissionsVendorDetails(billingId) {
    return this.post('/content/get-billing-submissions-vendor-details', { billingId: billingId });
  }

  uploadFileToBillingSubmissions(formData) {

    const request = new HttpRequest(
      'POST',
      '/content/upload-file-to-billing-submissions',
      formData,
      { reportProgress: true }
    );
  }

  // Personalizations API

  getPersonalizationsList(params) {
    return this.post('/content/get-personalizations-list', params);
  }

  getPersonalizationsCount(params) {
    return this.post('/content/get-personalizations-count', params);
  }

  getPersonalizationsAutocomplete(term) {
    return this.post('/content/personalizations-auto', {
      search: term,
      permUserId: this.authService.getCurrentUser().userId
    });
  }

  getActivities(data){
    return this.post('/content/get-activities', data);
  }

  getPersonalizationsDetails(id) {
    return this.post('/content/get-personalizations-details', { id });
  }

  createPersonalizations(params) {
    return this.post('/content/create-personalizations', params);
  }

  updatePersonalizations(params) {
    return this.post('/content/update-personalizations', params);
  }

  deletePersonalizations(ids) {
    return this.post('/content/delete-personalizations', { ids: ids, permUserId: this.authService.getCurrentUser().userId });
  }

  getQuoteOrderPersonalizations(orderId, lineItemId) {
    return this.post('/content/get-quote-order-personalizations', { id : orderId, lineItemId : lineItemId });
  }

  getPortalLevelQuoteToken(orderId, reset) {
    return this.post('/content/get-portal-level-quote-token', { id : orderId, reset : reset});
  }
  getArInvoiceLegacyOrderDetails(invoiceId) {
    return this.post('/content/get-ar-invoice-legacy-order-details', { id : invoiceId});
  }
  updateQuoteOrderPersonalizations(params) {
    return this.post('/content/update-quote-order-personalizations', params);
  }

  // Training Video API
  getTrainingList(params) {
    return this.post('/content/get-training-list', params);
  }

  getTrainingListOnly() {
    return this.get('/content/get-training-list-only');
  }

  getTrainingCount(params) {
    return this.post('/content/get-training-count', params);
  }

  getTrainingDetail(id) {
    return this.post('/content/get-training-details', { id });
  }

  updateTraining(params) {
    return this.post('/content/update-training', params);
  }

  createTraining(params) {
    return this.post('/content/create-training', params);
  }

  syncTraining(params) {
    return this.post('/content/sync-training', params);
  }

  //Purchase Orders
  getPurchaseOrders(expansion?: Array<string> | POFilters,
    currentPage?: number, perPage?: number){
    let url: string = "/api/v2/purchase-orders";
    if (expansion && Array.isArray(expansion)){
      url += "?expand=";
      expansion.forEach((el, i) => {
        url += el
        if (i < expansion.length - 1) url += ","
      })
    } else {
      let empty = true;
      for (let key in expansion){
        if (expansion[key].length > 0){
          if (empty) {
            url += "?filter";
            empty = false;
            url += key !== "status" && key !== "vendor" && key !== "hidden" ? `[${key}][like]=${expansion[key]}` : `[${key}]=${expansion[key]}`;
          }
          if (!url.includes(key)) url += key !== "status" && key != "vendor" && key !== "hidden" ? `&filter[${key}][like]=${expansion[key]}` : `&filter[${key}]=${expansion[key]}`;
        }
      }
    }
    if (currentPage) url += url.includes('?') ? `&page=${currentPage}` : `?page=${currentPage}`;
    if (perPage) url += `&per-page=${perPage}`;
    console.log("url", url);
    return this.get(url);
  }

  getPurchaseOrder(purchaseOrderId: String){
    return this.get(`/api/v2/purchase-orders/${purchaseOrderId}?expand=contactInformation,lineItems,taxInformation`);
  }

  getPurchaseNeeds(filters: PNFilters, currentPage: number, perPage: number){
    let url: string = "/api/v2/purchase-needs?filter[status]=Pending,Partial";
    let empty = true;
    for (let key in filters){
      if (filters[key].length > 0){
        // if (empty){
        //   url += "?filter";
        //   empty = false;
        //   url += key !== "vendor" ? `[${key}][like]=${filters[key]}` : `[${key}]=${filters[key]}`;
        // }
        if (!url.includes(key)) url += `&filter[${key}]=${filters[key]}`;
      }
    }
    url += url.includes('?') ? `&page=${currentPage}` : `?page=${currentPage}`;
    url += `&per-page=${perPage}`;
    console.log("purchaseNeed url", url)
    return this.get(url);
  }

  getPurchaseNeedsByProduct(filters: PNPFilters){
    let url: string =
      "/api/v2/purchase-needs?products=true&filter[status]=Pending,Partial";
    for (let key in filters){
      if (filters[key].length > 0 && !Array.isArray(filters[key])){
        if (!url.includes(key)) url += `&filter[${key}]=${filters[key]}`;
      }
      if (filters[key].length > 0 && Array.isArray(filters[key])){
        console.log("filters", filters);
        // console.log("value", filters[key]);
        // (filters[key]).forEach(el => {
        //   console.log("element", el);

        // })
        url += `&filter[refSalesOrderNo]=${filters[key]}`;
      }
    }
    //url += `&page=${currentPage}&per-page=${perPage}`;
    console.log("product purchase need url", url);
    return this.get(url);
  }

  getPurchaseNeedsByProductIds(productIds: number[], filters: PNPFilters, sort?){
    if (!productIds.length) return of([]);
    console.log("productIds in method", productIds);
    let url = "/api/v2/purchase-needs?filter[status]=Pending,Partial";
    url += `&filter[productId]=${productIds}`;
    for (let key in filters) {
      if (filters[key].length > 0 && !Array.isArray(filters[key])) {
        if (!url.includes(key)) url += `&filter[${key}]=${filters[key]}`;
      }
      if (filters[key].length > 0 && Array.isArray(filters[key])) {
        console.log("filters", filters);
        // console.log("value", filters[key]);
        // (filters[key]).forEach(el => {
        //   console.log("element", el);

        // })
        url += `&filter[refSalesOrderNo]=${filters[key]}`;
      }

    }
    if (sort) {
      url += `&filter[order]=${sort.active}&filter[orient]=${sort.direction}`
    }
    console.log("products by productId", url);
    return this.get(url);
  }

  getPurchaseNeedsByProductId(productId: number, filters: PNPFilters, currentPage: number, perPage: number){
    let url = `/api/v2/purchase-needs?filter[productId]=${productId}&filter[status]=Pending,Partial`;
    url += `&page=${currentPage}&per-page=${perPage}`;
    for (let key in filters) {
      if (filters[key].length > 0 && !Array.isArray(filters[key])) {
        if (!url.includes(key)) url += `&filter[${key}]=${filters[key]}`;
      }
      if (filters[key].length > 0 && Array.isArray(filters[key])) {
        console.log("filters", filters);
        // console.log("value", filters[key]);
        // (filters[key]).forEach(el => {
        //   console.log("element", el);

        // })
        url += `&filter[refSalesOrderNo]=${filters[key]}`;
      }
    }
    console.log("pa by productId", url);
    return this.get(url);
  }

  createPurchaseOrderNeed(orderId)
  {
        return this.post('/api/v2/purchase-needs/sales-order-need', {id:orderId});
  }

  calculateCost(variation, decoration){
    const url = "/api/v2/purchase-needs/apply-price-break";
    const data = {
      variation,
      decoration
    };
    return this.post(url, data);
  }

  getOrderNumbersOfNeeds(){
    const url = "/api/v2/purchase-needs/list-need-sales-orders";
    return this.get(url);
  }

  getOrderNumbersAutocomplete(orderNum){
    const url = "/api/v2/purchase-needs/list-need-sales-orders";
    const data = {
      orderNo: orderNum
    };
    return this.post(url, data);
  }

  createPurchaseOrders(po){
    const url = "/api/v2/purchase-needs/create-po-from-needs";
    const data = { po };
    return this.post(url, data);
  }

  updatePurchaseOrder(id: string, data){
    const url = `/api/v2/purchase-orders/${id}`;
    return this.put(url, data);
  }

  editShippingDetails(data){
    const url = "/api/v2/purchase-orders/update-ship-info";
    return this.post(url, data);
  }

  changeVendor(data){
    const url = "/api/v2/purchase-orders/update-vendor";
    return this.post(url, data);
  }

  getProductsTotal(productIds: number[], inventory: string){
    const url = `/api/v2/purchase-needs/totals`;
    return this.post(url, {
      "products": true,
      "filter": {
        "order": "",
        "orient": "",
        "customer": "",
        "vendor": "",
        "status": "Pending, Partial",
        "refSalesOrderNo": "",
        "name": "",
        "supplierProductId": "",
        "productId": `${productIds}`,
        "description": "",
        inventory,
        "id": ""
      }
    });
  }

  getNeedsTotal(needsIds: number[]){
    const url = `/api/v2/purchase-needs/totals?filter[id]=${needsIds}`;
    return this.post(url, {
      "products": false,
      "filter": {
        "order": "",
        "orient": "",
        "customer": "",
        "vendor": "",
        "status": "",
        "refSalesOrderNo": "",
        "name": "",
        "supplierProductId": "",
        "productId": "",
        "description": "",
        "id": `${needsIds}`
      }
    });
  }

  // Ar-Invoice
  createPendingInvoice(orderId){
    const url = "/api/v1/orders/invoice";
    return this.post(url, orderId);
  }

  getFinalInvoices(filters: IFilters, page: number, perPage: number){
    let url = "/api/v1/ar-invoices?expand=shipTo,billTo,lineItems,salesOrders&sort=-label";
    url += `&page=${page}&per-page=${perPage}`;
    return this.get(url);
  }

  getInvoiceDetails(invoiceId: string){
    const url = `/api/v1/ar-invoices/${invoiceId}?expand=lineItems,salesOrders,shipTo,billTo`;
    return this.get(url);
  }

  updateInvoice(invoiceId: string, data){
    const url = `/api/v1/ar-invoices/${invoiceId}`;
    return this.put(url, data);
  }

  getPendingInvoices(filters: InvoiceFilters, currentPage: number = 1, perPage: number = 100){
    let url: string = `/api/v1/ar-invoices/pending?page=${currentPage}&per-page=${perPage}&expand=salesOrders`;
    for (let key in filters){
      if (filters[key].length > 0){
        url += `&filter[${key}]=${filters[key]}`;
      }
    }
    console.log("getPendingInvoice url", url);
    return this.get(url);
  }

  fetchLineItemsByInvoiceIds(currentPage: number, perPage: number, filters: LineItemFilters, invoiceIds: string[], deselect: boolean){
    let url = `/api/v1/ar-invoices/line-items?page=${currentPage}&per-page=${perPage}&invoiceIds=${invoiceIds}&deselect=${deselect}`;
    for (let key in filters) {
      if (filters[key].length > 0) {
        url += `&filter[${key}]=${filters[key]}`;
      }
    }
    console.log("fetch line items url", url);
    return this.get(url);
  }

  checkVendorHasPromoStandards(vendorId: string){
    const url = `/api/v2/services/check-endpoint?entity=Purchase Order&vendorId=${vendorId}`;
    return this.get(url);
  }

  submitPOUsingPromoStandards(purchaseOrderId: string, user: string){
    const url = `/api/v2/services/trigger-entity-submission?entity=Purchase Order&entityId=${purchaseOrderId}&user=${user}`;
    return this.get(url);
  }

  createSummaryInvoices(payload: SummaryInvoicePayload){
    return this.put("/api/v1/ar-invoices/summary?expand=lineItems", payload)
  }

// Currency
  getCurrencyListForDropDownDOnly() {
    return this.get('/content/get-currency-list');
  }

  processOrderExchangeRate(id){
    return this.post("/content/proccess-quote-order-exchange-rate", id);
  }



  createCurrency(currencyItem: CurrencyItem){
    const url = `/content/create-currency`;
    return this.post(url, currencyItem);
  }

  updateCurrency(currencyItem: CurrencyItem){
    const url = `/content/update-currency`;
    return this.post(`/content/update-currency`, currencyItem);
  }

  deleteCurrency(currencyIds){
    const url = "/content/delete-currency"
    return this.post(url, currencyIds);
  }

  getCurrencyDetails(currencyId: string){
    return this.post("/content/get-currency-details", currencyId);
  }

  getCurrencyConfiguration(){
    return this.post("/content/get-advance-system-config-all", { "module": "Currency" });
  }

  changeCurrencyConfiguration({ autoUpdateCurrency, baseCurrency, enableCurrency, ratePadding }){
    return this.post("/content/update-advance-system-config-all", {
      module: "Currency",
      settings: { autoUpdateCurrency, baseCurrency, enableCurrency, ratePadding }
    });
  }

  getCurrencyCodes(){
    return this.get("/content/get-currency-codes");
  }

  createExchangeRate(data){
    return this.post("/content/create-exchange-rate", data);
  }

  updateExchangeRate(data){
    return this.post("/content/update-exchange-rate", data)
  }

  getExchangeRateList(){
    return this.post("/content/get-exchange-rate-list", {
      "offset": 0,
      "order": "dateCreated",
      "orient": "desc",
      "term": {}
    });
  }

  deleteExchangeRate(data){
    return this.post("/content/delete-exchange-rate", data)
  }

  syncAllExchangeRate(){
    return this.post("/content/sync-exchange-rate", { "syncall": "1" });
  }

  syncIdsExchangeRate(data){
    return this.post("/content/sync-exchange-rate", data);
  }
  //updateSimpleQuoteContents is being used to update the simple quote content

  updateSimpleQuoteContents(data){
    return this.post("/content/update-simple-quote-contents", data);
  }
  //updateWorkOrderBoxLabels is being used to update the box label qty details for work order

  updateWorkOrderBoxLabels(data){
    return this.post("/content/update-work-order-box-labels", data);
  }

  //updateWorkOrderDetails is being used to update the details of decoration and variation for production job

  updateWorkOrderDetails(data){
    return this.post("/content/update-work-order-details", data);
  }


  getReceivingWidgetData(data){
    return this.post("/widget/get-receiving-widgets", data);
  }

  getExecutiveWidgetData(data){
    return this.post("/widget/get-executive-widgets", data);
  }

  getArtworkTypeWidgetData(data){
    return this.post("/widget/get-artwork-type-widgets", data);
  }

  downloadProductTempalte(data){
    return this.post("/content/get-product-template", data);
  }

  downloadCommissionPlansTempalte(data){
    return this.post("/content/get-commission-plans-template", data);
  }

  downloadUsersTemplate(data){
    return this.post("/content/get-users-template", data);
  }
  
  downloadOpportunitiesTemplate(data){
    return this.post("/content/get-opportunities-template", data);
  }

  deleteShippingInfo(data) {
    return this.post('/content/delete-shipping-info', data);
  }

  cloneCommissions(ids) {
    return this.post('/content/clone-commission-plan', { ids: ids });
  }

  getPricingMethodsListForAccount(){
    return this.post("/content/get-pricing-methods-list", {
      "offset": 0,
      "order": "id",
      "orient": "asc",
      "term": {}
    });
  }
  uploadFaqToFileManger(data) {
    return this.post('/content/upload-faq-image', data);
  }

  downloadAccountsTempalte(){
    return this.post("/content/get-accounts-template", {});
  }

  downloadContactsTemplate(){
    return this.post("/content/get-contacts-template", {});
  }

  downloadAdditionalChargesTemplate(){
    return this.post("/content/get-addon-charges-template", {});
  }

  downloadDecoLocationsTemplate(){
    return this.post("/content/get-deco-locations-template", {});
  }

  downloadDecoChargesTemplate(){
    return this.post("/content/get-deco-charges-template", {});
  }

  downloadArtworksTemplate(){
    return this.post("/content/get-artworks-template", {});
  }

  downloadLeadsTemplate(){
    return this.post("/content/get-leads-template", {});
  }

  downloadWarehouseTemplate(){
    return this.post("/content/get-warehouse-template", {});
  }

  addModuleTags(data) {
    return this.post("/content/add-module-tags", data);
  }
  createCommissionAdjustment(data) {
    return this.post('/content/create-commission-adjustment', data);
  }
  getCommissionAdjustmentsList(params) {
    return this.post('/content/get-commission-adjustment-list', params);
  }

  getCommissionAdjustmentsCount(params) {
    return this.post('/content/get-commission-adjustment-count', params);
  }

  getCommissionAdjustmentDetail(id) {
    return this.post('/content/get-commission-adjustment-details', { id: id });
  }

  deleteCommissionAdjustments(ids) {
    return this.post('/content/delete-commission-adjustment', { ids: ids });
  }

  updateCommissionAdjusmtent(data) {
    return this.post('/content/update-commission-adjustment', data);
  }

  getPaymentMethods(params) {
    return this.post('/content/get-payment-method-list', params);
  }

  updatePaymentMethodStatus(data) {
    console.log("data",data)
    return this.post('/content/update-payment-method-status', data);
  }

  createPaymentMethod(data) {
    console.log("data",data)
    return this.post('/content/create-payment-method', data);
  }

  updatePaymentMethod(data) {
    return this.post('/content/update-payment-method', data);
  }

  deletePaymentMethod(data) {
    return this.post('/content/delete-payment-method', data);
  }

  getPaymentMethodsList() {
    return this.post('/content/get-enable-payment-methods-list',{});
  }

  getTeamWorkAPICustomer(email) {
    return this.post('/content/get-team-work-api-customer',{'email':email});
  }
  getTeamWorkAPICustomersTickets(id) {
    return this.post('/content/get-team-work-api-customers-tickets',{'id':id});
  }
}
