export interface PricingMethodInterface {
    costRange: Array<CostInterface>;
    createdById: string;
    createdByName: string;
    dateEntered: Date;
    dateModified: Date;
    description: string;
    id: string;
    modifiedById: string;
    modifiedByName: string;
    name: string;
    percentage: string;
    quantityRange: Array<any>;
    type: string;
  }

  export interface CostInterface {
    cost: string;
    margin: string;
  }

  export interface PricingLevelInterface {
    costRange: Array<any>;
    createdById: string;
    createdByName: string;
    dateEntered: string;
    dateModified: string;
    description: string;
    id: string;
    modifiedById: string;
    modifiedByName: string;
    name: string;
    percentage: string;
    quantityRange: Array<any>;
    type: string;
  }
  
  export interface NewPricingLevelResponseInterface {
    extra: PricingLevelInterface;
    msg: string;
    status: string;
  }

  export interface PricingCostRangeInterface {
    cost: string;
    operator: string;
    marginDetails: PricingMarginDetailsInterface[];
  }
  export interface PricingMarginDetailsInterface {
    qty: string;
    margin: string;
  }
  export interface PricingMethodBreaksInterface {
      'name': string;
      'dateEntered': string;
      'dateModified': string;
      'description': string;
      'createdByName': string;
      'createdById': string;
      'modifiedByName': string;
      'modifiedById': string;
      'type': string;
      'percentage': string;
      'costRange': PricingCostRangeInterface[];
      'quantityRange': Array<any>;
  }

  export interface UpdatePricingMethodBreaksInterface {
    'id': string;
    'name': string;
    'dateEntered': string;
    'dateModified': string;
    'description': string;
    'createdByName': string;
    'createdById': string;
    'modifiedByName': string;
    'modifiedById': string;
    'type': string;
    'percentage': string;
    'costRange': PricingCostRangeInterface[];
    'quantityRange': Array<any>;
  }

  export enum Operator {
    'LESS_THAN' = 'LESS_THAN',
    'GREATER_THAN' = 'GREATER_THAN',
    'EQUAL' = 'EQUAL'
  }

  export interface SinglePricingRow {
    name: string;
    type: string;
    range: string;
    operator: string;
    id: string;
    methodType: string;
    marginDetailQty: string;
    marginDetailMargin: string;
    percentage: string;
    quantityRange: Array<any>;
  }

  export interface UpdateCostRangeInterface {
    margin: string;
    operator: string;
    percentage: string;
    qty: string;
    quantityRange: Array<any>;
    range: string;
    type: string;
  }

  export interface UpdatePricingLevelRange {
    id: string;
    name: string;
    range: string;
    rangeSet: Array<string>;
    type: string;
    operator: string;
    marginDetails: PricingMarginDetailsInterface[];
    percentage: string;
    quantityRange: Array<any>;
    method: any;
  }
