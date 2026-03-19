import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, GraduationCap } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function Login() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const redirectTo = searchParams.get('redirect_to') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    useEffect(() => {
        const urlToken = searchParams.get('access_token');
        if (urlToken) {
            window.localStorage.setItem('supabase_access_token', urlToken);
            navigate(redirectTo, { replace: true });
        }
    }, [searchParams, navigate, redirectTo]);

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', apikey: supabaseAnonKey },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error_description || data.message || 'Login failed');
            window.localStorage.setItem('supabase_access_token', data.access_token);
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const callbackUrl = `${window.location.origin}/Login?redirect_to=${encodeURIComponent(redirectTo)}`;
            const res = await fetch(`${supabaseUrl}/auth/v1/magiclink`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', apikey: supabaseAnonKey },
                body: JSON.stringify({ email, redirect_to: callbackUrl }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error_description || data.message || 'Failed to send link');
            setMagicLinkSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', apikey: supabaseAnonKey },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error_description || data.message || 'Sign up failed');
            if (data.access_token) {
                window.localStorage.setItem('supabase_access_token', data.access_token);
                navigate(redirectTo, { replace: true });
            } else {
                setMagicLinkSent(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (magicLinkSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-10 pb-10 space-y-4">
                        <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                            <Mail className="w-7 h-7 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800">Check your email</h2>
                        <p className="text-slate-500 text-sm">
                            We sent a link to <span className="font-medium text-slate-700">{email}</span>. Click it to sign in.
                        </p>
                        <Button variant="ghost" size="sm" onClick={() => setMagicLinkSent(false)}>
                            Use a different method
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                        <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">UniMatch</h1>
                    <p className="text-slate-500 text-sm">Sign in to your account</p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <Tabs defaultValue="password">
                            <TabsList className="w-full mb-6">
                                <TabsTrigger value="password" className="flex-1">Password</TabsTrigger>
                                <TabsTrigger value="magic" className="flex-1">Magic Link</TabsTrigger>
                                <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="password">
                                <form onSubmit={handlePasswordLogin} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email-pw">Email</Label>
                                        <Input id="email-pw" type="email" placeholder="you@example.com"
                                            value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" type="password" placeholder="••••••••"
                                            value={password} onChange={e => setPassword(e.target.value)} required />
                                    </div>
                                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                                        Sign In
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="magic">
                                <form onSubmit={handleMagicLink} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email-magic">Email</Label>
                                        <Input id="email-magic" type="email" placeholder="you@example.com"
                                            value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                                        Send Magic Link
                                    </Button>
                                    <p className="text-xs text-center text-slate-400">We'll email you a passwordless sign-in link.</p>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup">
                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email-su">Email</Label>
                                        <Input id="email-su" type="email" placeholder="you@example.com"
                                            value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="password-su">Password</Label>
                                        <Input id="password-su" type="password" placeholder="At least 6 characters"
                                            value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                                    </div>
                                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                        Create Account
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
