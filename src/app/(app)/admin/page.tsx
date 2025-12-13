
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { listAllUsers, updateUserDisabledStatus, type AdminUser } from './actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    listAllUsers()
      .then(result => {
        if (result.success && result.users) {
          setUsers(result.users);
        } else {
          setError(result.error || 'Failed to fetch users.');
        }
      })
      .catch(err => {
        setError('An unexpected error occurred.');
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  
  const handleUserStatusChange = (uid: string, isDisabled: boolean) => {
    startTransition(async () => {
        const result = await updateUserDisabledStatus(uid, isDisabled);
        if (result.success) {
            setUsers(prevUsers => 
                prevUsers.map(u => u.uid === uid ? { ...u, disabled: isDisabled } : u)
            );
            toast({
                title: 'User Updated',
                description: `User has been successfully ${isDisabled ? 'blocked' : 'unblocked'}.`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: result.error || 'An unknown error occurred.',
            });
        }
    });
  };

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
                {isLoading ? (
                     <div className="text-center py-12 text-muted-foreground">
                        <p>Loading users...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-destructive">
                        <p>Error: {error}</p>
                    </div>
                ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Block User</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.uid} className="animate-in fade-in-0">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.photoURL} alt={user.displayName} />
                                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{user.displayName}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.creationTime}</TableCell>
                                <TableCell>
                                    <Badge variant={user.disabled ? 'destructive' : 'positive'}>
                                        {user.disabled ? 'Blocked' : 'Active'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Switch
                                        checked={user.disabled}
                                        onCheckedChange={(isChecked) => handleUserStatusChange(user.uid, isChecked)}
                                        disabled={isPending}
                                        aria-label={`Block or unblock user ${user.displayName}`}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
