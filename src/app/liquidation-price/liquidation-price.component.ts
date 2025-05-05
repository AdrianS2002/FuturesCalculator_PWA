import { CommonModule, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PairPriceService } from '../services/pairPrice.service';

@Component({
  selector: 'app-liquidation-price',
  standalone: true,
  imports: [NgIf, FormsModule, CommonModule],
  templateUrl: './liquidation-price.component.html',
  styleUrl: './liquidation-price.component.css'
})
export class LiquidationPriceComponent {

  @Input() selectedPair!: string;
  isLong = true;
  leverage = 20;
  longEntry!: number;
  longQuantity!: number;
  shortEntry!: number;
  shortQuantity!: number;
  entryPrice!: number;
  exitPrice!: number;
  balance!: number;
  liqLong: number | null = null;
  liqShort: number | null = null;
  notificationMessage: string | null = null;

  mode: 'one-way' | 'hedge' = 'one-way';
  marginType = 'cross';
  liquidationPrice: number | null = null;

  constructor(private pairPriceService: PairPriceService) { }

  selectPosition(type: 'long' | 'short') {
    this.isLong = type === 'long';
  }

  getPrice(target: 'entry' | 'exit') {
    if (!this.selectedPair) return;
    const cacheKey = `price-${this.selectedPair}`;
    const cached = localStorage.getItem(cacheKey);

    if (!navigator.onLine) {
      if (cached) {
        const price = parseFloat(cached);
        this.showNotification(' You are offline. Price from local storage.');
        this.setPrice(target, price);
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
      this.showNotification('❌ Failed to fetch price from API.');
    }
  });
  }

  get baseCurrency(): string {
    return this.selectedPair?.slice(-4) === "USDT" ? "USDT" : this.selectedPair?.slice(-3) || '';
  }

  get quoteCurrency(): string {
    return this.selectedPair?.replace(this.baseCurrency, '') || '';
  }

  get selectedEntry(): number {
    return this.isLong ? this.longEntry : this.shortEntry;
  }
  set selectedEntry(value: number) {
    if (this.isLong) {
      this.longEntry = value;
    } else {
      this.shortEntry = value;
    }
  }

  showNotification(message: string) {
    this.notificationMessage = message;
    setTimeout(() => {
      this.notificationMessage = null;
    }, 3000);
  }

  private setPrice(target: 'entry' | 'exit', price: number) {
    if (target === 'entry') {
      if (this.mode === 'hedge') {
        this.longEntry = price;
        this.shortEntry = price;
      } else {
        this.selectedEntry = price;
      }
    } else if (target === 'exit') {
      this.exitPrice = price;
    }
  }

  get selectedQuantity(): number {
    return this.isLong ? this.longQuantity : this.shortQuantity;
  }
  set selectedQuantity(value: number) {
    if (this.isLong) {
      this.longQuantity = value;
    } else {
      this.shortQuantity = value;
    }
  }

  calculateLiquidation() {
    if (this.mode === 'one-way') {
      const entry = this.selectedEntry;
      const qty = this.selectedQuantity;

      if (!entry || !qty || !this.balance || !this.leverage) return;

      const L = this.leverage;
      const Q = qty;
      const B = this.balance;
      const E = entry;

      if (this.isLong) {
        const price = (E * (L / (L + 1))) - (B / (Q * (L + 1)));
        this.liquidationPrice = parseFloat(price.toFixed(8));
      } else {
        const price = (E * (L / (L + 1))) + (B / (Q * (L + 1)));
        this.liquidationPrice = parseFloat(price.toFixed(8));
      }
    } else if (this.mode === 'hedge') {
      if (!this.longEntry || !this.longQuantity || !this.shortEntry || !this.shortQuantity || !this.balance || !this.leverage) return;

      const L = this.leverage;
      const B = this.balance;

      const longPrice = (this.longEntry * this.longQuantity * L) / (this.longQuantity * L + B);
      const shortPrice = (this.shortEntry * this.shortQuantity * L) / (this.shortQuantity * L - B);

      this.liqLong = parseFloat(longPrice.toFixed(8));
      this.liqShort = parseFloat(shortPrice.toFixed(8));
      this.liquidationPrice = Math.max(this.liqLong, this.liqShort);
    }
  }
}
