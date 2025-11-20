
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ImagePreview() {
    const searchParams = useSearchParams();
    const imageUrl = searchParams.get('imageUrl');

    if (!imageUrl) {
        return <div className="flex items-center justify-center h-screen bg-black text-white">No image URL provided.</div>;
    }

    return (
        <div className="flex items-center justify-center h-screen bg-black p-4">
            {/* Using <img> directly to avoid Next.js Image optimization issues with unknown external URLs */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Screenshot preview" className="max-w-full max-h-full object-contain animate-in fade-in-0 zoom-in-95 duration-500" />
        </div>
    );
}


export default function ImagePreviewPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>}>
            <ImagePreview />
        </Suspense>
    )
}
