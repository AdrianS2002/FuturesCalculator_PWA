import { Component, Input } from '@angular/core';
import { PairPriceService } from '../services/pairPrice.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-max-open',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './max-open.component.html',
  styleUrl: './max-open.component.css'
})
export class MaxOpenComponent {
  @Input() selectedPair!: string;
  isLong = true;
  leverage = 20;
  entryPrice!: number;
  targetPrice!: number;
  exitPrice!: number;
  balance!: number
  maxOpenUSDT: number | null = null;
  maxOpenBTC: number | null = null;
  constructor(private pairPriceService: PairPriceService) { }

  selectPosition(position: 'long' | 'short') {
    this.isLong = (position === 'long');
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

  calculateMaxOpen() {
    if (!this.balance || !this.leverage || !this.entryPrice) return;
  
    this.maxOpenUSDT = parseFloat((this.balance * this.leverage).toFixed(2));
    this.maxOpenBTC = parseFloat((this.maxOpenUSDT / this.entryPrice).toFixed(6));
  }

}
