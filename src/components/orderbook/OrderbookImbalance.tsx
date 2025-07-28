import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderBookData } from '@/types/orderbook';

interface OrderbookImbalanceProps {
  orderbookData: OrderBookData[];
  historicalData: OrderBookData[][];
}

interface ImbalancePoint {
  timestamp: number;
  ratio: number;
  bidVolume: number;
  askVolume: number;
  imbalance: 'buy' | 'sell' | 'neutral';
}

export const OrderbookImbalance: React.FC<OrderbookImbalanceProps> = ({
  orderbookData,
  historicalData
}) => {
  const imbalanceData = useMemo(() => {
    const points: ImbalancePoint[] = [];
    
    // Add current data point
    const currentBidVolume = orderbookData.reduce((sum, data) => 
      sum + data.bids.reduce((bidSum, bid) => bidSum + bid.quantity, 0), 0);
    const currentAskVolume = orderbookData.reduce((sum, data) => 
      sum + data.asks.reduce((askSum, ask) => askSum + ask.quantity, 0), 0);
    
    const currentRatio = currentBidVolume / (currentAskVolume || 1);
    const currentImbalance = currentRatio > 1.2 ? 'buy' : currentRatio < 0.8 ? 'sell' : 'neutral';
    
    points.push({
      timestamp: Date.now(),
      ratio: currentRatio,
      bidVolume: currentBidVolume,
      askVolume: currentAskVolume,
      imbalance: currentImbalance
    });
    
    // Add historical data points
    historicalData.slice(-20).forEach((snapshot, index) => {
      const bidVolume = snapshot.reduce((sum, data) => 
        sum + data.bids.reduce((bidSum, bid) => bidSum + bid.quantity, 0), 0);
      const askVolume = snapshot.reduce((sum, data) => 
        sum + data.asks.reduce((askSum, ask) => askSum + ask.quantity, 0), 0);
      
      const ratio = bidVolume / (askVolume || 1);
      const imbalance = ratio > 1.2 ? 'buy' : ratio < 0.8 ? 'sell' : 'neutral';
      
      points.unshift({
        timestamp: Date.now() - (20 - index) * 1000,
        ratio,
        bidVolume,
        askVolume,
        imbalance
      });
    });
    
    return points;
  }, [orderbookData, historicalData]);

  const currentImbalance = imbalanceData[imbalanceData.length - 1];
  const imbalancePercentage = Math.abs((currentImbalance?.ratio || 1) - 1) * 100;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order Imbalance</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={
                currentImbalance?.imbalance === 'buy' ? 'default' : 
                currentImbalance?.imbalance === 'sell' ? 'destructive' : 
                'secondary'
              }
              className="text-xs"
            >
              {currentImbalance?.imbalance.toUpperCase()}
            </Badge>
            <span className="text-sm font-mono">
              {imbalancePercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-32 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={imbalanceData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="timestamp" 
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tick={false}
              />
              <YAxis 
                domain={[0.5, 2]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                formatter={(value: number) => [value.toFixed(3), 'Ratio']}
              />
              <Line 
                type="monotone" 
                dataKey="ratio" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                strokeDasharray={imbalanceData.length > 0 && imbalanceData[imbalanceData.length - 1].ratio > 1.2 ? "5,5" : "0"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Bid Volume</div>
            <div className="font-mono text-green-400">
              {currentImbalance?.bidVolume.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Ask Volume</div>
            <div className="font-mono text-red-400">
              {currentImbalance?.askVolume.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};