const axios = require('axios');

// =================================================================
// ENHANCED RISK REWARD CALCULATION - Multiple target system
// =================================================================

class RiskRewardCalculator {
    constructor() {
        this.supportResistanceLevels = new Map();
        this.fibonacciLevels = new Map();
        this.previousSwingLevels = new Map();
    }

    // Calculate logical multiple targets based on market structure
    calculateLogicalTargets(symbol, signalDirection, entryPrice, stopLoss, priceHistory) {
        const targets = [];
        const atr = this.calculateATR(priceHistory, 14);
        
        // 1. STRUCTURE-BASED TARGETS
        const structureTargets = this.calculateStructureTargets(symbol, signalDirection, entryPrice, priceHistory);
        targets.push(...structureTargets);
        
        // 2. FIBONACCI EXTENSION TARGETS
        const fibTargets = this.calculateFibonacciTargets(signalDirection, entryPrice, stopLoss, priceHistory);
        targets.push(...fibTargets);
        
        // 3. ATR-BASED TARGETS
        const atrTargets = this.calculateATRTargets(signalDirection, entryPrice, atr);
        targets.push(...atrTargets);
        
        // 4. SUPPORT/RESISTANCE TARGETS
        const srTargets = this.calculateSupportResistanceTargets(symbol, signalDirection, entryPrice, priceHistory);
        targets.push(...srTargets);
        
        // Sort targets by distance and select best ones
        const sortedTargets = this.prioritizeTargets(targets, entryPrice, stopLoss, signalDirection);
        
        // Return top 3-5 most logical targets
        return sortedTargets.slice(0, 5);
    }

    calculateStructureTargets(symbol, direction, entryPrice, priceHistory) {
        const targets = [];
        
        // Get recent swing levels
        const recentSwings = this.getRecentSwingLevels(priceHistory);
        
        if (direction === 'BUY') {
            // For buy signals, target previous swing highs
            recentSwings.highs.forEach((high, index) => {
                if (high > entryPrice) {
                    targets.push({
                        price: high,
                        type: 'Structure',
                        description: `Previous Swing High ${index + 1}`,
                        priority: 'High',
                        probability: 85 - (index * 10) // Higher probability for closer targets
                    });
                }
            });
        } else {
            // For sell signals, target previous swing lows
            recentSwings.lows.forEach((low, index) => {
                if (low < entryPrice) {
                    targets.push({
                        price: low,
                        type: 'Structure',
                        description: `Previous Swing Low ${index + 1}`,
                        priority: 'High',
                        probability: 85 - (index * 10)
                    });
                }
            });
        }
        
        return targets;
    }

    calculateFibonacciTargets(direction, entryPrice, stopLoss, priceHistory) {
        const targets = [];
        const riskDistance = Math.abs(entryPrice - stopLoss);
        
        // Standard Fibonacci extension levels
        const fibLevels = [1.272, 1.414, 1.618, 2.0, 2.618];
        
        fibLevels.forEach((level, index) => {
            const targetPrice = direction === 'BUY' ? 
                entryPrice + (riskDistance * level) : 
                entryPrice - (riskDistance * level);
            
            targets.push({
                price: targetPrice,
                type: 'Fibonacci',
                description: `Fib ${level} Extension`,
                priority: index < 3 ? 'High' : 'Medium',
                probability: 75 - (index * 10)
            });
        });
        
        return targets;
    }

    calculateATRTargets(direction, entryPrice, atr) {
        const targets = [];
        const atrMultipliers = [1.5, 2.0, 3.0, 4.0, 5.0];
        
        atrMultipliers.forEach((multiplier, index) => {
            const targetPrice = direction === 'BUY' ? 
                entryPrice + (atr * multiplier) : 
                entryPrice - (atr * multiplier);
            
            targets.push({
                price: targetPrice,
                type: 'ATR',
                description: `${multiplier}x ATR Target`,
                priority: index < 2 ? 'Medium' : 'Low',
                probability: 70 - (index * 8)
            });
        });
        
        return targets;
    }

    calculateSupportResistanceTargets(symbol, direction, entryPrice, priceHistory) {
        const targets = [];
        
        // Find significant support/resistance levels
        const srLevels = this.findSupportResistanceLevels(priceHistory);
        
        srLevels.forEach((level, index) => {
            const isValidTarget = direction === 'BUY' ? 
                level.price > entryPrice : 
                level.price < entryPrice;
            
            if (isValidTarget) {
                targets.push({
                    price: level.price,
                    type: 'S/R',
                    description: `${level.type} Level (${level.touches} touches)`,
                    priority: level.touches >= 3 ? 'High' : 'Medium',
                    probability: Math.min(80, 50 + (level.touches * 10))
                });
            }
        });
        
        return targets;
    }

    prioritizeTargets(targets, entryPrice, stopLoss, direction) {
        const riskDistance = Math.abs(entryPrice - stopLoss);
        
        return targets
            .map(target => {
                // Calculate risk-reward ratio for this target
                const rewardDistance = Math.abs(target.price - entryPrice);
                const riskReward = rewardDistance / riskDistance;
                
                // Calculate priority score
                let priorityScore = 0;
                if (target.priority === 'High') priorityScore = 100;
                else if (target.priority === 'Medium') priorityScore = 70;
                else priorityScore = 40;
                
                // Add probability and RR bonus
                priorityScore += target.probability * 0.5;
                priorityScore += Math.min(riskReward * 10, 50); // Bonus for good RR
                
                return {
                    ...target,
                    riskReward: parseFloat(riskReward.toFixed(2)),
                    priorityScore
                };
            })
            .sort((a, b) => b.priorityScore - a.priorityScore)
            .filter(target => target.riskReward >= 1.0); // Only targets with positive RR
    }

    getRecentSwingLevels(priceHistory) {
        const highs = [];
        const lows = [];
        
        // Simple swing detection
        for (let i = 5; i < priceHistory.length - 5; i++) {
            const current = priceHistory[i];
            let isSwingHigh = true;
            let isSwingLow = true;
            
            // Check 5 bars on each side
            for (let j = i - 5; j <= i + 5; j++) {
                if (j !== i && j >= 0 && j < priceHistory.length) {
                    if (priceHistory[j].high >= current.high) isSwingHigh = false;
                    if (priceHistory[j].low <= current.low) isSwingLow = false;
                }
            }
            
            if (isSwingHigh) highs.push(current.high);
            if (isSwingLow) lows.push(current.low);
        }
        
        return {
            highs: highs.slice(-5), // Last 5 swing highs
            lows: lows.slice(-5)    // Last 5 swing lows
        };
    }

    findSupportResistanceLevels(priceHistory) {
        const levels = [];
        const tolerance = 0.001; // 0.1% tolerance for level grouping
        
        // Collect all highs and lows
        const allLevels = [];
        priceHistory.forEach(bar => {
            allLevels.push({ price: bar.high, type: 'Resistance' });
            allLevels.push({ price: bar.low, type: 'Support' });
        });
        
        // Group similar levels and count touches
        const groupedLevels = new Map();
        
        allLevels.forEach(level => {
            let foundGroup = false;
            
            for (let [groupKey, group] of groupedLevels) {
                if (Math.abs(level.price - groupKey) / groupKey <= tolerance) {
                    group.touches++;
                    group.avgPrice = (group.avgPrice * (group.touches - 1) + level.price) / group.touches;
                    foundGroup = true;
                    break;
                }
            }
            
            if (!foundGroup) {
                groupedLevels.set(level.price, {
                    avgPrice: level.price,
                    type: level.type,
                    touches: 1
                });
            }
        });
        
        // Convert to array and filter significant levels
        for (let [key, group] of groupedLevels) {
            if (group.touches >= 2) { // At least 2 touches to be significant
                levels.push({
                    price: group.avgPrice,
                    type: group.type,
                    touches: group.touches
                });
            }
        }
        
        return levels.sort((a, b) => b.touches - a.touches).slice(0, 10);
    }

    calculateATR(priceHistory, period) {
        if (priceHistory.length < period + 1) {
            return priceHistory.length > 0 ? priceHistory[0].close * 0.001 : 0;
        }
        
        const trueRanges = [];
        for (let i = 1; i < priceHistory.length; i++) {
            const current = priceHistory[i];
            const previous = priceHistory[i - 1];
            
            const tr = Math.max(
                current.high - current.low,
                Math.abs(current.high - previous.close),
                Math.abs(current.low - previous.close)
            );
            trueRanges.push(tr);
        }
        
        const recentTRs = trueRanges.slice(-period);
        return recentTRs.reduce((sum, tr) => sum + tr, 0) / recentTRs.length;
    }
}


// =================================================================
// ADVANCED SMC TRADING LOGIC - BASED ON YOUR PINE SCRIPT INDICATOR
// =================================================================

class ProfessionalSMCEngine {
    constructor() {
        this.priceHistory = new Map();
        this.swingHighs = new Map();
        this.swingLows = new Map();
        this.internalHighs = new Map();
        this.internalLows = new Map();
        this.swingTrend = new Map();
        this.internalTrend = new Map();
        this.orderBlocks = new Map();
        this.fairValueGaps = new Map();
        this.equalHighs = new Map();
        this.equalLows = new Map();
        this.lastSignalTime = new Map();
        
        this.activePositions = new Map();
        this.positionHistory = new Map();
        this.marketConditions = new Map();
        this.exitSignals = new Map();
        
        this.confirmationScores = {
            'swingBullishBOS': 30, 'swingBearishBOS': 30, 'swingBullishCHoCH': 25, 'swingBearishCHoCH': 25,
            'internalBullishBOS': 20, 'internalBearishBOS': 20, 'internalBullishCHoCH': 18, 'internalBearishCHoCH': 18,
            'swingOrderBlockRespect': 22, 'internalOrderBlockRespect': 18,
            'bullishFairValueGap': 15, 'bearishFairValueGap': 15,
            'equalHighsBreak': 12, 'equalLowsBreak': 12,
            'premiumZoneEntry': 10, 'discountZoneEntry': 10, 'equilibriumZone': 8,
            'multiTimeframeAlignment': 8, 'volumeConfirmation': 6, 'strongWeakHighLow': 5, 'atrVolatilityFilter': 4
        };
        
        this.exitCriteria = {
            'oppositeStructureBreak': 40, 'swingFailure': 35, 'trendReversal': 30,
            'momentumDivergence': 25, 'volumeWeakness': 20, 'orderBlockBroken': 18, 'fvgFilled': 15,
            'volatilitySpike': 12, 'sessionChange': 10, 'timeBasedExit': 8, 'partialProfitZone': 5
        };
        
        this.signalRequirements = {
            minPrimaryConfirmations: 1, minTotalConfirmations: 4, minConfidenceScore: 60,
            minHistoryBars: 25, cooldownPeriod: 300000
        };
        
        this.exitRequirements = {
            minExitScore: 30, criticalExitScore: 50, maxPositionAge: 14400000
        };
    }

    analyzeSMCPatterns(symbol, priceHistory) {
        try {
            const currentPriceData = priceHistory[0];
            const currentPrice = parseFloat(currentPriceData.close);
            const timestamp = Date.now();
            
            this.priceHistory.set(symbol, priceHistory);
            
            const exitAnalysis = this.analyzePositionExits(symbol, currentPrice, timestamp);
            if (exitAnalysis) {
                return exitAnalysis;
            }
            
            if (!this.canGenerateSignal(symbol, timestamp)) {
                return null;
            }
            
            if (priceHistory.length < this.signalRequirements.minHistoryBars) {
                return null;
            }
            
            const analysis = this.performStructureAnalysis(symbol, priceHistory, currentPrice);
            
            if (this.validateSignalQuality(analysis)) {
                this.lastSignalTime.set(symbol, timestamp);
                const signal = this.createTradingSignal(symbol, analysis, currentPrice);
                this.trackNewPosition(symbol, signal, timestamp);
                return signal;
            }
            
            return null;
            
        } catch (error) {
            console.error(`SMC Analysis Error for ${symbol}:`, error);
            return null;
        }
    }

    analyzePositionExits(symbol, currentPrice, timestamp) {
        const activePosition = this.activePositions.get(symbol);
        if (!activePosition) return null;
        
        const exitFactors = [];
        let exitScore = 0;
        
        // Implement exit criteria checks here...
        
        if (exitScore >= this.exitRequirements.criticalExitScore) {
            return this.createExitSignal(symbol, activePosition, exitFactors, exitScore, 'CRITICAL', currentPrice);
        } else if (exitScore >= this.exitRequirements.minExitScore) {
            return this.createExitSignal(symbol, activePosition, exitFactors, exitScore, 'WARNING', currentPrice);
        }
        
        this.updatePositionTracking(symbol, currentPrice, timestamp);
        return null;
    }

    performStructureAnalysis(symbol, priceHistory, currentPrice) {
        const confirmations = [];
        const currentAlerts = {};
        let primaryBrokenLevel = null;
        
        const swingAnalysis = this.analyzeSwingStructure(symbol, priceHistory, currentPrice);
        Object.assign(currentAlerts, swingAnalysis.alerts);
        confirmations.push(...swingAnalysis.confirmations);
        if (swingAnalysis.brokenLevel) primaryBrokenLevel = swingAnalysis.brokenLevel;
        
        const internalAnalysis = this.analyzeInternalStructure(symbol, priceHistory, currentPrice);
        Object.assign(currentAlerts, internalAnalysis.alerts);
        confirmations.push(...internalAnalysis.confirmations);
        if (!primaryBrokenLevel && internalAnalysis.brokenLevel) primaryBrokenLevel = internalAnalysis.brokenLevel;
        
        // ... other analyses (Order Blocks, FVG, etc.)
        const orderBlockAnalysis = this.analyzeOrderBlocks(symbol, priceHistory, currentPrice);
        confirmations.push(...orderBlockAnalysis.confirmations);
        const fvgAnalysis = this.analyzeFairValueGaps(symbol, priceHistory, currentPrice);
        confirmations.push(...fvgAnalysis.confirmations);
        const eqhlAnalysis = this.analyzeEqualHighsLows(symbol, priceHistory, currentPrice);
        confirmations.push(...eqhlAnalysis.confirmations);
        const zoneAnalysis = this.analyzePremiumDiscountZones(symbol, priceHistory, currentPrice);
        confirmations.push(...zoneAnalysis.confirmations);
        const additionalConfluences = this.analyzeAdditionalFactors(symbol, priceHistory, currentPrice);
        confirmations.push(...additionalConfluences.confirmations);

        let signalDirection = null;
        if (swingAnalysis.alerts.swingBullishBOS || swingAnalysis.alerts.swingBullishCHoCH || internalAnalysis.alerts.internalBullishBOS || internalAnalysis.alerts.internalBullishCHoCH) {
            signalDirection = 'BUY';
        } else if (swingAnalysis.alerts.swingBearishBOS || swingAnalysis.alerts.swingBearishCHoCH || internalAnalysis.alerts.internalBearishBOS || internalAnalysis.alerts.internalBearishCHoCH) {
            signalDirection = 'SELL';
        }
        
        return {
            signalDirection,
            confirmations,
            alerts: currentAlerts,
            brokenLevel: primaryBrokenLevel,
            analysis: this.generateAnalysisText(signalDirection, confirmations)
        };
    }

    analyzeSwingStructure(symbol, priceHistory, currentPrice) {
        const alerts = {};
        const confirmations = [];
        let brokenLevel = null;
        const swingHigh = this.swingHighs.get(symbol) || { currentLevel: null, crossed: false };
        const swingLow = this.swingLows.get(symbol) || { currentLevel: null, crossed: false };
        const swingTrend = this.swingTrend.get(symbol) || { bias: 0 };
        const swingPoints = this.detectSwingPoints(priceHistory, 50);
        if (swingPoints.newHigh) {
            swingHigh.currentLevel = swingPoints.high;
            swingHigh.crossed = false;
            this.swingHighs.set(symbol, swingHigh);
        }
        if (swingPoints.newLow) {
            swingLow.currentLevel = swingPoints.low;
            swingLow.crossed = false;
            this.swingLows.set(symbol, swingLow);
        }
        if (swingHigh.currentLevel && currentPrice > swingHigh.currentLevel && !swingHigh.crossed) {
            const tag = swingTrend.bias === -1 ? 'CHoCH' : 'BOS';
            alerts.swingBullishBOS = tag === 'BOS';
            alerts.swingBullishCHoCH = tag === 'CHoCH';
            if (tag === 'BOS') confirmations.push('swingBullishBOS');
            if (tag === 'CHoCH') confirmations.push('swingBullishCHoCH');
            brokenLevel = swingHigh.currentLevel;
            swingHigh.crossed = true;
            swingTrend.bias = 1;
            this.swingTrend.set(symbol, swingTrend);
        }
        if (swingLow.currentLevel && currentPrice < swingLow.currentLevel && !swingLow.crossed) {
            const tag = swingTrend.bias === 1 ? 'CHoCH' : 'BOS';
            alerts.swingBearishBOS = tag === 'BOS';
            alerts.swingBearishCHoCH = tag === 'CHoCH';
            if (tag === 'BOS') confirmations.push('swingBearishBOS');
            if (tag === 'CHoCH') confirmations.push('swingBearishCHoCH');
            brokenLevel = swingLow.currentLevel;
            swingLow.crossed = true;
            swingTrend.bias = -1;
            this.swingTrend.set(symbol, swingTrend);
        }
        return { alerts, confirmations, brokenLevel };
    }

    analyzeInternalStructure(symbol, priceHistory, currentPrice) {
        const alerts = {};
        const confirmations = [];
        let brokenLevel = null;
        const internalHigh = this.internalHighs.get(symbol) || { currentLevel: null, crossed: false };
        const internalLow = this.internalLows.get(symbol) || { currentLevel: null, crossed: false };
        const internalTrend = this.internalTrend.get(symbol) || { bias: 0 };
        const internalSwings = this.detectSwingPoints(priceHistory, 5);
        if (internalSwings.newHigh) {
            internalHigh.currentLevel = internalSwings.high;
            internalHigh.crossed = false;
            this.internalHighs.set(symbol, internalHigh);
        }
        if (internalSwings.newLow) {
            internalLow.currentLevel = internalSwings.low;
            internalLow.crossed = false;
            this.internalLows.set(symbol, internalLow);
        }
        if (internalHigh.currentLevel && currentPrice > internalHigh.currentLevel && !internalHigh.crossed) {
            const tag = internalTrend.bias === -1 ? 'CHoCH' : 'BOS';
            alerts.internalBullishBOS = tag === 'BOS';
            alerts.internalBullishCHoCH = tag === 'CHoCH';
            if (tag === 'BOS') confirmations.push('internalBullishBOS');
            if (tag === 'CHoCH') confirmations.push('internalBullishCHoCH');
            if (!brokenLevel) brokenLevel = internalHigh.currentLevel;
            internalHigh.crossed = true;
            internalTrend.bias = 1;
            this.internalTrend.set(symbol, internalTrend);
        }
        if (internalLow.currentLevel && currentPrice < internalLow.currentLevel && !internalLow.crossed) {
            const tag = internalTrend.bias === 1 ? 'CHoCH' : 'BOS';
            alerts.internalBearishBOS = tag === 'BOS';
            alerts.internalBearishCHoCH = tag === 'CHoCH';
            if (tag === 'BOS') confirmations.push('internalBearishBOS');
            if (tag === 'CHoCH') confirmations.push('internalBearishCHoCH');
            if (!brokenLevel) brokenLevel = internalLow.currentLevel;
            internalLow.crossed = true;
            internalTrend.bias = -1;
            this.internalTrend.set(symbol, internalTrend);
        }
        return { alerts, confirmations, brokenLevel };
    }

    analyzeOrderBlocks(symbol, priceHistory, currentPrice) { return { confirmations: [] }; }
    analyzeFairValueGaps(symbol, priceHistory, currentPrice) { return { confirmations: [] }; }
    analyzeEqualHighsLows(symbol, priceHistory, currentPrice) { return { confirmations: [] }; }
    analyzePremiumDiscountZones(symbol, priceHistory, currentPrice) { return { confirmations: [] }; }
    analyzeAdditionalFactors(symbol, priceHistory, currentPrice) { return { confirmations: [] }; }

    calculateConfidence(confirmations) {
        let totalScore = 0;
        confirmations.forEach(c => { totalScore += this.confirmationScores[c] || 0; });
        return Math.min(Math.round(totalScore), 100);
    }

    createTradingSignal(symbol, analysis, currentPrice) {
        const confidence = this.calculateConfidence(analysis.confirmations);
        const priceHistory = this.priceHistory.get(symbol);
        
        const tradingLevels = this.calculateTradingLevels(
            symbol, 
            analysis.signalDirection, 
            currentPrice, 
            priceHistory, 
            analysis.brokenLevel
        );
        
        return {
            symbol,
            signalType: analysis.signalDirection,
            confidence,
            entryPrice: tradingLevels.entryPrice,
            stopLoss: tradingLevels.stopLoss,
            takeProfit: tradingLevels.takeProfit, // Primary TP
            primaryRiskReward: tradingLevels.primaryRiskReward,
            multipleTargets: tradingLevels.multipleTargets,
            targetSummary: tradingLevels.targetSummary,
            positionSizing: tradingLevels.positionSizing,
            exitStrategy: tradingLevels.exitStrategy,
            confirmations: this.formatConfirmations(analysis.confirmations),
            timestamp: new Date(),
            analysis: analysis.analysis,
            sessionQuality: this.getSessionQuality(),
            timeframe: '15m',
            riskDistance: tradingLevels.riskDistance,
        };
    }

    calculateTradingLevels(symbol, signalDirection, currentPrice, priceHistory, brokenLevel) {
        const rrCalculator = new RiskRewardCalculator();
        const atrMeasure = this.calculateATR(priceHistory, 200);
        let entryPrice = currentPrice;
        let stopLossLevel;
        if (signalDirection === 'BUY') {
            stopLossLevel = brokenLevel - (atrMeasure * 0.5);
            if (stopLossLevel >= entryPrice) stopLossLevel = entryPrice - (atrMeasure * 1.0);
        } else {
            stopLossLevel = brokenLevel + (atrMeasure * 0.5);
            if (stopLossLevel <= entryPrice) stopLossLevel = entryPrice + (atrMeasure * 1.0);
        }
        const logicalTargets = rrCalculator.calculateLogicalTargets(symbol, signalDirection, entryPrice, stopLossLevel, priceHistory);
        const primaryTarget = logicalTargets[0];
        const primaryTakeProfit = primaryTarget ? primaryTarget.price : (signalDirection === 'BUY' ? entryPrice + (Math.abs(entryPrice - stopLossLevel) * 2.0) : entryPrice - (Math.abs(entryPrice - stopLossLevel) * 2.0));
        const riskDistance = Math.abs(entryPrice - stopLossLevel);
        const targetAnalysis = logicalTargets.map((target, index) => ({
            level: index + 1, price: parseFloat(target.price.toFixed(this.getSymbolPrecision(symbol))),
            riskReward: target.riskReward, type: target.type, description: target.description,
            probability: target.probability, priority: target.priority
        }));
        const precision = this.getSymbolPrecision(symbol);
        return {
            entryPrice: parseFloat(entryPrice.toFixed(precision)),
            stopLoss: parseFloat(stopLossLevel.toFixed(precision)),
            takeProfit: parseFloat(primaryTakeProfit.toFixed(precision)),
            primaryRiskReward: `1:${primaryTarget ? primaryTarget.riskReward : 2.0}`,
            multipleTargets: targetAnalysis,
            targetSummary: this.generateTargetSummary(targetAnalysis),
            atrUsed: parseFloat(atrMeasure.toFixed(precision)),
            riskDistance: parseFloat(riskDistance.toFixed(precision)),
            positionSizing: this.calculatePositionSizing(targetAnalysis),
            exitStrategy: this.generateExitStrategy(targetAnalysis)
        };
    }

    generateTargetSummary(targets) {
        if (targets.length === 0) return 'Standard 1:2 Risk-Reward Target';
        const highProbTargets = targets.filter(t => t.probability >= 70).length;
        const avgRR = targets.reduce((sum, t) => sum + t.riskReward, 0) / targets.length;
        return `${targets.length} logical targets identified. ${highProbTargets} high-probability levels. Average RR: 1:${avgRR.toFixed(1)}`;
    }

    calculatePositionSizing(targets) {
        const highProbTargets = targets.filter(t => t.probability >= 75);
        if (highProbTargets.length >= 3) return { recommended: 'Standard', percentage: '1-2%', reason: 'Multiple high-probability targets' };
        if (highProbTargets.length >= 1) return { recommended: 'Conservative', percentage: '0.5-1%', reason: 'Limited high-probability targets' };
        return { recommended: 'Minimal', percentage: '0.25-0.5%', reason: 'Lower probability setup' };
    }

    generateExitStrategy(targets) {
        if (targets.length <= 1) return 'Single target exit at TP level';
        let strategy = 'Partial exit strategy: ';
        if (targets.length >= 3) strategy += '25% at Target 1, 35% at Target 2, 40% at Target 3+';
        else strategy += '50% at Target 1, 50% at Target 2';
        strategy += '. Move SL to breakeven after Target 1.';
        return strategy;
    }

    validateSignalQuality(analysis) {
        if (!analysis.signalDirection) return false;
        const primaryCount = analysis.confirmations.filter(c => c.includes('BOS') || c.includes('CHoCH')).length;
        const confidence = this.calculateConfidence(analysis.confirmations);
        return (primaryCount >= this.signalRequirements.minPrimaryConfirmations &&
            analysis.confirmations.length >= this.signalRequirements.minTotalConfirmations &&
            confidence >= this.signalRequirements.minConfidenceScore);
    }

    detectSwingPoints(priceHistory, lookback) {
        if (priceHistory.length < lookback * 2 + 1) return { newHigh: false, newLow: false };
        const currentIndex = priceHistory.length - lookback - 1;
        const currentBar = priceHistory[currentIndex];
        let isSwingHigh = true, isSwingLow = true;
        for (let i = currentIndex - lookback; i <= currentIndex + lookback; i++) {
            if (i !== currentIndex && i >= 0 && i < priceHistory.length) {
                if (priceHistory[i].high >= currentBar.high) isSwingHigh = false;
                if (priceHistory[i].low <= currentBar.low) isSwingLow = false;
            }
        }
        return { newHigh: isSwingHigh, newLow: isSwingLow, high: isSwingHigh ? currentBar.high : null, low: isSwingLow ? currentBar.low : null };
    }

    calculateATR(priceHistory, period) {
        if (priceHistory.length < period + 1) return priceHistory.length > 0 ? priceHistory[0].close * 0.001 : 0;
        const trueRanges = [];
        for (let i = 1; i < priceHistory.length; i++) {
            const tr = Math.max(priceHistory[i].high - priceHistory[i].low, Math.abs(priceHistory[i].high - priceHistory[i-1].close), Math.abs(priceHistory[i].low - priceHistory[i-1].close));
            trueRanges.push(tr);
        }
        const recentTRs = trueRanges.slice(-period);
        return recentTRs.reduce((sum, tr) => sum + tr, 0) / recentTRs.length;
    }

    canGenerateSignal(symbol, timestamp) {
        const lastSignal = this.lastSignalTime.get(symbol);
        return !lastSignal || (timestamp - lastSignal) >= this.signalRequirements.cooldownPeriod;
    }
    
    getSymbolPrecision(symbol) { return symbol.includes('JPY') ? 3 : 5; }
    formatConfirmations(confirmations) { return confirmations; }
    generateAnalysisText(signalDirection, confirmations) { return `Analysis based on ${confirmations.length} confirmations.`; }
    getSessionQuality() { return 'N/A'; }
    trackNewPosition(symbol, signal, timestamp) { this.activePositions.set(symbol, { ...signal, entryTime: timestamp }); }
    updatePositionTracking(symbol, currentPrice, timestamp) {}
    createExitSignal(symbol, position, exitFactors, exitScore, urgency, currentPrice) { return null; }
}


/**
 * Smart Money Concepts Analyzer
 * Integrates the professional trading engine to provide advanced signals.
 */
class SmartMoneyAnalyzer {
  constructor() {
    this.baseUrl = 'https://financialmodelingprep.com/api/v3';
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
    this.smcEngine = new ProfessionalSMCEngine();
    console.log(`🧠 Smart Money Analyzer initialized with Professional Engine`);
  }

  async analyzeSymbol(symbol, timeframe, apiKey) {
    try {
      console.log(`📊 Starting analysis for ${symbol} on ${timeframe}`);
      const historicalData = await this.fetchHistoricalData(symbol, timeframe, apiKey);
      
      if (!historicalData || historicalData.length < this.smcEngine.signalRequirements.minHistoryBars) {
        throw new Error(`Insufficient data for analysis. Need at least ${this.smcEngine.signalRequirements.minHistoryBars} candles, got ${historicalData?.length || 0}`);
      }

      console.log(`📈 Fetched ${historicalData.length} candles for analysis`);
      
      const signal = this.smcEngine.analyzeSMCPatterns(symbol, historicalData);
      
      if (signal) {
        console.log(`✅ Signal generated for ${symbol}:`, {
            direction: signal.signalType,
            confidence: signal.confidence
        });
        return signal;
      } else {
        console.log(`ℹ️ No high-quality signal found for ${symbol}`);
        return {
            symbol,
            timeframe,
            direction: 'NEUTRAL',
            analysis: 'No high-probability trading setup detected based on current market structure.',
            confidence: 40,
            timestamp: new Date().toISOString(),
        };
      }
      
    } catch (error) {
      console.error(`❌ Analysis failed for ${symbol}:`, error.message);
      throw new Error(`Analysis failed for ${symbol}: ${error.message}`);
    }
  }

  async fetchHistoricalData(symbol, timeframe, apiKey) {
    try {
      let endpoint;
      let formattedSymbol = symbol.toUpperCase();
      
      if (formattedSymbol.includes('/')) {
        formattedSymbol = formattedSymbol.replace('/', '');
        endpoint = `/historical-chart/${timeframe}/${formattedSymbol}`;
      } else {
        endpoint = `/historical-chart/${timeframe}/${formattedSymbol}`;
      }

      console.log(`🌐 Fetching data from: ${this.baseUrl}${endpoint}`);
      
      const response = await this.apiClient.get(endpoint, {
        params: { apikey: apiKey },
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from FMP API');
      }

      if (response.data.length === 0) {
        throw new Error(`No data available for symbol ${symbol} on timeframe ${timeframe}`);
      }

      const sortedData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      console.log(`✅ Successfully fetched ${sortedData.length} candles`);
      
      return sortedData;
      
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        const message = data?.message || error.response.statusText;
        if (status === 401) throw new Error('Invalid API key.');
        if (status === 429) throw new Error('API rate limit exceeded.');
        if (status === 404) throw new Error(`Symbol ${symbol} not found or invalid timeframe ${timeframe}.`);
        throw new Error(`FMP API error (${status}): ${message}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. FMP API is not responding.');
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
  }

  getStatus() {
    return {
      baseUrl: this.baseUrl,
      timeout: this.apiClient.defaults.timeout,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = SmartMoneyAnalyzer;
