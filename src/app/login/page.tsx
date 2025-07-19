'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Por favor, ingrese su usuario y contraseña.',
      });
      return;
    }
    setIsLoading(true);
    const result = await login({ username, password });
    setIsLoading(false);

    if (result.success) {
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: result.error || 'Usuario o contraseña incorrectos. Por favor, intente de nuevo.',
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <Image src="https://btwhvavwqkzifiuhgcao.supabase.co/storage/v1/object/sign/ventas/Logo%20Slogan%20Nuevo%20FINAL-05.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZmZlYzIyMi0yZGUxLTRmNWYtYWJkMC0zNzI5MjAzOGRmMGYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2ZW50YXMvTG9nbyBTbG9nYW4gTnVldm8gRklOQUwtMDUucG5nIiwiaWF0IjoxNzUyODkwNjg1LCJleHAiOjE3ODQ0MjY2ODV9.-ae3rFAIBIplNEOlfrdApUM7i52w35AeKlBJrwAjumk" alt="Logo" width={300} height={71} className="mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">Ventas Bingo 2025</CardTitle>
          <CardDescription>Ingrese sus credenciales para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="su_usuario"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
