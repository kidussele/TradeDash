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
import { Activity, Chrome, Github } from "lucide-react";
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
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = () => {
    if (!loginEmail || !loginPassword) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please enter both email and password.",
      });
      return;
    }
    initiateEmailSignIn(auth, loginEmail, loginPassword);
  };

  const handleSignup = () => {
    if (!signupEmail || !signupPassword) {
       toast({
        variant: "destructive",
        title: "Signup Failed",
        description: "Please enter both email and password.",
      });
      return;
    }
    initiateEmailSignUp(auth, signupEmail, signupPassword);
  };

  const handleAnonymousLogin = () => {
    initiateAnonymousSignIn(auth);
  };


  return (
    <Tabs defaultValue="login" className="w-full">
      <div className="flex justify-center mb-6">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Activity className="size-7 shrink-0 text-primary" />
          <h1 className='text-xl font-semibold'>
            TradeDash
          </h1>
        </Link>
      </div>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Welcome back! Please enter your details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="name@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button className="w-full" onClick={handleLogin}>Login</Button>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 w-full">
               <Button variant="outline" onClick={handleAnonymousLogin}>Login Anonymously</Button>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your details below to create your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input id="signup-name" placeholder="Your Name" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="name@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button className="w-full" onClick={handleSignup}>Create Account</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
