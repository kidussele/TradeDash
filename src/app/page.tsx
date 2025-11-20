
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, LayoutDashboard, BookText, Sparkles, Target, Newspaper } from 'lucide-react';
import { Logo } from '@/components/layout/logo';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Insightful Dashboard',
    description: 'Visualize your performance with an intuitive and powerful dashboard.',
  },
  {
    icon: BookText,
    title: 'Detailed Journals',
    description: 'Keep detailed records of your live and backtest trades with ease.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    description: 'Leverage AI to analyze your trading data and uncover patterns.',
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set and track your trading goals to stay focused and motivated.',
  },
  {
    icon: Newspaper,
    title: 'Market News',
    description: 'Stay updated with a built-in economic calendar and AI-generated news.',
  },
  {
    icon: BookText,
    title: 'Notebooks',
    description: 'Jot down market analysis and self-development notes all in one place.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Activity className="size-7 shrink-0 text-primary" />
          <h1 className="text-xl font-semibold">Kila</h1>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/auth">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-in fade-in-0 slide-in-from-top-12 duration-700">
              Elevate Your Trading with Kila
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground animate-in fade-in-0 slide-in-from-top-12 duration-700" style={{ animationDelay: '200ms' }}>
              KilaTrade is an amazing trading journal designed to help you analyze your performance, find your edge, and achieve your goals.
            </p>
            <div className="mt-8 flex justify-center gap-4 animate-in fade-in-0 zoom-in-95 duration-500" style={{ animationDelay: '400ms' }}>
              <Button size="lg" asChild>
                <Link href="/auth">Get Started for Free</Link>
              </Button>
            </div>
             <div className="mt-16 mx-auto max-w-6xl animate-in fade-in-0 zoom-in-95 duration-500" style={{ animationDelay: '600ms' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="shadow-2xl shadow-primary/10 md:col-span-2">
                        <CardContent className="p-2 bg-card/50 h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://picsum.photos/seed/tradingview/1200/600" alt="Main trading chart" className="rounded-lg object-cover w-full h-full" data-ai-hint="trading chart" />
                        </CardContent>
                    </Card>
                    <div className="grid grid-rows-2 gap-4">
                         <Card className="shadow-xl shadow-primary/5">
                            <CardContent className="p-2 bg-card/50 h-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://picsum.photos/seed/forexchart/600/300" alt="Forex chart detail" className="rounded-lg object-cover w-full h-full" data-ai-hint="forex chart" />
                            </CardContent>
                        </Card>
                         <Card className="shadow-xl shadow-primary/5">
                            <CardContent className="p-2 bg-card/50 h-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://picsum.photos/seed/stockmarket/600/300" alt="Stock market analysis" className="rounded-lg object-cover w-full h-full" data-ai-hint="stock analysis" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-24 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-in fade-in-0 slide-in-from-bottom-8 duration-500">
              <h2 className="text-3xl font-bold">A Better Way to Journal</h2>
              <p className="mt-2 text-muted-foreground">
                Everything you need to become a more disciplined and profitable trader.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={feature.title} className="animate-in fade-in-0 slide-in-from-bottom-8 duration-500" style={{ animationDelay: `${index * 150 + 300}ms` }}>
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-primary-foreground">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} KilaTrade. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
