import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Lock, Mail, User, LogIn, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import indigoLogo from '/Indigo.png';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Validation schemas
const signUpSchema = z.object({
  nombreCompleto: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Nombre muy largo'),
  email: z.string().trim().email('Correo electrónico inválido').max(255, 'Correo muy largo'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

const loginSchema = z.object({
  email: z.string().trim().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    nombreCompleto: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate form data
      const validatedData = signUpSchema.parse(signUpData);

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nombre_completo: validatedData.nombreCompleto
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este correo ya está registrado. Intenta iniciar sesión.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('¡Registro exitoso! Redirigiendo...');
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Por favor corrige los errores en el formulario');
      } else {
        toast.error('Error al registrarse. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate form data
      const validatedData = loginSchema.parse(loginData);

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Correo o contraseña incorrectos');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('¡Inicio de sesión exitoso! Redirigiendo...');
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error('Por favor corrige los errores en el formulario');
      } else {
        toast.error('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logos = [
    { src: '/logos/genexia-negro.png', alt: 'Genexia' },
    { src: '/logos/indira.png', alt: 'Indira' },
    { src: '/logos/coral-01.png', alt: 'Coral' },
    { src: '/logos/coral-03.png', alt: 'Coral EHR' },
    { src: '/logos/oneview-negro.png', alt: 'One View' },
    { src: '/logos/vie.png', alt: 'Vie' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src={indigoLogo} 
              alt="IndiGO Logo" 
              className="h-40 w-auto object-contain drop-shadow-2xl animate-float"
            />
          </div>

          {/* Logo Carousel */}
          <div className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 rounded-2xl p-6 shadow-inner">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 2000,
                  stopOnInteraction: false,
                })
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {logos.map((logo, index) => (
                  <CarouselItem key={index} className="pl-2 basis-1/3">
                    <div className="flex items-center justify-center h-16 p-2 bg-white/50 rounded-lg backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
                      <img 
                        src={logo.src} 
                        alt={logo.alt}
                        className="max-h-12 w-auto object-contain filter drop-shadow-sm"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-indigo-100/50 border border-indigo-200">
            <TabsTrigger value="login" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-indigo-200 shadow-lg shadow-indigo-100/50">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <LogIn className="w-5 h-5 text-indigo-600" />
                  Iniciar Sesión
                </CardTitle>
                <CardDescription className="text-indigo-600">
                  Ingresa tus credenciales para acceder al formulario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-indigo-500" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@correo.com"
                        className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-indigo-500" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-indigo-400 hover:text-indigo-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Iniciar Sesión
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-indigo-200 shadow-lg shadow-indigo-100/50">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  Crear Cuenta
                </CardTitle>
                <CardDescription className="text-indigo-600">
                  Regístrate para comenzar a llenar el formulario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nombre Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-indigo-500" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Juan Pérez"
                        className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                        value={signUpData.nombreCompleto}
                        onChange={(e) => setSignUpData({ ...signUpData, nombreCompleto: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.nombreCompleto && <p className="text-sm text-destructive">{errors.nombreCompleto}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-indigo-500" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="tu@correo.com"
                        className="pl-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-indigo-500" />
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        className="pl-10 pr-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-3 text-indigo-400 hover:text-indigo-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-indigo-500" />
                      <Input
                        id="signup-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repite tu contraseña"
                        className="pl-10 pr-10 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-indigo-400 hover:text-indigo-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Crear Cuenta
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
