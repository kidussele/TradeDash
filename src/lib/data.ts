// This file contains placeholder data and can be removed if you connect to a real data source.

export type StatCardData = {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
};

export const statsData: StatCardData[] = [
  {
    title: 'Net P&L',
    value: '$4,283.55',
    change: '+12.5%',
    changeType: 'positive',
  },
  {
    title: 'Win Rate',
    value: '68.4%',
    change: '-2.1%',
    changeType: 'negative',
  },
  {
    title: 'Avg. Return',
    value: '3.2%',
    change: '+0.5%',
    changeType: 'positive',
  },
  {
    title: 'Sharpe Ratio',
    value: '1.78',
    change: '+0.21',
    changeType: 'positive',
  },
];

export const cumulativePnlData = [
  { date: '2024-04-01', cumulativePnl: 1000 },
  { date: '2024-04-02', cumulativePnl: 1050 },
  { date: '2024-04-03', cumulativePnl: 1100 },
  { date: '2024-04-04', cumulativePnl: 1020 },
  { date: '2024-04-05', cumulativePnl: 1200 },
  { date: '2024-04-08', cumulativePnl: 1300 },
  { date: '2024-04-09', cumulativePnl: 1250 },
  { date: '2024-04-10', cumulativePnl: 1400 },
  { date: '2024-04-11', cumulativePnl: 1550 },
  { date: '2024-04-12', cumulativePnl: 1600 },
  { date: '2024-04-15', cumulativePnl: 1620 },
  { date: '2024-04-16', cumulativePnl: 1700 },
  { date: '2024-04-17', cumulativePnl: 1750 },
  { date: '2024-04-18', cumulativePnl: 1800 },
  { date: '2024-04-19', cumulativePnl: 1900 },
  { date: '2024-04-22', cumulativePnl: 2000 },
  { date: '2024-04-23', cumulativePnl: 2100 },
  { date: '2024-04-24', cumulativePnl: 2200 },
  { date: '2024-04-25', cumulativePnl: 2350 },
  { date: '2024-04-26', cumulativePnl: 2400 },
  { date: '2024-04-29', cumulativePnl: 2500 },
  { date: '2024-04-30', cumulativePnl: 2600 },
];

export const dailyPnlData = [
    { date: 'Mon', pnl: 50 },
    { date: 'Tue', pnl: -30 },
    { date: 'Wed', pnl: 80 },
    { date: 'Thu', pnl: -20 },
    { date: 'Fri', pnl: 120 },
    { date: 'Sat', pnl: 0 },
    { date: 'Sun', pnl: 0 },
  ];
  
export const recentTradesData = [
{
    symbol: 'AAPL',
    type: 'Long',
    netPnl: 250.75,
    status: 'Closed',
},
{
    symbol: 'TSLA',
    type: 'Short',
    netPnl: -120.5,
    status: 'Closed',
},
{
    symbol: 'GOOG',
    type: 'Long',
    netPnl: 450.0,
    status: 'Open',
},
{
    symbol: 'NVDA',
    type: 'Long',
    netPnl: 850.25,
    status: 'Closed',
},
{
    symbol: 'AMZN',
    type: 'Short',
    netPnl: -50.0,
    status: 'Open',
},
];
  
export const calendarData: Record<string, { pnl: number }> = {
    '2024-05-01': { pnl: 150 },
    '2024-05-02': { pnl: -50 },
    '2024-05-06': { pnl: 200 },
    '2024-05-08': { pnl: -75 },
    '2024-05-10': { pnl: 300 },
    '2024-05-13': { pnl: 50 },
    '2024-05-15': { pnl: -100 },
    '2024-05-20': { pnl: 120 },
    '2024-05-22': { pnl: -30 },
    '2024-05-24': { pnl: 250 },
    '2024-05-29': { pnl: -80 },
};
