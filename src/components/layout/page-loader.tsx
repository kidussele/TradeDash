

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-4 animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <span className="text-4xl font-bold">Kila</span>
      </div>
    </div>
  );
}
