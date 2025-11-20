
import { Logo } from './logo';

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="flex items-center gap-4 animate-in fade-in-0 zoom-in-95 duration-500">
        <Logo className="size-12 animate-spin-slow" />
        <span className="text-4xl font-bold">Kila</span>
      </div>
    </div>
  );
}
