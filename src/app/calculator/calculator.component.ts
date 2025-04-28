import { Component } from '@angular/core';
import { ProfitLossComponent } from "../profit-loss/profit-loss.component";
import { TargetPriceComponent } from "../target-price/target-price.component";
import { LiquidationPriceComponent } from "../liquidation-price/liquidation-price.component";
import { MaxOpenComponent } from "../max-open/max-open.component";
import { OpenPriceComponent } from "../open-price/open-price.component";
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [ProfitLossComponent, TargetPriceComponent, LiquidationPriceComponent, MaxOpenComponent, OpenPriceComponent, NgIf],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.css'
})
export class CalculatorComponent {
  activeTab: 'profit-loss' | 'target-price' | 'liquidation-price' | 'max-open' | 'open-price' = 'profit-loss';

  selectTab(tab: 'profit-loss' | 'target-price' | 'liquidation-price' | 'max-open' | 'open-price') {
    this.activeTab = tab;
  }
}
