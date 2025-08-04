interface LotSizeCalculationParams {
  accountBalance: number;
  riskPercentage: number;
  entryPrice: number;
  stopLossPrice: number;
  currencyPair: string;
  accountCurrency?: string;
}

interface LotSizeResult {
  lotSize: number;
  riskAmount: number;
  pipValue: number;
  pipsAtRisk: number;
  positionValue: number;
  marginRequired: number;
}

class LotSizeCalculator {
  // Standard lot size (100,000 units)
  private readonly STANDARD_LOT_SIZE = 100000;
  
  // Pip sizes for different currency pairs
  private readonly PIP_SIZES = {
    JPY_PAIRS: 0.01,    // For pairs like USD/JPY, EUR/JPY
    STANDARD_PAIRS: 0.0001  // For pairs like EUR/USD, GBP/USD
  };

  // Current exchange rates (in a real app, these would come from an API)
  private readonly EXCHANGE_RATES = {
    'EURUSD': 1.0850,
    'GBPUSD': 1.2750,
    'USDJPY': 149.50,
    'USDCHF': 0.9100,
    'AUDUSD': 0.6650,
    'USDCAD': 1.3600,
    'NZDUSD': 0.6200,
    'EURJPY': 162.25,
    'GBPJPY': 190.62,
    'XAUUSD': 2020.00,
    'XAGUSD': 24.50,
    'BTCUSD': 45000.00,
    'ETHUSD': 2800.00
  };

  /**
   * Calculate optimal lot size based on risk management parameters
   */
  calculateLotSize(params: LotSizeCalculationParams): LotSizeResult {
    const {
      accountBalance,
      riskPercentage,
      entryPrice,
      stopLossPrice,
      currencyPair,
      accountCurrency = 'USD'
    } = params;

    console.log('Calculating lot size with params:', params);

    // Calculate risk amount
    const riskAmount = accountBalance * (riskPercentage / 100);
    console.log('Risk amount:', riskAmount);

    // Determine pip size
    const pipSize = this.getPipSize(currencyPair);
    console.log('Pip size:', pipSize);

    // Calculate pips at risk
    const pipsAtRisk = Math.abs(entryPrice - stopLossPrice) / pipSize;
    console.log('Pips at risk:', pipsAtRisk);

    // Calculate pip value
    const pipValue = this.calculatePipValue(currencyPair, 1, accountCurrency);
    console.log('Pip value per standard lot:', pipValue);

    // Calculate lot size using the formula:
    // Lot Size = Risk Amount / (Pips at Risk × Pip Value per Lot)
    const pipValuePerLot = pipValue * this.STANDARD_LOT_SIZE;
    console.log('Pip value per lot:', pipValuePerLot);
    
    // Simplified calculation for demo - using $10 per pip for major pairs
    const simplifiedPipValue = currencyPair.includes('JPY') ? 9.09 : 10; // Approximate pip values
    const lotSize = pipsAtRisk > 0 ? riskAmount / (pipsAtRisk * simplifiedPipValue) : 0;
    
    console.log('Final lot size calculation:', { riskAmount, pipsAtRisk, simplifiedPipValue, lotSize });

    // Calculate position value
    const positionValue = lotSize * this.STANDARD_LOT_SIZE * entryPrice;

    // Calculate margin required (assuming 1:100 leverage)
    const marginRequired = positionValue / 100;

    return {
      lotSize: Math.round(lotSize * 100) / 100, // Round to 2 decimal places
      riskAmount,
      pipValue: pipValuePerLot,
      pipsAtRisk: Math.round(pipsAtRisk),
      positionValue,
      marginRequired
    };
  }

  /**
   * Get pip size for a currency pair
   */
  private getPipSize(currencyPair: string): number {
    const pair = currencyPair.toUpperCase();
    
    // JPY pairs have different pip size
    if (pair.includes('JPY')) {
      return this.PIP_SIZES.JPY_PAIRS;
    }
    
    return this.PIP_SIZES.STANDARD_PAIRS;
  }

  /**
   * Calculate pip value for a given currency pair and lot size
   */
  private calculatePipValue(
    currencyPair: string, 
    lotSize: number, 
    accountCurrency: string = 'USD'
  ): number {
    const pair = currencyPair.toUpperCase();
    const pipSize = this.getPipSize(pair);
    const tradeSize = lotSize * this.STANDARD_LOT_SIZE;

    // Get base and quote currencies
    const baseCurrency = pair.substring(0, 3);
    const quoteCurrency = pair.substring(3, 6);

    let pipValue: number;

    if (quoteCurrency === accountCurrency) {
      // If account currency is the quote currency
      pipValue = pipSize * tradeSize;
    } else if (baseCurrency === accountCurrency) {
      // If account currency is the base currency
      const exchangeRate = this.getExchangeRate(pair);
      pipValue = (pipSize / exchangeRate) * tradeSize;
    } else {
      // Need to convert to account currency
      const exchangeRate = this.getExchangeRate(pair);
      const conversionRate = this.getConversionRate(quoteCurrency, accountCurrency);
      
      if (quoteCurrency === 'USD') {
        pipValue = pipSize * tradeSize;
      } else {
        pipValue = (pipSize / exchangeRate) * tradeSize;
      }
      
      // Convert to account currency if needed
      if (conversionRate !== 1) {
        pipValue *= conversionRate;
      }
    }

    return pipValue;
  }

  /**
   * Get exchange rate for a currency pair
   */
  private getExchangeRate(currencyPair: string): number {
    const pair = currencyPair.toUpperCase();
    return this.EXCHANGE_RATES[pair as keyof typeof this.EXCHANGE_RATES] || 1;
  }

  /**
   * Get conversion rate between two currencies
   */
  private getConversionRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return 1;
    
    // Simplified conversion - in reality, you'd use real exchange rates
    const conversionPair = `${fromCurrency}${toCurrency}`;
    return this.EXCHANGE_RATES[conversionPair as keyof typeof this.EXCHANGE_RATES] || 1;
  }

  /**
   * Validate lot size calculation parameters
   */
  validateParameters(params: LotSizeCalculationParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (params.accountBalance <= 0) {
      errors.push('Account balance must be greater than 0');
    }

    if (params.riskPercentage <= 0 || params.riskPercentage > 100) {
      errors.push('Risk percentage must be between 0 and 100');
    }

    if (params.entryPrice <= 0) {
      errors.push('Entry price must be greater than 0');
    }

    if (params.stopLossPrice <= 0) {
      errors.push('Stop loss price must be greater than 0');
    }

    if (params.entryPrice === params.stopLossPrice) {
      errors.push('Entry price and stop loss price cannot be the same');
    }

    if (!params.currencyPair || params.currencyPair.length !== 6) {
      errors.push('Currency pair must be 6 characters (e.g., EURUSD)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get recommended lot sizes based on account size
   */
  getRecommendedLotSizes(accountBalance: number): { conservative: number; moderate: number; aggressive: number } {
    const baseUnit = accountBalance / 10000; // Base unit per $10k

    return {
      conservative: Math.max(0.01, Math.round(baseUnit * 0.1 * 100) / 100),
      moderate: Math.max(0.01, Math.round(baseUnit * 0.2 * 100) / 100),
      aggressive: Math.max(0.01, Math.round(baseUnit * 0.5 * 100) / 100)
    };
  }
}

export const lotSizeCalculator = new LotSizeCalculator();
export type { LotSizeCalculationParams, LotSizeResult };