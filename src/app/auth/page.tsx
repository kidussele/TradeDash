
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Activity, User } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
  initiateAnonymousSignIn,
} from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';


export default function AuthPage() {
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');


  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  const handleAuthError = (error: FirebaseError) => {
    let title = 'Authentication Failed';
    let description = 'An unexpected error occurred. Please try again.';

    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        title = 'Login Failed';
        description = 'The email or password you entered is incorrect.';
        break;
      case 'auth/email-already-in-use':
        title = 'Signup Failed';
        description = 'An account with this email address already exists.';
        break;
      case 'auth/weak-password':
        title = 'Signup Failed';
        description = 'The password is too weak. Please use at least 6 characters.';
        break;
      case 'auth/invalid-email':
         title = 'Invalid Email';
         description = 'Please enter a valid email address.';
         break;
       case 'auth/popup-closed-by-user':
         title = 'Login Canceled';
         description = 'The Google login popup was closed before completion.';
         break;
      default:
        // Keep the generic message for other errors
        break;
    }
    
    toast({
      variant: 'destructive',
      title: title,
      description: description,
    });
  };

  const handleLogin = () => {
    if (!loginEmail || !loginPassword) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please enter both email and password.",
      });
      return;
    }
    initiateEmailSignIn(auth, loginEmail, loginPassword, handleAuthError);
  };

  const handleSignup = () => {
    if (!signupName || !signupEmail || !signupPassword) {
       toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "Please enter your name, email, and password.",
      });
      return;
    }
    initiateEmailSignUp(auth, signupEmail, signupPassword, signupName, handleAuthError);
  };

  const handleGuestLogin = () => {
    initiateAnonymousSignIn(auth, handleAuthError);
  };


  return (
    <div className="animate-in fade-in-0 zoom-in-95 duration-500">
      <div className="flex justify-center mb-6">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Activity className="size-7 shrink-0 text-primary" />
          <h1 className='text-xl font-semibold'>
            KilaTrade
          </h1>
        </Link>
      </div>
      <Card className="bg-card/60 backdrop-blur-lg border-white/10">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
          <TabsTrigger value="login" className="data-[state=active]:bg-background/50 data-[state=active]:shadow-none rounded-t-lg rounded-b-none py-3">Login</TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-background/50 data-[state=active]:shadow-none rounded-t-lg rounded-b-none py-3">Sign Up</TabsTrigger>
        </TabsList>
        <div className="p-6">
          <TabsContent value="login">
              <CardHeader className="p-0 text-center mb-6">
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Login to your account to continue your journey.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="name@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="bg-background/50 focus:bg-background/80 transition-colors" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="bg-background/50 focus:bg-background/80 transition-colors" />
                </div>
              </CardContent>
              <CardFooter className="p-0 pt-6 flex-col gap-4">
                <Button className="w-full" onClick={handleLogin} type="button">Login</Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card/60 px-2 text-muted-foreground backdrop-blur-lg">
                      Or
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 w-full">
                  <Button variant="outline" onClick={handleGuestLogin} type="button" className="bg-secondary/50 hover:bg-secondary/80 transition-colors">
                    <User className="mr-2 h-4 w-4" />
                    Continue as a guest
                  </Button>
                </div>
              </CardFooter>
          </TabsContent>
          <TabsContent value="signup">
              <CardHeader className="p-0 text-center mb-6">
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Start your journey to disciplined trading today.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input id="signup-name" placeholder="Your Name" value={signupName} onChange={(e) => setSignupName(e.target.value)} className="bg-background/50 focus:bg-background/80 transition-colors" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="name@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="bg-background/50 focus:bg-background/80 transition-colors" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="bg-background/50 focus:bg-background/80 transition-colors" />
                </div>
              </CardContent>
              <CardFooter className="p-0 pt-6 flex-col gap-4">
                <Button className="w-full" onClick={handleSignup} type="button">Create Account</Button>
              </CardFooter>
          </TabsContent>
        </div>
      </Tabs>
      </Card>
    </div>
  )
}
