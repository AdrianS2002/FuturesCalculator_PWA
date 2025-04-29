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

    this.pairPriceService.getCurrentPrice(this.selectedPair).subscribe({
      next: (price) => {
        if (target === 'entry') {
          this.positions[index].entryPrice = price;
          console.log('Entry Price:', price);
        } 
      },
      error: (error) => console.error('Error fetching price:', error)
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
