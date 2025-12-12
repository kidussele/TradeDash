
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';

function BookPreview() {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');

    if (!url) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <Card className="p-8 text-center">
                    <h2 className="text-xl font-semibold">No URL Provided</h2>
                    <p className="text-muted-foreground">Please go back and provide a valid URL to preview.</p>
                </Card>
            </div>
        );
    }

    return (
        <iframe
            src={url}
            className="h-screen w-screen border-0"
            title="Book Preview"
            sandbox="allow-scripts allow-same-origin"
        />
    );
}


export default function BookPreviewPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-background">Loading Preview...</div>}>
            <BookPreview />
        </Suspense>
    )
}
