import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { OrderBookData, PressureZone } from '@/types/orderbook';

interface PressureZonePredictionProps {
  orderbookData: OrderBookData[];
  historicalData: OrderBookData[][];
}

interface PredictedZone extends PressureZone {
  confidence: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  volume: number;
}

export const PressureZonePrediction: React.FC<PressureZonePredictionProps> = ({
  orderbookData,
  historicalData
}) => {
  const predictions = useMemo(() => {
    if (!orderbookData.length || historicalData.length < 5) {
      return [];
    }

    const zones: PredictedZone[] = [];
    
    // Simple ML-like algorithm: analyze volume patterns and price clustering
    orderbookData.forEach(data => {
      // Analyze bid clusters
      const bidClusters = findVolumeClusters(data.bids.map(b => ({ price: b.price, volume: b.quantity })));
      const askClusters = findVolumeClusters(data.asks.map(a => ({ price: a.price, volume: a.quantity })));
      
      // Predict zones based on volume clustering and historical patterns
      [...bidClusters, ...askClusters].forEach(cluster => {
        const historicalPressure = calculateHistoricalPressure(cluster.price, historicalData);
        const volumeIntensity = cluster.volume > 1000 ? 'high' : cluster.volume > 500 ? 'medium' : 'low';
        
        // Calculate confidence based on multiple factors
        const confidence = Math.min(
          (cluster.volume / 2000) * 0.4 + // Volume factor
          historicalPressure * 0.3 + // Historical factor
          (cluster.points / 10) * 0.3, // Clustering factor
          1
        );
        
        if (confidence > 0.3) {
          zones.push({
            price: cluster.price,
            quantity: cluster.volume,
            intensity: volumeIntensity as 'low' | 'medium' | 'high',
            side: cluster.price < getCurrentMidPrice(data) ? 'bid' : 'ask',
            timestamp: Date.now(),
            confidence,
            direction: predictDirection(cluster, historicalData),
            volume: cluster.volume
          });
        }
      });
    });
    
    // Sort by confidence and return top 5
    return zones.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }, [orderbookData, historicalData]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          ML Pressure Zones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {predictions.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            Analyzing patterns...
            <br />
            <span className="text-xs">Need more data for predictions</span>
          </div>
        ) : (
          predictions.map((zone, index) => (
            <div key={index} className="p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {zone.direction === 'bullish' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : zone.direction === 'bearish' ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="font-mono text-sm">
                    ${zone.price.toLocaleString()}
                  </span>
                </div>
                <Badge 
                  variant={zone.intensity === 'high' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {(zone.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>
                  <div>Side</div>
                  <div className={zone.side === 'bid' ? 'text-green-400' : 'text-red-400'}>
                    {zone.side.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div>Volume</div>
                  <div>{zone.volume.toLocaleString()}</div>
                </div>
                <div>
                  <div>Intensity</div>
                  <div className={
                    zone.intensity === 'high' ? 'text-red-400' :
                    zone.intensity === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }>
                    {zone.intensity.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/20 rounded">
          <strong>ML Algorithm:</strong> Analyzes volume clustering, historical patterns, 
          and price action to predict potential support/resistance zones.
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions for the ML algorithm
function findVolumeClusters(data: { price: number; volume: number }[]) {
  const clusters: { price: number; volume: number; points: number }[] = [];
  const sorted = data.sort((a, b) => a.price - b.price);
  
  let currentCluster = { price: sorted[0]?.price || 0, volume: 0, points: 0 };
  const threshold = 10; // Price threshold for clustering
  
  sorted.forEach(point => {
    if (Math.abs(point.price - currentCluster.price) <= threshold) {
      currentCluster.volume += point.volume;
      currentCluster.points += 1;
    } else {
      if (currentCluster.volume > 100) {
        clusters.push({ ...currentCluster });
      }
      currentCluster = { price: point.price, volume: point.volume, points: 1 };
    }
  });
  
  if (currentCluster.volume > 100) {
    clusters.push(currentCluster);
  }
  
  return clusters.sort((a, b) => b.volume - a.volume).slice(0, 3);
}

function calculateHistoricalPressure(price: number, historicalData: OrderBookData[][]): number {
  let pressureScore = 0;
  let dataPoints = 0;
  
  historicalData.slice(-10).forEach(snapshot => {
    snapshot.forEach(data => {
      // Check if this price level had significant activity
      const nearbyBids = data.bids.filter(b => Math.abs(b.price - price) < 20);
      const nearbyAsks = data.asks.filter(a => Math.abs(a.price - price) < 20);
      
      if (nearbyBids.length > 0 || nearbyAsks.length > 0) {
        const totalVolume = [...nearbyBids, ...nearbyAsks]
          .reduce((sum, level) => sum + level.quantity, 0);
        pressureScore += Math.min(totalVolume / 1000, 1);
        dataPoints += 1;
      }
    });
  });
  
  return dataPoints > 0 ? pressureScore / dataPoints : 0;
}

function predictDirection(
  cluster: { price: number; volume: number; points: number }, 
  historicalData: OrderBookData[][]
): 'bullish' | 'bearish' | 'neutral' {
  // Simple momentum analysis
  if (historicalData.length < 3) return 'neutral';
  
  const recentPrices = historicalData.slice(-3).map(snapshot => {
    const allPrices = snapshot.flatMap(data => [
      ...data.bids.map(b => b.price),
      ...data.asks.map(a => a.price)
    ]);
    return allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length;
  });
  
  const trend = recentPrices[recentPrices.length - 1] - recentPrices[0];
  
  if (trend > 50) return 'bullish';
  if (trend < -50) return 'bearish';
  return 'neutral';
}

function getCurrentMidPrice(data: OrderBookData): number {
  const bestBid = Math.max(...data.bids.map(b => b.price));
  const bestAsk = Math.min(...data.asks.map(a => a.price));
  return (bestBid + bestAsk) / 2;
}