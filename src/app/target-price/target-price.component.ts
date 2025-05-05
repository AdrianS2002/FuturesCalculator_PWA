import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PairPriceService } from '../services/pairPrice.service';

@Component({
  selector: 'app-target-price',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './target-price.component.html',
  styleUrl: './target-price.component.css'
})
export class TargetPriceComponent {
  @Input() selectedPair!: string;
  isLong = true;
  leverage = 20;
  entryPrice!: number;
  targetPrice!: number;
  exitPrice!: number;
  roi!: number
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

  notificationMessage: string | null = null;

  showNotification(message: string) {
    this.notificationMessage = message;
    setTimeout(() => {
      this.notificationMessage = null;
    }, 3000);
  }


  getPrice(target: 'entry' | 'exit') {
    if (!this.selectedPair) return;
  
    const cacheKey = `price-${this.selectedPair}`;
    const cached = localStorage.getItem(cacheKey);
  
    if (!navigator.onLine) {
      if (cached) {
        const price = parseFloat(cached);
        if (target === 'entry') {
          this.entryPrice = price;
        } else {
          this.exitPrice = price;
        }
        this.showNotification(' You are offline. Price from local storage.');
      } else {
        this.showNotification(' You are offline. No data in local storage.');
      }
      return;
    }
  
    this.pairPriceService.getCurrentPrice(this.selectedPair).subscribe({
      next: (price) => {
        localStorage.setItem(cacheKey, price.toString());
        if (target === 'entry') {
          this.entryPrice = price;
        } else {
          this.exitPrice = price;
        }
        this.showNotification(' Price fetched from Binance API.');
      },
      error: (error) => {
        console.error('Error fetching price:', error);
        this.showNotification(' Failed to fetch price from API.');
      }
    });
  }
  

  calculateTarget() {
    if (!this.entryPrice || !this.roi || !this.leverage) return;

    const initialMargin = this.entryPrice / this.leverage;
    const pnlTarget = (this.roi / 100) * initialMargin;

    if (this.isLong) {
      this.targetPrice = parseFloat((this.entryPrice + pnlTarget).toFixed(2));
    } else {
      this.targetPrice = parseFloat((this.entryPrice - pnlTarget).toFixed(2));
    }
  }

}
