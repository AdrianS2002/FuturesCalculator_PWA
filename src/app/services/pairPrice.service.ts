import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class PairPriceService {
    private apiUrl = 'https://api.binance.com/api/v3/exchangeInfo';
    private tickerPriceUrl = 'https://api.binance.com/api/v3/ticker/price';
    constructor(private http: HttpClient) {}

    getTradingPairs(): Observable<string[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map((response: any) => {
                const symbols = response.symbols;
                const tradingPairs = symbols.map((symbol: any) => symbol.symbol);
                return tradingPairs;
            })
        );
    }

    getCurrentPrice(symbol: string): Observable<number> {
        return this.http.get<any>(`${this.tickerPriceUrl}?symbol=${symbol}`).pipe(
            map((response: any) => parseFloat(response.price))
        );
    }
}

