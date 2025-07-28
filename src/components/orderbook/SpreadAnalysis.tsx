import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { OrderBookData } from "@/types/orderbook";
import { TrendingUp, TrendingDown, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { useMemo } from "react";

interface SpreadAnalysisProps {
  orderbookData: OrderBookData[];
}

interface SpreadMetrics {
  venue: string;
  bidPrice: number;
  askPrice: number;
  spread: number;
  spreadPercentage: number;
  category: 'tight' | 'normal' | 'wide';
  liquidity: number;
}

export const SpreadAnalysis = ({ orderbookData }: SpreadAnalysisProps) => {
  const spreadMetrics = useMemo(() => {
    return orderbookData.map(data => {
      const topBid = data.bids[0];
      const topAsk = data.asks[0];

      if (!topBid || !topAsk) {
        return {
          venue: data.venue,
          bidPrice: 0,
          askPrice: 0,
          spread: 0,
          spreadPercentage: 0,
          category: 'wide' as const,
          liquidity: 0
        };
      }

      const spread = topAsk.price - topBid.price;
      const spreadPercentage = (spread / topBid.price) * 100;
      const liquidity = topBid.quantity + topAsk.quantity;

      let category: 'tight' | 'normal' | 'wide';
      if (spreadPercentage < 0.01) category = 'tight';
      else if (spreadPercentage < 0.05) category = 'normal';
      else category = 'wide';

      return {
        venue: data.venue,
        bidPrice: topBid.price,
        askPrice: topAsk.price,
        spread,
        spreadPercentage,
        category,
        liquidity
      };
    }).sort((a, b) => a.spreadPercentage - b.spreadPercentage);
  }, [orderbookData]);

  const overallMetrics = useMemo(() => {
    if (spreadMetrics.length === 0) return null;

    const avgSpread = spreadMetrics.reduce((sum, m) => sum + m.spread, 0) / spreadMetrics.length;
    const avgSpreadPercentage = spreadMetrics.reduce((sum, m) => sum + m.spreadPercentage, 0) / spreadMetrics.length;
    const tightestSpread = Math.min(...spreadMetrics.map(m => m.spreadPercentage));
    const widestSpread = Math.max(...spreadMetrics.map(m => m.spreadPercentage));
    const totalLiquidity = spreadMetrics.reduce((sum, m) => sum + m.liquidity, 0);

    return {
      avgSpread,
      avgSpreadPercentage,
      tightestSpread,
      widestSpread,
      totalLiquidity
    };
  }, [spreadMetrics]);

  const getSpreadIndicator = (category: 'tight' | 'normal' | 'wide') => {
    switch (category) {
      case 'tight':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Tight' };
      case 'normal':
        return { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Normal' };
      case 'wide':
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Wide' };
    }
  };

  if (!overallMetrics) {
    return (
      <Card className="p-4 bg-card/30 backdrop-blur-sm border-border/50">
        <div className="text-center text-muted-foreground">
          No spread data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-border/50">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <Label className="text-sm font-semibold">Spread Analysis</Label>
          <Badge variant="outline" className="text-xs">
            {spreadMetrics.length} venues
          </Badge>
        </div>

        {/* Overall metrics */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/20 rounded-lg">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Average Spread</Label>
            <div className="text-sm font-mono">
              ${overallMetrics.avgSpread.toFixed(2)} ({overallMetrics.avgSpreadPercentage.toFixed(3)}%)
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Spread Range</Label>
            <div className="text-sm font-mono">
              {overallMetrics.tightestSpread.toFixed(3)}% - {overallMetrics.widestSpread.toFixed(3)}%
            </div>
          </div>
        </div>

        {/* Per-venue breakdown */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {spreadMetrics.map((metrics, index) => {
            const indicator = getSpreadIndicator(metrics.category);
            const Icon = indicator.icon;

            return (
              <div key={metrics.venue} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {metrics.venue.toUpperCase()}
                    </Badge>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded ${indicator.bg}`}>
                      <Icon className={`w-3 h-3 ${indicator.color}`} />
                      <span className={`text-xs ${indicator.color}`}>
                        {indicator.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {metrics.spreadPercentage.toFixed(3)}%
                  </div>
                </div>

                {/* Bid/Ask details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-trading-bid" />
                    <span className="text-trading-bid font-mono">
                      ${metrics.bidPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-trading-ask" />
                    <span className="text-trading-ask font-mono">
                      ${metrics.askPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Spread visualization */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Spread: ${metrics.spread.toFixed(2)}</span>
                    <span className="text-muted-foreground">Liquidity: {metrics.liquidity.toFixed(2)} BTC</span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.spreadPercentage / 0.1) * 100, 100)} 
                    className="h-2"
                  />
                </div>

                {index < spreadMetrics.length - 1 && (
                  <div className="border-b border-border/30" />
                )}
              </div>
            );
          })}
        </div>

        {/* Market conditions indicator */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Market Conditions</Label>
            <div className="flex items-center gap-1">
              {overallMetrics.avgSpreadPercentage < 0.02 ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">Tight Market</span>
                </>
              ) : overallMetrics.avgSpreadPercentage < 0.05 ? (
                <>
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-yellow-500">Normal Market</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-500">Wide Spreads</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};