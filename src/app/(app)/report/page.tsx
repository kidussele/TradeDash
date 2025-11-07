'use client';

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { JournalEntry } from '@/app/(app)/journal/page';
import type { BacktestJournalEntry } from '@/app/(app)/backtest-journal/page';
import { Download } from 'lucide-react';

type AnyEntry = JournalEntry | BacktestJournalEntry;

const ReportGenerator = ({ journalType }: { journalType: 'live' | 'backtest' }) => {
  const [entries, setEntries] = useState<AnyEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  const storageKey = journalType === 'live' ? 'journalEntries' : 'backtestJournalEntries';
  const reportTitle = journalType === 'live' ? 'Live Trading Journal Report' : 'Backtest Trading Journal Report';
  const fileName = journalType === 'live' ? 'live_journal_report' : 'backtest_journal_report';


  useEffect(() => {
    setIsClient(true);
    const storedEntries = localStorage.getItem(storageKey);
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries).map((entry: any) => ({
        ...entry,
        date: entry.date ? new Date(entry.date) : new Date(),
        entryTime: entry.entryTime ? new Date(entry.entryTime) : undefined,
        exitTime: entry.exitTime ? new Date(entry.exitTime) : undefined,
      })));
    }
  }, [storageKey]);

  const generateSummary = () => {
    const closedTrades = entries.filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);
    const totalPnl = closedTrades.reduce((acc, trade) => acc + (trade.pnl || 0), 0);
    const wins = closedTrades.filter(trade => trade.result === 'Win').length;
    const losses = closedTrades.filter(trade => trade.result === 'Loss').length;
    const breakevens = closedTrades.filter(trade => trade.result === 'Breakeven').length;
    const winRate = closedTrades.length > 0 ? (wins / (wins + losses)) * 100 : 0;
    const totalTrades = closedTrades.length;

    return {
      totalPnl,
      totalTrades,
      wins,
      losses,
      breakevens,
      winRate,
    };
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const summary = generateSummary();

    // Add title
    doc.setFontSize(22);
    doc.text(reportTitle, 14, 22);

    // Add summary
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    
    (doc as any).autoTable({
      startY: 40,
      head: [['Metric', 'Value']],
      body: [
        ['Total Trades', summary.totalTrades],
        ['Net P&L', summary.totalPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })],
        ['Win Rate', `${summary.winRate.toFixed(2)}%`],
        ['Wins', summary.wins],
        ['Losses', summary.losses],
        ['Breakevens', summary.breakevens],
      ],
      theme: 'striped',
    });
    
    // Add trades table
    (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Date', 'Pair', 'Direction', 'P&L', 'Result', 'R-Multiple']],
        body: entries.map(entry => [
            entry.date.toLocaleDateString(),
            entry.currencyPair,
            entry.direction,
            entry.pnl?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? 'N/A',
            entry.result,
            entry.rMultiple?.toFixed(2) ?? 'N/A'
        ]),
        theme: 'grid',
    });


    doc.save(`${fileName}.pdf`);
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(entries.map(e => ({
        ...e,
        date: e.date.toLocaleDateString(),
        entryTime: e.entryTime?.toLocaleString(),
        exitTime: e.exitTime?.toLocaleString(),
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trades');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };
  
  if (!isClient) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{reportTitle}</CardTitle>
        <CardDescription>
          Generate and export a full report of your {journalType} trading activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="flex gap-4">
            <Button onClick={handleExportPDF}>
                <Download className="mr-2" />
                Export to PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline">
                <Download className="mr-2" />
                Export to Excel
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No entries found in this journal to generate a report.
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export default function ReportPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="journal">
        <TabsList>
          <TabsTrigger value="journal">Journal Report</TabsTrigger>
          <TabsTrigger value="backtest">Backtest Report</TabsTrigger>
        </TabsList>
        <TabsContent value="journal">
          <ReportGenerator journalType="live" />
        </TabsContent>
        <TabsContent value="backtest">
          <ReportGenerator journalType="backtest" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
