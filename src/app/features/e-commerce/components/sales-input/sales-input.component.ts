import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { OrderDetails } from '../../../../models';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-sales-input',
  templateUrl: './sales-input.component.html',
  styleUrls: ['./sales-input.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class SalesInputComponent implements OnInit {

  @Input()   order: OrderDetails;
  salesInputForm: FormGroup;

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

  palletList = ['45.00','40.00','35.00','29.00','0.00'];

  constructor(private msg: MessageService) { 
    
  }

  ngOnInit() {
    this.salesInputForm = new FormGroup({

      // REVENUES
      quantities: new FormArray(this.salesInputData.revenue.quantities.map(quantity => new FormControl(quantity))),
      unitPrices: new FormArray(this.salesInputData.revenue.unitPrices.map(price => new FormControl(price))),
      toolings: new FormArray(this.salesInputData.revenue.toolings.map(tooling => new FormControl(tooling))),
      setupColorMatches: new FormArray(this.salesInputData.revenue.setupColorMatches.map(colorMatch => new FormControl(colorMatch))),
      thidPartyInspections: new FormArray(this.salesInputData.revenue.thidPartyInspections.map(inspection => new FormControl(inspection))),
      surfaceLeadTests: new FormArray(this.salesInputData.revenue.surfaceLeadTests.map(leadTest => new FormControl(leadTest))),
      addtionalTestings: new FormArray(this.salesInputData.revenue.addtionalTestings.map(addtionalTest => new FormControl(addtionalTest))),
      optionalCharges: new FormArray(this.salesInputData.revenue.optionalCharges.map(charge => new FormControl(charge))),
      oceanFreights: new FormArray(this.salesInputData.revenue.oceanFreights.map(oceanFreight => new FormControl(oceanFreight))),
      overseasAirFreights: new FormArray(this.salesInputData.revenue.overseasAirFreights.map(airFreight => new FormControl(airFreight))),
      unloadingDevanningPalletizins: new FormArray(this.salesInputData.revenue.unloadingDevanningPalletizins.map(palletizin => new FormControl(palletizin))),
      inlandFreights: new FormArray(this.salesInputData.revenue.inlandFreights.map(inlandFreight => new FormControl(inlandFreight))),
      fullfillments: new FormArray(this.salesInputData.revenue.fullfillments.map(fullfillment => new FormControl(fullfillment))),
      deliveryMgmtFees: new FormArray(this.salesInputData.revenue.deliveryMgmtFees.map(deliveryMgmtFee => new FormControl(deliveryMgmtFee))),

      // COSTS
      unitCosts: new FormArray(this.salesInputData.cost.unitCosts.map(unitCost => new FormControl(unitCost))),
      costToolings: new FormArray(this.salesInputData.cost.toolings.map(unitCost => new FormControl(unitCost))),
      costSetupColorMatches: new FormArray(this.salesInputData.cost.setupColorMatches.map(unitCost => new FormControl(unitCost))),
      greaterChinaInspection: new FormArray(this.salesInputData.cost.greaterChinaInspection.map(unitCost => new FormControl(unitCost))),
      testingCosts: new FormArray(this.salesInputData.cost.testingCosts.map(unitCost => new FormControl(unitCost))),
      costThidPartyInspections: new FormArray(this.salesInputData.cost.thidPartyInspections.map(unitCost => new FormControl(unitCost))),
      blankLCCharges: new FormArray(this.salesInputData.cost.blankLCCharges.map(unitCost => new FormControl(unitCost))),
      sampleCosts: new FormArray(this.salesInputData.cost.sampleCosts.map(unitCost => new FormControl(unitCost))),
      miscellaneous: new FormArray(this.salesInputData.cost.miscellaneous.map(unitCost => new FormControl(unitCost))),
      piecesPerCarton: new FormArray(this.salesInputData.cost.piecesPerCarton.map(unitCost => new FormControl(unitCost))),
      sizesOfCartons: new FormArray(this.salesInputData.cost.sizesOfCartons.map(unitCost => new FormControl(unitCost))),

      totalOceanCosts: new FormArray(this.salesInputData.cost.totalOceanCosts.map(data => new FormControl(data))),
      grossWeightPerCarton: new FormArray(this.salesInputData.cost.grossWeightPerCarton.map(data => new FormControl(data))),
      airCostPerKG: new FormArray(this.salesInputData.cost.airCostPerKG.map(data => new FormControl(data))),
      dutyRate: new FormArray(this.salesInputData.cost.dutyRate.map(data => new FormControl(data))),
      pricePerPalletDropDownList: new FormArray(this.salesInputData.cost.pricePerPalletDropDownList.map(data => new FormControl(data))),
      brokerageUnits: new FormArray(this.salesInputData.cost.brokerageUnits.map(data => new FormControl(data))),
      costFullfillments: new FormArray(this.salesInputData.cost.costFullfillments.map(data => new FormControl(data))),
      lclInlandFreightPerCBM: new FormArray(this.salesInputData.cost.lclInlandFreightPerCBM.map(data => new FormControl(data))),

      rebate: new FormArray(this.salesInputData.cost.rebate.map(data => new FormControl(data))),
      ccFinanceTax: new FormArray(this.salesInputData.cost.ccFinanceTax.map(data => new FormControl(data))),

    });
  }

  // REVENUES
  get quantities(): FormArray { return this.salesInputForm.controls.quantities as FormArray; }
  get unitPrices(): FormArray { return this.salesInputForm.controls.unitPrices as FormArray; }
  get toolings(): FormArray { return this.salesInputForm.controls.toolings as FormArray; }
  get setupColorMatches(): FormArray { return this.salesInputForm.controls.setupColorMatches as FormArray; }
  get thidPartyInspections(): FormArray { return this.salesInputForm.controls.thidPartyInspections as FormArray; }
  get surfaceLeadTests(): FormArray { return this.salesInputForm.controls.surfaceLeadTests as FormArray; }
  get addtionalTestings(): FormArray { return this.salesInputForm.controls.addtionalTestings as FormArray; }
  get optionalCharges(): FormArray { return this.salesInputForm.controls.optionalCharges as FormArray; }
  get oceanFreights(): FormArray { return this.salesInputForm.controls.oceanFreights as FormArray; }
  get overseasAirFreights(): FormArray { return this.salesInputForm.controls.overseasAirFreights as FormArray; }
  get unloadingDevanningPalletizins(): FormArray { return this.salesInputForm.controls.unloadingDevanningPalletizins as FormArray; }
  get inlandFreights(): FormArray { return this.salesInputForm.controls.inlandFreights as FormArray; }
  get fullfillments(): FormArray { return this.salesInputForm.controls.fullfillments as FormArray; }
  get deliveryMgmtFees(): FormArray { return this.salesInputForm.controls.deliveryMgmtFees as FormArray; }
  
  // COSTS
  get unitCosts(): FormArray { return this.salesInputForm.controls.unitCosts as FormArray; }
  get costToolings(): FormArray { return this.salesInputForm.controls.costToolings as FormArray; }
  get costSetupColorMatches(): FormArray { return this.salesInputForm.controls.costSetupColorMatches as FormArray; }
  get greaterChinaInspection(): FormArray { return this.salesInputForm.controls.greaterChinaInspection as FormArray; }
  get testingCosts(): FormArray { return this.salesInputForm.controls.testingCosts as FormArray; }
  get costThidPartyInspections(): FormArray { return this.salesInputForm.controls.costThidPartyInspections as FormArray; }
  get blankLCCharges(): FormArray { return this.salesInputForm.controls.blankLCCharges as FormArray; }
  get sampleCosts(): FormArray { return this.salesInputForm.controls.sampleCosts as FormArray; }
  get miscellaneous(): FormArray { return this.salesInputForm.controls.miscellaneous as FormArray; }
  get piecesPerCarton(): FormArray { return this.salesInputForm.controls.piecesPerCarton as FormArray; }
  get sizesOfCartons(): FormArray { return this.salesInputForm.controls.sizesOfCartons as FormArray; }

  get totalOceanCosts(): FormArray { return this.salesInputForm.controls.totalOceanCosts as FormArray; }
  get grossWeightPerCarton(): FormArray { return this.salesInputForm.controls.sizesOfCartons as FormArray; }
  get airCostPerKG(): FormArray { return this.salesInputForm.controls.airCostPerKG as FormArray; }
 
  get dutyRate(): FormArray { return this.salesInputForm.controls.dutyRate as FormArray; }
  get pricePerPalletDropDownList(): FormArray { return this.salesInputForm.controls.pricePerPalletDropDownList as FormArray; }

  get brokerageUnits(): FormArray { return this.salesInputForm.controls.brokerageUnits as FormArray; }
  get costFullfillments(): FormArray { return this.salesInputForm.controls.costFullfillments as FormArray; }
  get lclInlandFreightPerCBM(): FormArray { return this.salesInputForm.controls.lclInlandFreightPerCBM as FormArray; }
  get rebate(): FormArray { return this.salesInputForm.controls.rebate as FormArray; }
  get ccFinanceTax(): FormArray { return this.salesInputForm.controls.ccFinanceTax as FormArray; }

  getTotalPrice(index: number) {
    return (this.quantities.value[index]) * parseFloat(this.unitPrices.value[index]);
  }

  getTotalRevenue(index: number) {
    return this.getTotalPrice(index) + 
          parseFloat(this.toolings.value[index]) +
          parseFloat(this.setupColorMatches.value[index]) +
          parseFloat(this.thidPartyInspections.value[index]) +
          parseFloat(this.surfaceLeadTests.value[index]) +
          parseFloat(this.addtionalTestings.value[index]) +
          parseFloat(this.optionalCharges.value[index]) +
          parseFloat(this.oceanFreights.value[index]) +
          parseFloat(this.overseasAirFreights.value[index]) +
          parseFloat(this.unloadingDevanningPalletizins.value[index]) +
          parseFloat(this.inlandFreights.value[index]) +
          parseFloat(this.fullfillments.value[index]) +
          parseFloat(this.deliveryMgmtFees.value[index]);
  }

  getGrossProfit(index: number) {
    if (parseFloat(this.unitPrices.value[index]) > 0)
      return this.getTotalRevenue(index) - this.getTotalCosts(index);
    return 0.00;
  }

  getDDPMargin(index: number) {
    if (parseFloat(this.unitPrices.value[index]) > 0)
    {
      if (this.getTotalRevenue(index) <= 0.00)
       return "";
      return this.getGrossProfit(index) / this.getTotalRevenue(index) * 100.00;
    }
    return 0.00;
  }

  getTotalCarton(index: number) {
    return parseFloat(this.quantities.value[index]) / parseFloat(this.piecesPerCarton.value[index]);
  }

  getTotalCBM(index: number) {
    return this.getTotalCarton(index) * parseFloat(this.sizesOfCartons.value[index]);
  }

  getUnitCost(index: number) {
    return parseFloat(this.quantities.value[index]) * parseFloat(this.unitCosts.value[index]);
  }

  getUnitOceanCost(index: number) {
    if (parseFloat(this.quantities.value[index]) > 0)
      return  (this.totalOceanCosts.value[index]) / parseFloat(this.quantities.value[index]);
    return 0.00;
  }

  getTotalActualWeight(index: number) {
    return parseFloat(this.totalOceanCosts.value[index]) * parseFloat(this.grossWeightPerCarton.value[index]);
  }

  getTotalDIMWeight(index: number) {
    return this.getTotalCBM(index) / 0.006;
  }

  getAirCostActualWeight(index: number) {
    return this.getTotalActualWeight(index) * parseFloat(this.airCostPerKG.value[index]);
  }

  getAirCostDIMWeight(index: number) {
    return this.getTotalDIMWeight(index) * parseFloat(this.airCostPerKG.value[index]);
  }

  getCostsForAirFreight(index: number) {
    if (this.getAirCostActualWeight(index) > this.getAirCostDIMWeight(index))
      return this.getAirCostActualWeight(index);
    return this.getAirCostDIMWeight(index);
  }

  getShippingInsurance(index: number) {
    if (this.getTotalRevenue(index) > 0)
      return this.getTotalRevenue(index) * 0.001;
    return 0.00;
  }

  getTotalDuty(index: number) {
    return parseFloat(this.dutyRate.value[index]) / 100.00 * this.getUnitCost(index);
  }

  getPalletizingCost(index: number) {
    if (this.getTotalCBM(index) >= 1)
      return (this.getTotalCBM(index) / 2) * parseFloat(this.pricePerPalletDropDownList.value[index]);
    return 0.00
  }

  getBrokerageUnit(index: number) {
    return parseFloat(this.brokerageUnits.value[index]) * 190.00;
  }

  getInlandFreight(index: number) {
    return this.getTotalCBM(index) * parseFloat(this.lclInlandFreightPerCBM.value[index]);
  }

  getTotalRebate(index: number) {

    let totalRebate =  (parseFloat(this.rebate.value[index]) / 100.00) * 
    (this.getTotalRevenue(index) - 
        (parseFloat(this.costToolings.value[index]) +
         parseFloat(this.costSetupColorMatches.value[index]) +
         parseFloat(this.greaterChinaInspection.value[index]) +
         parseFloat(this.testingCosts.value[index]) +
         parseFloat(this.costThidPartyInspections.value[index]) + 
         parseFloat(this.sampleCosts.value[index]) +
         parseFloat(this.blankLCCharges.value[index]) +
         parseFloat(this.miscellaneous.value[index]) +
         this.getCostsForAirFreight(index) +
         this.getShippingInsurance(index) +
         this.getTotalDuty(index) +
         this.getPalletizingCost(index) +
         this.getBrokerageUnit(index) +
         parseFloat(this.costFullfillments.value[index]) +
         parseFloat(this.lclInlandFreightPerCBM.value[index]) +
         this.getInlandFreight(index)
        ));
    return totalRebate;
  }

  getTotalCCFinanceTax(index: number) {
    return this.getTotalRevenue(index) * (parseFloat(this.ccFinanceTax.value[index]) / 100.00);
  }

  getTotalFianceRebateCharges(index: number) {
    return this.getTotalRebate(index) + this.getTotalCCFinanceTax(index);
  }

  getTotalCosts(index: number) {
    return this.getUnitCost(index) +
           parseFloat(this.costToolings.value[index]) +
           parseFloat(this.costSetupColorMatches.value[index]) +
           parseFloat(this.greaterChinaInspection.value[index]) +
           parseFloat(this.testingCosts.value[index]) +
           parseFloat(this.costThidPartyInspections.value[index]) +
           parseFloat(this.sampleCosts.value[index]) +
           parseFloat(this.blankLCCharges.value[index]) +
           parseFloat(this.miscellaneous.value[index]) +
           parseFloat(this.totalOceanCosts.value[index]) +
           this.getCostsForAirFreight(index) +
           this.getShippingInsurance(index) +
           this.getTotalDuty(index) +
           this.getPalletizingCost(index) +
           this.getBrokerageUnit(index) +
           parseFloat(this.costFullfillments.value[index]) +
           this.getInlandFreight(index) +
           this.getTotalFianceRebateCharges(index);
  }

  getTotalUnitCost(index: number) {
    if (parseFloat(this.quantities.value[index]) > 0)
      return this.getTotalCosts(index) / parseFloat(this.quantities.value[index]);
    return 0.00;
  }

  save() {
    if (this.salesInputForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
  }

  
}
