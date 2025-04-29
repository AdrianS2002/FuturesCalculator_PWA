import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PairPriceService } from '../services/pairPrice.service';

@Component({
  selector: 'app-profit-loss',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './profit-loss.component.html',
  styleUrl: './profit-loss.component.css'
})
export class ProfitLossComponent {

  @Input() selectedPair!: string;
  isLong = true;
  leverage = 20;
  entryPrice!: number;
  exitPrice!: number;
  quantity!: number;
  profitLoss: number | null = null;
  initialMargin: number | null = null;
  roi: number | null = null;

  constructor(private pairPriceService: PairPriceService) { }

  selectPosition(position: 'long' | 'short') {
    this.isLong = (position === 'long');
  }

  get baseCurrency(): string {
    return this.selectedPair?.substring(0, 3).toUpperCase() || '---';
  }
  
  get quoteCurrency(): string {
    return this.selectedPair?.substring(3).toUpperCase() || '---';
  }

  getPrice(target: 'entry' | 'exit') {
    if (!this.selectedPair) return;

    this.pairPriceService.getCurrentPrice(this.selectedPair).subscribe({
      next: (price) => {
        if (target === 'entry') {
          this.entryPrice = price;
        } else if (target === 'exit') {
          this.exitPrice = price;
        }
      },
      error: (error) => console.error('Error fetching price:', error)
    });
  }

  calculatePnL() {
    if (!this.entryPrice || !this.exitPrice || !this.quantity || !this.leverage) return;

    let pnl = 0;
    if (this.isLong) {
      pnl = (this.exitPrice - this.entryPrice) * this.quantity;
    } else {
      pnl = (this.entryPrice - this.exitPrice) * this.quantity;
    }

    const initialMargin = (this.entryPrice * this.quantity) / this.leverage;
    const roi = (pnl / initialMargin) * 100;

    this.initialMargin = parseFloat(initialMargin.toFixed(2));
    this.profitLoss = parseFloat(pnl.toFixed(2));
    this.roi = parseFloat(roi.toFixed(2));
  }

}
