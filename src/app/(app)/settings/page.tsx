
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useEffect } from 'react';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { updateProfile as updateFirestoreProfile } from './actions';
import { useAppTheme, themes } from '@/components/theme-provider';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';


const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name must not be longer than 50 characters.' }),
  photoURL: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ThemeSwitcher = () => {
    const { colorTheme, setColorTheme } = useAppTheme();
    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {themes.map((t) => (
                <div key={t.name}>
                <Button
                    variant="outline"
                    className={cn(
                    "w-full h-12 justify-start",
                    colorTheme === t.name && "border-2 border-primary"
                    )}
                    onClick={() => setColorTheme(t.name)}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="size-5 rounded-full"
                            style={{ backgroundColor: t.color }}
                        />
                        <span className="font-semibold">{t.label}</span>
                    </div>
                    {colorTheme === t.name && <Check className="ml-auto h-5 w-5" />}
                </Button>
                </div>
            ))}
            </div>
        </div>
    )
}

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading } = useDoc(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      photoURL: '',
      email: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        displayName: userProfile.displayName || user?.displayName || '',
        photoURL: userProfile.photoURL || user?.photoURL || '',
        email: userProfile.email || user?.email || '',
      });
    }
  }, [userProfile, user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Updating Profile...',
      description: 'Please wait while we save your changes.',
    });

    try {
      // This is a client-side update for immediate UI feedback on the auth object
      await updateAuthProfile(user, {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });

      // This is a server action to securely update the Firestore document
      const result = await updateFirestoreProfile({
        displayName: data.displayName,
        photoURL: data.photoURL,
      });

      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });

    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Update Failed',
        description: (error as Error).message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This is how others will see you on the site.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Email" {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      Your email address is not displayed publicly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photoURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.png" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      Enter the URL of an image for your avatar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting || isLoading || !form.formState.isDirty}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
       </Card>
       <Card>
        <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
                Select a color theme for the application.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ThemeSwitcher />
        </CardContent>
       </Card>
    </div>
  );
}
