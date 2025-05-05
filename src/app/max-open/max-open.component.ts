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
  notificationMessage: string | null = null;
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

    const cacheKey = `price-${this.selectedPair}`;
    const cached = localStorage.getItem(cacheKey);

    if (!navigator.onLine) {
      if (cached) {
        const price = parseFloat(cached);
        this.setPrice(target, price);
        this.showNotification(' You are offline. Price from local storage.');
      } else {
        this.showNotification(' You are offline. No data in local storage.');
      }
      return;
    }

    this.pairPriceService.getCurrentPrice(this.selectedPair).subscribe({
      next: (price) => {
        localStorage.setItem(cacheKey, price.toString());
        this.setPrice(target, price);
      },
      error: (error) => {
        console.error('Error fetching price:', error);
        this.showNotification(' Failed to fetch price from API.');
      }
    });
  }

  private setPrice(target: 'entry' | 'exit', price: number) {
    if (target === 'entry') {
      this.entryPrice = price;
    } else if (target === 'exit') {
      this.exitPrice = price;
    }
  }

  showNotification(message: string) {
    this.notificationMessage = message;
    setTimeout(() => {
      this.notificationMessage = null;
    }, 3000);
  }

  calculateMaxOpen() {
    if (!this.balance || !this.leverage || !this.entryPrice) return;

    this.maxOpenUSDT = parseFloat((this.balance * this.leverage).toFixed(2));
    this.maxOpenBTC = parseFloat((this.maxOpenUSDT / this.entryPrice).toFixed(6));
  }

}
