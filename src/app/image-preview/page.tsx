'use client';

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function ImagePreview() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl');

  if (!imageUrl) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <p>No image URL provided.</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-background">
      <Image
        src={imageUrl}
        alt="Image preview"
        fill
        style={{ objectFit: 'contain' }}
        unoptimized
      />
    </div>
  );
}

export default function ImagePreviewPage() {
    return (
        <Suspense fallback={<Skeleton className="h-screen w-screen" />}>
            <ImagePreview />
        </Suspense>
    )
}
