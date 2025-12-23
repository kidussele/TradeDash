
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
import type { Note as MarketAnalysisNote } from '@/app/(app)/notebook/page';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';


type AnyEntry = JournalEntry | BacktestJournalEntry;

const ReportGenerator = ({ journalType }: { journalType: 'live' | 'backtest' }) => {
  const { user } = useUser();
  const firestore = useFirestore();

  const collectionName = journalType === 'live' ? 'journalEntries' : 'backtestJournalEntries';
  const entriesRef = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, collectionName) : null,
  [user, firestore, collectionName]);

  const { data: entries = [], isLoading } = useCollection<Omit<AnyEntry, 'id'>>(entriesRef);
  
  const [filteredEntries, setFilteredEntries] = useState<AnyEntry[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const reportTitle = journalType === 'live' ? 'Live Trading Journal Report' : 'Backtest Trading Journal Report';
  const fileName = journalType === 'live' ? 'live_journal_report' : 'backtest_journal_report';

  useEffect(() => {
    const safeEntries = entries || [];
    if (!dateRange?.from && !dateRange?.to) {
        setFilteredEntries(safeEntries);
        return;
    }

    const filtered = safeEntries.filter(entry => {
        const entryDate = startOfDay(new Date(entry.date));
        const from = dateRange.from ? startOfDay(dateRange.from) : null;
        const to = dateRange.to ? startOfDay(dateRange.to) : null;

        if (from && to) return entryDate >= from && entryDate <= to;
        if (from) return entryDate >= from;
        if (to) return entryDate <= to;
        return true;
    });
    setFilteredEntries(filtered);
  }, [dateRange, entries]);


  const generateSummary = (summaryEntries: AnyEntry[]) => {
    const closedTrades = summaryEntries.filter(e => e.result !== 'Ongoing' && e.pnl !== undefined);
    const totalPnl = closedTrades.reduce((acc, trade) => acc + (trade.pnl || 0), 0);
    const wins = closedTrades.filter(trade => trade.result === 'Win').length;
    const losses = closedTrades.filter(trade => trade.result === 'Loss').length;
    const breakevens = closedTrades.filter(trade => trade.result === 'Breakeven').length;
    const winRate = (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0;
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
    const summary = generateSummary(filteredEntries);
    const generationDate = new Date();

    doc.setFontSize(22);
    doc.text(reportTitle, 14, 22);

    doc.setFontSize(12);
    const dateRangeStr = dateRange?.from ? `${format(dateRange.from, "LLL dd, y")} to ${dateRange.to ? format(dateRange.to, "LLL dd, y") : 'present'}` : 'All time';
    doc.text(`Date Range: ${dateRangeStr}`, 14, 32);
    doc.text(`Generated on: ${generationDate.toLocaleString()}`, 14, 40);
    
    (doc as any).autoTable({
      startY: 50,
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
    
    (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Date', 'Pair', 'Direction', 'P&L', 'Result', 'R-Multiple']],
        body: filteredEntries.map(entry => [
            new Date(entry.date).toLocaleDateString(),
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
    const summary = generateSummary(filteredEntries);
    const generationDate = new Date();
    const dateRangeStr = dateRange?.from ? `${format(dateRange.from, "LLL dd, y")} to ${dateRange.to ? format(dateRange.to, "LLL dd, y") : 'present'}` : 'All time';

    const summaryData = [
        { Metric: 'Report Title', Value: reportTitle },
        { Metric: 'Date Range', Value: dateRangeStr },
        { Metric: 'Generated On', Value: generationDate.toLocaleString() },
        {}, // Spacer row
        { Metric: 'Total Trades', Value: summary.totalTrades },
        { Metric: 'Net P&L', Value: summary.totalPnl },
        { Metric: 'Win Rate (%)', Value: summary.winRate.toFixed(2) },
        { Metric: 'Wins', Value: summary.wins },
        { Metric: 'Losses', Value: summary.losses },
        { Metric: 'Breakevens', Value: summary.breakevens },
    ];
    
    const tradeData = filteredEntries.map(e => ({
        Date: new Date(e.date).toLocaleDateString(),
        Session: e.session || 'N/A',
        'Currency Pair': e.currencyPair,
        Direction: e.direction,
        'Entry Price': e.entryPrice,
        'Stop-Loss': e.stopLoss,
        'Take-Profit': e.takeProfit,
        'Position Size': e.positionSize,
        'P&L': e.pnl ?? 'N/A',
        'R-Multiple': e.rMultiple?.toFixed(2) ?? 'N/A',
        Result: e.result,
        'Adherence to Plan': e.adherenceToPlan,
        Notes: e.notes,
    }));

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    const tradesWorksheet = XLSX.utils.json_to_sheet(tradeData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
    XLSX.utils.book_append_sheet(workbook, tradesWorksheet, 'Trades');

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };
  
  if (isLoading) return <div>Loading reports...</div>;

  return (
    <Card className="animate-in fade-in-0 duration-500">
      <CardHeader>
        <CardTitle>{reportTitle}</CardTitle>
        <CardDescription>
          Generate and export a full report of your {journalType} trading activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setDateRange({ from: new Date(), to: new Date() })}>Today</Button>
                <Button variant="outline" onClick={() => setDateRange({ from: addDays(new Date(), -6), to: new Date() })}>Last 7 Days</Button>
                <Button variant="outline" onClick={() => setDateRange({ from: addDays(new Date(), -29), to: new Date() })}>Last 30 Days</Button>
                <Button variant="ghost" onClick={() => setDateRange(undefined)}>Reset</Button>
            </div>
        </div>

        {filteredEntries.length > 0 ? (
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
            No entries found in the selected date range.
          </div>
        )}
      </CardContent>
    </Card>
  );
};


const AnalysisReportGenerator = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const [isGenerating, setIsGenerating] = useState(false);
  
    const entriesRef = useMemoFirebase(() =>
      user ? collection(firestore, 'users', user.uid, 'notebookNotes') : null,
    [user, firestore]);
  
    const { data: entries = [], isLoading } = useCollection<Omit<MarketAnalysisNote, 'id'>>(entriesRef);
    
    const [filteredEntries, setFilteredEntries] = useState<MarketAnalysisNote[]>([]);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
    useEffect(() => {
        const safeEntries = entries || [];
        if (!dateRange?.from && !dateRange?.to) {
            setFilteredEntries(safeEntries as MarketAnalysisNote[]);
            return;
        }

        const filtered = safeEntries.filter(entry => {
            const entryDate = startOfDay(entry.createdAt.toDate());
            const from = dateRange.from ? startOfDay(dateRange.from) : null;
            const to = dateRange.to ? startOfDay(dateRange.to) : null;

            if (from && to) return entryDate >= from && entryDate <= to;
            if (from) return entryDate >= from;
            if (to) return entryDate <= to;
            return true;
        });
        setFilteredEntries(filtered as MarketAnalysisNote[]);
    }, [dateRange, entries]);
  
    const handleExportPDF = async () => {
        setIsGenerating(true);
        const doc = new jsPDF();
        const generationDate = new Date();
        const pageMargin = 14;
        const pageContentWidth = doc.internal.pageSize.getWidth() - pageMargin * 2;
        let yPos = 22;

        const addPageIfNeeded = (requiredHeight: number) => {
            if (yPos + requiredHeight > doc.internal.pageSize.getHeight() - pageMargin) {
                doc.addPage();
                yPos = pageMargin;
            }
        };
    
        doc.setFontSize(22);
        doc.text('Market Analysis Report', pageMargin, yPos);
        yPos += 10;
    
        doc.setFontSize(12);
        const dateRangeStr = dateRange?.from ? `${format(dateRange.from, "LLL dd, y")} to ${dateRange.to ? format(dateRange.to, "LLL dd, y") : 'present'}` : 'All time';
        doc.text(`Date Range: ${dateRangeStr}`, pageMargin, yPos);
        yPos += 8;
        doc.text(`Generated on: ${generationDate.toLocaleString()}`, pageMargin, yPos);
        yPos += 15;
    
        for (const note of filteredEntries) {
            addPageIfNeeded(30);
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text(note.title, pageMargin, yPos);
            yPos += 7;
    
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(150);
            doc.text(`Created: ${note.createdAt.toDate().toLocaleString()}`, pageMargin, yPos);
            yPos += 10;
            
            doc.setTextColor(0);
            doc.setFontSize(12);
            const contentLines = doc.splitTextToSize(note.content, pageContentWidth);
            addPageIfNeeded(contentLines.length * 5); // Approximate height
            doc.text(contentLines, pageMargin, yPos);
            yPos += contentLines.length * 5 + 10;

            if (note.imageUrl) {
                try {
                    const response = await fetch(note.imageUrl);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    
                    const imageData = await new Promise<string>((resolve, reject) => {
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });

                    const img = new Image();
                    img.src = imageData;
                    await new Promise(resolve => img.onload = resolve);
                    
                    const imgWidth = img.width;
                    const imgHeight = img.height;
                    const ratio = imgWidth / imgHeight;
                    
                    let finalWidth = pageContentWidth;
                    let finalHeight = finalWidth / ratio;
                    
                    if (finalHeight > 100) {
                        finalHeight = 100;
                        finalWidth = finalHeight * ratio;
                    }
                    
                    addPageIfNeeded(finalHeight + 10);
                    doc.addImage(imageData, 'JPEG', pageMargin, yPos, finalWidth, finalHeight);
                    yPos += finalHeight + 15;

                } catch (error) {
                    console.error("Failed to load or add image:", error);
                    addPageIfNeeded(10);
                    doc.setTextColor(255, 0, 0);
                    doc.text('[Image could not be loaded]', pageMargin, yPos);
                    yPos += 10;
                    doc.setTextColor(0);
                }
            }
             // Add a separator
            if (filteredEntries.indexOf(note) < filteredEntries.length - 1) {
                addPageIfNeeded(10);
                doc.setDrawColor(200);
                doc.line(pageMargin, yPos, pageContentWidth + pageMargin, yPos);
                yPos += 10;
            }
        }
    
        doc.save('market_analysis_report.pdf');
        setIsGenerating(false);
    };
  
    if (isLoading) return <div>Loading reports...</div>;
  
    return (
      <Card className="animate-in fade-in-0 duration-500">
        <CardHeader>
          <CardTitle>Market Analysis Report</CardTitle>
          <CardDescription>
            Generate and export a PDF report of your market analysis notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
              <Popover>
                  <PopoverTrigger asChild>
                      <Button
                          id="analysis-date"
                          variant={"outline"}
                          className={cn(
                              "w-[300px] justify-start text-left font-normal",
                              !dateRange && "text-muted-foreground"
                          )}
                      >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                              dateRange.to ? (
                                  <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                              ) : (format(dateRange.from, "LLL dd, y"))
                          ) : (<span>Pick a date range</span>)}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                      />
                  </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setDateRange({ from: new Date(), to: new Date() })}>Today</Button>
                  <Button variant="outline" onClick={() => setDateRange({ from: addDays(new Date(), -6), to: new Date() })}>Last 7 Days</Button>
                  <Button variant="outline" onClick={() => setDateRange({ from: addDays(new Date(), -29), to: new Date() })}>Last 30 Days</Button>
                  <Button variant="ghost" onClick={() => setDateRange(undefined)}>Reset</Button>
              </div>
          </div>
  
          {filteredEntries.length > 0 ? (
            <Button onClick={handleExportPDF} disabled={isGenerating}>
                <Download className="mr-2" />
                {isGenerating ? 'Generating PDF...' : 'Export to PDF'}
            </Button>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No analysis notes found in the selected date range.
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

export default function ReportPage() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <Tabs defaultValue="journal">
        <TabsList>
          <TabsTrigger value="journal">Journal Report</TabsTrigger>
          <TabsTrigger value="backtest">Backtest Report</TabsTrigger>
          <TabsTrigger value="analysis">Analysis Report</TabsTrigger>
        </TabsList>
        <TabsContent value="journal">
          <ReportGenerator journalType="live" />
        </TabsContent>
        <TabsContent value="backtest">
          <ReportGenerator journalType="backtest" />
        </TabsContent>
        <TabsContent value="analysis">
          <AnalysisReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
