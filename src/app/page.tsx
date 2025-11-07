import { StatCard } from '@/components/dashboard/stat-card';
import { statsData } from '@/lib/data';
import { CumulativePnlChart } from '@/components/dashboard/cumulative-pnl-chart';
import { DailyPnlChart } from '@/components/dashboard/daily-pnl-chart';
import { TradeDashScore } from '@/components/dashboard/tradedash-score';
import { RecentTrades } from '@/components/dashboard/recent-trades';
import { TradingCalendar } from '@/components/dashboard/trading-calendar';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <div key={stat.title} className="col-span-4 sm:col-span-2 lg:col-span-1">
           <StatCard {...stat} />
        </div>
      ))}
      <div className="col-span-4 lg:col-span-2">
        <CumulativePnlChart />
      </div>
      <div className="col-span-4 sm:col-span-2 lg:col-span-1">
        <TradeDashScore />
      </div>
      <div className="col-span-4 sm:col-span-2 lg:col-span-1">
        <DailyPnlChart />
      </div>
      <div className="col-span-4 lg:col-span-2">
        <RecentTrades />
      </div>
      <div className="col-span-4 lg:col-span-2">
        <TradingCalendar />
      </div>
    </div>
  );
}
