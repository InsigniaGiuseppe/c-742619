export interface HoldingLot {
  quantity: number;
  price: number;
  timestamp: number;
}

export interface SoldLot extends HoldingLot {
  soldQuantity: number;
}

export interface SellPnlDetail {
  quantity: number;
  costBasis: number;
  saleValue: number;
  pnl: number;
  originalPurchaseTimestamp: number;
}

export interface SellPnlResult {
  totalQuantitySold: number;
  totalCostBasis: number;
  totalSaleValue: number;
  totalPnL: number;
  details: SellPnlDetail[];
}

export interface MarketValue {
  totalValue: number;
  quantity: number;
}

export interface UnrealizedPnLData {
  quantity: number;
  avgCostBasis: number;
  totalCostBasis: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface PortfolioTotals {
  realizedPnL: number;
  unrealizedPnL: number;
  totalPnL: number;
  totalCurrentValue: number;
  totalCostBasis: number;
  totalReturnPercent: number;
}

export class CryptoPnLCalculator {
  private method: 'FIFO' | 'LIFO' | 'SPECIFIC';
  private holdings: Map<string, HoldingLot[]>;
  private realizedPnL: number;

  constructor(method: 'FIFO' | 'LIFO' | 'SPECIFIC' = 'FIFO') {
    this.method = method;
    this.holdings = new Map();
    this.realizedPnL = 0;
  }

  addBuy(symbol: string, quantity: number, totalCostIncludingFees: number, timestamp: number = Date.now()): void {
    const avgPrice = totalCostIncludingFees / quantity;

    if (!this.holdings.has(symbol)) {
      this.holdings.set(symbol, []);
    }

    this.holdings.get(symbol)!.push({ quantity, price: avgPrice, timestamp });
  }

  addSell(symbol: string, quantity: number, totalSaleValueAfterFees: number, timestamp: number = Date.now()): SellPnlResult {
    const holdings = this.holdings.get(symbol);
    if (!holdings || this.getTotalQuantity(symbol) < quantity) {
      throw new Error(`Insufficient ${symbol} holdings for sale`);
    }

    const soldHoldings = this.selectHoldingsToSell(symbol, quantity);
    const pnlResult = this.calculateSellPnL(soldHoldings, totalSaleValueAfterFees);
    this.realizedPnL += pnlResult.totalPnL;
    return pnlResult;
  }

  addTrade(fromSymbol: string, fromQuantity: number, toSymbol: string, toQuantity: number, totalFromValue: number, totalToValue: number, timestamp: number = Date.now()): SellPnlResult {
    const sellPnL = this.addSell(fromSymbol, fromQuantity, totalFromValue, timestamp);
    this.addBuy(toSymbol, toQuantity, totalToValue, timestamp);
    return sellPnL;
  }

  selectHoldingsToSell(symbol: string, quantityToSell: number): SoldLot[] {
    const holdings = this.holdings.get(symbol)!;
    const soldHoldings: SoldLot[] = [];
    let remaining = quantityToSell;

    const sorted = [...holdings].sort((a, b) => {
      if (this.method === 'FIFO') return a.timestamp - b.timestamp;
      if (this.method === 'LIFO') return b.timestamp - a.timestamp;
      return 0;
    });

    for (let i = 0; i < sorted.length && remaining > 0; i++) {
      const holding = sorted[i];
      const qty = Math.min(holding.quantity, remaining);
      soldHoldings.push({ ...holding, soldQuantity: qty });
      holding.quantity -= qty;
      remaining -= qty;
      if (holding.quantity === 0) {
        const index = holdings.indexOf(holding);
        holdings.splice(index, 1);
      }
    }
    return soldHoldings;
  }

  calculateSellPnL(soldHoldings: SoldLot[], totalSaleValue: number): SellPnlResult {
    let totalCostBasis = 0;
    let totalQuantitySold = 0;
    const details: SellPnlDetail[] = [];
    const totalQuantity = soldHoldings.reduce((sum, h) => sum + h.soldQuantity, 0);

    soldHoldings.forEach(holding => {
      const costBasis = holding.price * holding.soldQuantity;
      const proportionalSaleValue = (holding.soldQuantity / totalQuantity) * totalSaleValue;
      const pnl = proportionalSaleValue - costBasis;
      details.push({
        quantity: holding.soldQuantity,
        costBasis,
        saleValue: proportionalSaleValue,
        pnl,
        originalPurchaseTimestamp: holding.timestamp,
      });
      totalCostBasis += costBasis;
      totalQuantitySold += holding.soldQuantity;
    });

    const totalPnL = totalSaleValue - totalCostBasis;
    return { totalQuantitySold, totalCostBasis, totalSaleValue, totalPnL, details };
  }

  calculateUnrealizedPnL(currentMarketValues: Record<string, MarketValue>): Map<string, UnrealizedPnLData> {
    const unrealized = new Map<string, UnrealizedPnLData>();

    this.holdings.forEach((lots, symbol) => {
      if (!currentMarketValues[symbol]) return;
      let totalCostBasis = 0;
      let totalQuantity = 0;
      lots.forEach(h => {
        totalCostBasis += h.price * h.quantity;
        totalQuantity += h.quantity;
      });
      const currentValue = currentMarketValues[symbol].totalValue;
      const unrealizedPnL = currentValue - totalCostBasis;
      unrealized.set(symbol, {
        quantity: totalQuantity,
        avgCostBasis: totalCostBasis / totalQuantity,
        totalCostBasis,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent: totalCostBasis > 0 ? (unrealizedPnL / totalCostBasis) * 100 : 0,
      });
    });

    return unrealized;
  }

  getTotalQuantity(symbol: string): number {
    const lots = this.holdings.get(symbol);
    if (!lots) return 0;
    return lots.reduce((total, l) => total + l.quantity, 0);
  }

  getAvgCostBasis(symbol: string): number {
    const lots = this.holdings.get(symbol);
    if (!lots || lots.length === 0) return 0;
    let totalCost = 0;
    let totalQty = 0;
    lots.forEach(l => {
      totalCost += l.price * l.quantity;
      totalQty += l.quantity;
    });
    return totalQty > 0 ? totalCost / totalQty : 0;
  }

  getPortfolioTotals(currentMarketValues: Record<string, MarketValue>): PortfolioTotals {
    const unrealized = this.calculateUnrealizedPnL(currentMarketValues);
    let totalUnrealizedPnL = 0;
    let totalCurrentValue = 0;
    let totalCostBasis = 0;
    unrealized.forEach(d => {
      totalUnrealizedPnL += d.unrealizedPnL;
      totalCurrentValue += d.currentValue;
      totalCostBasis += d.totalCostBasis;
    });
    return {
      realizedPnL: this.realizedPnL,
      unrealizedPnL: totalUnrealizedPnL,
      totalPnL: this.realizedPnL + totalUnrealizedPnL,
      totalCurrentValue,
      totalCostBasis,
      totalReturnPercent: totalCostBasis > 0 ? ((this.realizedPnL + totalUnrealizedPnL) / totalCostBasis) * 100 : 0,
    };
  }

  getAllHoldings(): Map<string, { quantity: number; avgCostBasis: number; totalCostBasis: number; lots: HoldingLot[] }> {
    const result = new Map<string, { quantity: number; avgCostBasis: number; totalCostBasis: number; lots: HoldingLot[] }>();
    this.holdings.forEach((lots, symbol) => {
      if (lots.length > 0) {
        const totalQuantity = this.getTotalQuantity(symbol);
        const avgCostBasis = this.getAvgCostBasis(symbol);
        result.set(symbol, {
          quantity: totalQuantity,
          avgCostBasis,
          totalCostBasis: avgCostBasis * totalQuantity,
          lots: lots.map(l => ({ quantity: l.quantity, price: l.price, timestamp: l.timestamp })),
        });
      }
    });
    return result;
  }

  reset(): void {
    this.holdings.clear();
    this.realizedPnL = 0;
  }

  getRealizedPnL(): number {
    return this.realizedPnL;
  }

  setMethod(method: 'FIFO' | 'LIFO' | 'SPECIFIC'): void {
    if (['FIFO', 'LIFO', 'SPECIFIC'].includes(method)) {
      this.method = method;
    } else {
      throw new Error('Invalid method. Use FIFO, LIFO, or SPECIFIC');
    }
  }
}

export default CryptoPnLCalculator;

