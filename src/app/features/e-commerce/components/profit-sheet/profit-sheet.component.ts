import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { OrderDetails } from '../../../../models';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-profit-sheet',
  templateUrl: './profit-sheet.component.html',
  styleUrls: ['./profit-sheet.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ProfitSheetComponent implements OnInit {

  @Input()   order: OrderDetails;
  profitSheetForm: FormGroup;
  
  salesInputData = {
    revenue: {
      quantities: ["5000","10000","20000","1","20000","0"],
      unitPrices: ['8.00','7.50','6.00','0.00','6.00','6.00'],
      toolings: ['0','0','0','0','0','0'],
      setupColorMatches: ['0','0','0','0','0','0'],
      thidPartyInspections: ['0','0','0','0','0','0'],
      surfaceLeadTests: ['0','0','0','0','0','0'],
      addtionalTestings: ['250','250','250','250','250','0'],
      optionalCharges: ['0','0','0','0','0','0'],
      oceanFreights: ['0','0','0','0','0','0'],
      overseasAirFreights: ['0','0','0','0','0','0'],
      unloadingDevanningPalletizins: ['0','0','0','0','0','0'],
      inlandFreights: ['0','0','0','0','0','0'],
      fullfillments: ['0','0','0','0','0','0'],
      deliveryMgmtFees: ['0','0','0','0','0','0']
    },
    cost: {
      unitCosts: ['8.00','7.50','6.00','0.00','6.00','6.00'],
      toolings: ['0','0','0','0','0','0'],
      setupColorMatches: ['0','0','0','0','0','0'],
      greaterChinaInspection: ['300','300','300','300','300','300'],
      testingCosts: ['250','250','250','250','250','0'],
      thidPartyInspections: ['0','0','0','0','0','0'],
      blankLCCharges: ['0','0','0','0','0','0'],
      sampleCosts: ['250','250','250','250','250','0'],
      miscellaneous: ['0','0','0','0','0','0'],      
      piecesPerCarton: ['24','24','24','1','24','1'],
      sizesOfCartons: ['0.04','0.04','0','0.04','0','0'],

      totalOceanCosts: ['1600','3200','4500','0','0','0'],
      unitOceanCosts: ['0.32','0.32','0.225','0','0.225','0'],
      grossWeightPerCarton: ['10.0','10.0','10.0','10.0','10.0','10.0'],
      airCostPerKG: ['0','0','0','0','0','0'],

      dutyRate: ['18.6','18.6','18.6','0.0','18.6','0.0'],
      pricePerPalletDropDownList: ['45.00','45.00','45.00','45.00','45.00','0.00'],

      brokerageUnits: ['1','1','1','1','1','0'],
      costFullfillments: ['0.00','0.00','0.00','0.00','0.00','0.00'],
      lclInlandFreightPerCBM: ['100','100','100','0','100','0'],

      rebate: ['5.00','5.00','5.00','0.00','5.00','0.00'],
      ccFinanceTax: ['3.0','3.0','3.0','0.0','3.0','0.0']
    }
  }


  profitSheetData = {
      income:{
        unitsSold: ["20000","0"],
        unitCostsSold: ['7.00','0.00'],
        domesticDeliveryAndFullfillment: '0.00',
        toolingAndTestingAndOtherChanges: '250.00',
        airFreight: '0.00',
        miscellaneousCharges: '0.00'
      }
    }

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {

    this.profitSheetForm = this.formBuilder.group({
      unitsSoldA            : [this.profitSheetData.income.unitsSold[0]],
      unitCostsSoldA        : [this.profitSheetData.income.unitCostsSold[0]],
      unitsSoldB            : [this.profitSheetData.income.unitsSold[1]],
      unitCostsSoldB        : [this.profitSheetData.income.unitCostsSold[1]],
      domesticDeliveryAndFullfillment : [this.profitSheetData.income.domesticDeliveryAndFullfillment],
      toolingAndTestingAndOtherChanges : [this.profitSheetData.income.toolingAndTestingAndOtherChanges],
      airFreight : [this.profitSheetData.income.airFreight],
      miscellaneousCharges : [this.profitSheetData.income.miscellaneousCharges],
    });
  }

  getTotalPriceItemA(){
    return parseFloat(this.profitSheetForm.get('unitsSoldA').value) * parseFloat(this.profitSheetForm.get('unitCostsSoldA').value);
  }

  getTotalPriceItemB(){
    return parseFloat(this.profitSheetForm.get('unitsSoldB').value) * parseFloat(this.profitSheetForm.get('unitCostsSoldB').value);
  }

  getDomesticDeliveryFulfillmentProjected(){
    return (parseFloat(this.salesInputData.revenue.oceanFreights[4]) + 
            parseFloat(this.salesInputData.revenue.unloadingDevanningPalletizins[4]) +
            parseFloat(this.salesInputData.revenue.inlandFreights[4]) +
            parseFloat(this.salesInputData.revenue.fullfillments[4]) +
            parseFloat(this.salesInputData.revenue.deliveryMgmtFees[4])) +
            parseFloat(this.salesInputData.revenue.quantities[4]) * parseFloat(this.salesInputData.revenue.unitPrices[4]) +
            parseFloat(this.salesInputData.revenue.quantities[5]) * parseFloat(this.salesInputData.revenue.unitPrices[5])
  }

  getToolingAndTestingAndOtherChangesProjected(){
    return (parseFloat(this.salesInputData.revenue.toolings[4]) + 
            parseFloat(this.salesInputData.revenue.setupColorMatches[4]) + 
            parseFloat(this.salesInputData.revenue.thidPartyInspections[4]) +
            parseFloat(this.salesInputData.revenue.surfaceLeadTests[4]) +
            parseFloat(this.salesInputData.revenue.addtionalTestings[4])) +

            (parseFloat(this.salesInputData.revenue.toolings[5]) + 
            parseFloat(this.salesInputData.revenue.setupColorMatches[5]) + 
            parseFloat(this.salesInputData.revenue.thidPartyInspections[5]) +
            parseFloat(this.salesInputData.revenue.surfaceLeadTests[5]) +
            parseFloat(this.salesInputData.revenue.addtionalTestings[5]))
  }

  calcRevenue(i) {
    return parseFloat(this.salesInputData.revenue.quantities[5]) *
           parseFloat(this.salesInputData.revenue.unitPrices[5]);
  }

  save() {
    
  }
}
