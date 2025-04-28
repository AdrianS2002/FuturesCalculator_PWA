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
  menuOpen: boolean = false;
  activeTab: 'profit-loss' | 'target-price' | 'liquidation-price' | 'max-open' | 'open-price' = 'profit-loss';

  selectTab(tab: 'profit-loss' | 'target-price' | 'liquidation-price' | 'max-open' | 'open-price') {
    this.activeTab = tab;
    this.menuOpen = false;
  }

  get activeTabTitle(): string {
    switch (this.activeTab) {
      case 'profit-loss': return 'Profit & Loss';
      case 'target-price': return 'Target Price';
      case 'liquidation-price': return 'Liquidation Price';
      case 'max-open': return 'Max Open';
      case 'open-price': return 'Open Price';
      default: return '';
    }
  }
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
