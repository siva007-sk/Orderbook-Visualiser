import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderBookData } from "@/types/orderbook";
import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

interface OrderbookStatsProps {
  orderbookData: OrderBookData[];
  isConnected: boolean;
}

export const OrderbookStats = ({ orderbookData, isConnected }: OrderbookStatsProps) => {
  const stats = orderbookData.reduce((acc, data) => {
    const topBid = data.bids[0]?.price || 0;
    const topAsk = data.asks[0]?.price || 0;
    const spread = topAsk - topBid;
    const spreadPercent = (spread / topBid) * 100;
    
    const totalBidVolume = data.bids.reduce((sum, bid) => sum + bid.quantity, 0);
    const totalAskVolume = data.asks.reduce((sum, ask) => sum + ask.quantity, 0);
    
    return {
      bestBid: Math.max(acc.bestBid, topBid),
      bestAsk: Math.min(acc.bestAsk || Infinity, topAsk),
      totalBidVolume: acc.totalBidVolume + totalBidVolume,
      totalAskVolume: acc.totalAskVolume + totalAskVolume,
      avgSpread: acc.avgSpread + spreadPercent,
      venues: acc.venues + 1
    };
  }, {
    bestBid: 0,
    bestAsk: 0,
    totalBidVolume: 0,
    totalAskVolume: 0,
    avgSpread: 0,
    venues: 0
  });

  const midPrice = (stats.bestBid + stats.bestAsk) / 2;
  const spread = stats.bestAsk - stats.bestBid;
  const spreadPercent = (spread / stats.bestBid) * 100;
  const volumeImbalance = (stats.totalBidVolume - stats.totalAskVolume) / 
                         (stats.totalBidVolume + stats.totalAskVolume) * 100;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Mid Price</p>
            <p className="text-2xl font-bold text-trading-neutral">
              ${midPrice.toLocaleString()}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-trading-neutral" />
        </div>
        <div className="flex items-center mt-2">
          <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
            {isConnected ? "Live" : "Disconnected"}
          </Badge>
        </div>
      </Card>

      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Spread</p>
            <p className="text-2xl font-bold text-foreground">
              ${spread.toFixed(2)}
            </p>
          </div>
          <Activity className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {spreadPercent.toFixed(3)}%
        </p>
      </Card>

      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Bid Volume</p>
            <p className="text-2xl font-bold text-trading-bid">
              {stats.totalBidVolume.toFixed(2)}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-trading-bid" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {stats.venues} venues
        </p>
      </Card>

      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Ask Volume</p>
            <p className="text-2xl font-bold text-trading-ask">
              {stats.totalAskVolume.toFixed(2)}
            </p>
          </div>
          <TrendingDown className="w-8 h-8 text-trading-ask" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Imbalance: {volumeImbalance.toFixed(1)}%
        </p>
      </Card>
    </div>
  );
};