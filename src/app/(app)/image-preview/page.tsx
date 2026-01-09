
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';

function ImagePreview() {
    const searchParams = useSearchParams();
    const imageUrl = searchParams.get('imageUrl');

    if (!imageUrl) {
        return <div className="flex items-center justify-center h-screen bg-black text-white">No image URL provided.</div>;
    }

    return (
        <div className="flex items-center justify-center h-screen bg-black p-4">
            <Image 
                src={imageUrl} 
                alt="Screenshot preview" 
                layout="fill" 
                objectFit="contain" 
                className="animate-in fade-in-0 zoom-in-95 duration-500" 
            />
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
