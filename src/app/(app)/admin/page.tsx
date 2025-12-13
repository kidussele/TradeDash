
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
        <div className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
                Manage users and application resources from here.
            </p>
        </div>

        <Card className="animate-in fade-in-0 zoom-in-95 duration-500" style={{ animationDelay: '200ms' }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="size-5" />
                    User Management
                </CardTitle>
                <CardDescription>
                    View, block, or unblock users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                    <p>User management functionality will be added here in the next step.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
