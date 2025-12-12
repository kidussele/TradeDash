import type { Metadata } from 'next';
import { placeholderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Authentication - KilaTrade',
  description: 'Login or create an account to get started.',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bgImage = placeholderImages.find(p => p.id === 'auth-background');
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
        {bgImage && (
            <Image
                src={bgImage.imageUrl}
                alt="Abstract background"
                fill
                className="object-cover opacity-20"
                data-ai-hint={bgImage.imageHint}
            />
        )}
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="relative z-10 w-full max-w-md p-4">
            {children}
        </div>
    </div>
  );
}
