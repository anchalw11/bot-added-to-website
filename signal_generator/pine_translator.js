class PineTranslator {
    constructor(historicalData, riskRewardRatio = 2.0) {
        this.historicalData = historicalData;
        this.riskRewardRatio = riskRewardRatio;
        this.swingHigh = { currentLevel: null, lastLevel: null, crossed: false, barTime: null, barIndex: null };
        this.swingLow = { currentLevel: null, lastLevel: null, crossed: false, barTime: null, barIndex: null };
        this.internalHigh = { currentLevel: null, lastLevel: null, crossed: false, barTime: null, barIndex: null };
        this.internalLow = { currentLevel: null, lastLevel: null, crossed: false, barTime: null, barIndex: null };
        this.swingTrend = { bias: 0 };
        this.internalTrend = { bias: 0 };
        this.orderBlocks = [];
        this.atr = this.calculateATR(20);
    }

    calculateATR(period) {
        let tr = [];
        for (let i = 1; i < this.historicalData.length; i++) {
            const high = this.historicalData[i].high;
            const low = this.historicalData[i].low;
            const prevClose = this.historicalData[i - 1].close;
            tr.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
        }
        const atr = tr.slice(-period).reduce((a, b) => a + b, 0) / period;
        return atr;
    }

    leg(size) {
        var leg = 0;
        const newLegHigh = this.historicalData[size].high > Math.max(...this.historicalData.slice(0, size).map(p => p.high));
        const newLegLow = this.historicalData[size].low < Math.min(...this.historicalData.slice(0, size).map(p => p.low));

        if (newLegHigh) {
            leg = 0;
        } else if (newLegLow) {
            leg = 1;
        }
        return leg;
    }

    startOfNewLeg(leg) {
        return leg !== this.leg(this.historicalData.length - 2);
    }

    startOfBearishLeg(leg) {
        return leg === 0 && this.leg(this.historicalData.length - 2) === 1;
    }

    startOfBullishLeg(leg) {
        return leg === 1 && this.leg(this.historicalData.length - 2) === 0;
    }

    getSwingHighLow() {
        const high = this.historicalData[0].high;
        const low = this.historicalData[0].low;
        if (!this.swingHigh.currentLevel || high > this.swingHigh.currentLevel) {
            this.swingHigh.currentLevel = high;
        }
        if (!this.swingLow.currentLevel || low < this.swingLow.currentLevel) {
            this.swingLow.currentLevel = low;
        }
    }

    generateSignal() {
        this.getSwingHighLow();
        const latestData = this.historicalData[0];
        if (latestData.close > this.swingHigh.currentLevel) {
            return this.createTradingLevel(true, this.swingHigh.currentLevel, 'BOS');
        } else if (latestData.close < this.swingLow.currentLevel) {
            return this.createTradingLevel(false, this.swingLow.currentLevel, 'BOS');
        }
        return null;
    }

    storeOrderBlock(p_ivot, internal = false, bias) {
        const bars = this.historicalData.slice(p_ivot.barIndex, this.historicalData.length);
        let orderBlock = null;

        if (bias === 1) { // BULLISH
            const potentialOB = bars.find((bar, i) => i > 0 && bar.close < bar.open && bars[i - 1].close > bars[i - 1].open);
            if (potentialOB) {
                orderBlock = {
                    barHigh: potentialOB.high,
                    barLow: potentialOB.low,
                    barTime: potentialOB.date,
                    bias: 1
                };
            }
        } else { // BEARISH
            const potentialOB = bars.find((bar, i) => i > 0 && bar.close > bar.open && bars[i - 1].close < bars[i - 1].open);
            if (potentialOB) {
                orderBlock = {
                    barHigh: potentialOB.high,
                    barLow: potentialOB.low,
                    barTime: potentialOB.date,
                    bias: -1
                };
            }
        }

        if (orderBlock) {
            this.orderBlocks.unshift(orderBlock);
            if (this.orderBlocks.length > 10) {
                this.orderBlocks.pop();
            }
        }
    }

    displayStructure(internal = false, internalFilterConfluenceInput = false) {
        console.log(`displayStructure called with internal=${internal}`);
        let bullishBar = true;
        let bearishBar = true;

        if (internalFilterConfluenceInput) {
            const { close, open, high, low } = this.historicalData[0];
            bullishBar = high - Math.max(close, open) > Math.min(close, open - low);
            bearishBar = high - Math.max(close, open) < Math.min(close, open - low);
        }

        let p_ivot = internal ? this.internalHigh : this.swingHigh;
        let t_rend = internal ? this.internalTrend : this.swingTrend;
        const latestData = this.historicalData[0];
        let extraCondition = internal ? this.internalHigh.currentLevel !== this.swingHigh.currentLevel && bullishBar : true;

        console.log(`Checking for bullish signal: close=${latestData.close}, pivot=${p_ivot.currentLevel}, crossed=${p_ivot.crossed}, extraCondition=${extraCondition}`);
        if (latestData.close > p_ivot.currentLevel && !p_ivot.crossed && extraCondition) {
            const tag = t_rend.bias === -1 ? 'CHoCH' : 'BOS';
            p_ivot.crossed = true;
            t_rend.bias = 1;
            this.storeOrderBlock(p_ivot, internal, 1);
            console.log('Bullish signal generated');
            return this.createTradingLevel(true, p_ivot.currentLevel, tag);
        }

        p_ivot = internal ? this.internalLow : this.swingLow;
        extraCondition = internal ? this.internalLow.currentLevel !== this.swingLow.currentLevel && bearishBar : true;

        console.log(`Checking for bearish signal: close=${latestData.close}, pivot=${p_ivot.currentLevel}, crossed=${p_ivot.crossed}, extraCondition=${extraCondition}`);
        if (latestData.close < p_ivot.currentLevel && !p_ivot.crossed && extraCondition) {
            const tag = t_rend.bias === 1 ? 'CHoCH' : 'BOS';
            p_ivot.crossed = true;
            t_rend.bias = -1;
            this.storeOrderBlock(p_ivot, internal, -1);
            console.log('Bearish signal generated');
            return this.createTradingLevel(false, p_ivot.currentLevel, tag);
        }
        console.log('No signal generated');
        return null;
    }

    createTradingLevel(isBullish, brokenLevel, tag) {
        const entryPrice = this.historicalData[0].close;
        let stopLossLevel;

        if (isBullish) {
            stopLossLevel = brokenLevel - (this.atr * 0.5);
        } else {
            stopLossLevel = brokenLevel + (this.atr * 0.5);
        }

        const riskDistance = Math.abs(entryPrice - stopLossLevel);
        const takeProfitLevel = isBullish
            ? entryPrice + (riskDistance * this.riskRewardRatio)
            : entryPrice - (riskDistance * this.riskRewardRatio);

        return {
            direction: isBullish ? 'BUY' : 'SELL',
            entry: entryPrice,
            stopLoss: stopLossLevel,
            targets: {
                target1: takeProfitLevel,
                target2: isBullish ? entryPrice + (riskDistance * (this.riskRewardRatio + 1)) : entryPrice - (riskDistance * (this.riskRewardRatio + 1)),
                target3: isBullish ? entryPrice + (riskDistance * (this.riskRewardRatio + 2)) : entryPrice - (riskDistance * (this.riskRewardRatio + 2)),
            },
            rsr: this.riskRewardRatio.toFixed(2),
            confidence: tag === 'BOS' ? 85 : 75,
            analysis: `A ${tag} signal was detected.`,
            timestamp: new Date().toISOString(),
        };
    }

    generateSignal() {
        console.log('generateSignal called');
        this.getCurrentStructure(50, false, false);
        this.getCurrentStructure(5, false, true);
        let signal = this.displayStructure(true, true);
        if (!signal) {
            signal = this.displayStructure(false);
        }
        return signal;
    }
}

module.exports = PineTranslator;
