import React from 'react';
import { Download, FileText, Camera, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { OrderBookData } from '@/types/orderbook';
import { useToast } from '@/hooks/use-toast';

interface ExportControlsProps {
  orderbookData: OrderBookData[];
  historicalData: OrderBookData[][];
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  orderbookData,
  historicalData
}) => {
  const { toast } = useToast();

  const exportSnapshot = () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      data: orderbookData,
      metadata: {
        venues: orderbookData.map(d => d.venue),
        totalBidVolume: orderbookData.reduce((sum, d) => 
          sum + d.bids.reduce((bidSum, bid) => bidSum + bid.quantity, 0), 0),
        totalAskVolume: orderbookData.reduce((sum, d) => 
          sum + d.asks.reduce((askSum, ask) => askSum + ask.quantity, 0), 0),
      }
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orderbook-snapshot-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Snapshot Exported",
      description: "Orderbook snapshot saved successfully"
    });
  };

  const exportAnalysisReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        venues: orderbookData.length,
        totalBidLevels: orderbookData.reduce((sum, d) => sum + d.bids.length, 0),
        totalAskLevels: orderbookData.reduce((sum, d) => sum + d.asks.length, 0),
        averageSpread: orderbookData.reduce((sum, d) => {
          const bestBid = Math.max(...d.bids.map(b => b.price));
          const bestAsk = Math.min(...d.asks.map(a => a.price));
          return sum + (bestAsk - bestBid);
        }, 0) / orderbookData.length,
      },
      historicalAnalysis: {
        dataPoints: historicalData.length,
        timeRange: historicalData.length > 0 ? `${historicalData.length} seconds` : 'No data',
      },
      detailedData: orderbookData
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orderbook-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Analysis Report Exported",
      description: "Detailed analysis report saved successfully"
    });
  };

  const exportCSV = () => {
    const csvData = orderbookData.flatMap(data => [
      ...data.bids.map(bid => ({
        venue: data.venue,
        side: 'bid',
        price: bid.price,
        quantity: bid.quantity,
        total: bid.total,
        timestamp: new Date(bid.timestamp).toISOString()
      })),
      ...data.asks.map(ask => ({
        venue: data.venue,
        side: 'ask',
        price: ask.price,
        quantity: ask.quantity,
        total: ask.total,
        timestamp: new Date(ask.timestamp).toISOString()
      }))
    ]);

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => row[h as keyof typeof row]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orderbook-data-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: "Orderbook data exported to CSV format"
    });
  };

  const captureScreenshot = () => {
    // This would capture the 3D canvas in a real implementation
    toast({
      title: "Screenshot Feature",
      description: "Screenshot functionality would capture the 3D visualization"
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={exportSnapshot}>
          <FileText className="mr-2 h-4 w-4" />
          Current Snapshot (JSON)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAnalysisReport}>
          <BarChart3 className="mr-2 h-4 w-4" />
          Analysis Report (JSON)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Raw Data (CSV)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={captureScreenshot}>
          <Camera className="mr-2 h-4 w-4" />
          Capture Screenshot
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};