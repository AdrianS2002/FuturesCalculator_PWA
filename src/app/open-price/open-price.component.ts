import { Component, Input } from '@angular/core';
import { PairPriceService } from '../services/pairPrice.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-open-price',
  standalone: true,
  imports: [NgIf, FormsModule, NgFor],
  templateUrl: './open-price.component.html',
  styleUrl: './open-price.component.css'
})
export class OpenPriceComponent {
  isLong = true;
  @Input() selectedPair!: string;
  entryPrice!: number;
  positions: { entryPrice: number, quantity: number }[] = [
    { entryPrice: 0, quantity: 0 }
  ];

  averagePrice: number | null = null;

  notificationMessage: string | null = null;

  showNotification(message: string) {
    this.notificationMessage = message;
    setTimeout(() => {
      this.notificationMessage = null;
    }, 3000);
  }


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

  getPrice(target: 'entry' | 'exit', index: number) {
    if (!this.selectedPair) return;
  
    const cacheKey = `price-${this.selectedPair}`;
    const cached = localStorage.getItem(cacheKey);
  
    if (!navigator.onLine) {
      if (cached) {
        const price = parseFloat(cached);
        this.positions[index].entryPrice = price;
        this.showNotification(' You are offline. Price from local storage.');
      } else {
        this.showNotification(' You are offline. No data in local storage.');
      }
      return;
    }
  
    this.pairPriceService.getCurrentPrice(this.selectedPair).subscribe({
      next: (price) => {
        localStorage.setItem(cacheKey, price.toString());
        this.positions[index].entryPrice = price;
        this.showNotification(' Price fetched from Binance API.');
      },
      error: (error) => {
        console.error('Error fetching price:', error);
        this.showNotification(' Failed to fetch price from API.');
      }
    });
  }
  

  addPosition() {
    this.positions.push({ entryPrice: 0, quantity: 0 });
  }

  removePosition(index: number) {
    this.positions.splice(index, 1);
  }

  calculateAverage() {
    let totalCost = 0;
    let totalQuantity = 0;

    for (const position of this.positions) {
      totalCost += position.entryPrice * position.quantity;
      totalQuantity += position.quantity;
    }

    if (totalQuantity === 0) {
      this.averagePrice = null;
      return;
    }

    this.averagePrice = parseFloat((totalCost / totalQuantity).toFixed(2));
  }
}
