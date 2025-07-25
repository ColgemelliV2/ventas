'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, Tags, ShoppingCart, LayoutDashboard } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { getProducts, recordSale } from '@/app/actions';
import type { Product, CartItem, SaleData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';
import ReceiptModal from '@/components/ReceiptModal';
import { useToast } from "@/hooks/use-toast";

export default function SalesPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [lastSale, setLastSale] = useState<SaleData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const result = await getProducts();
        if (result.error) {
          throw new Error(result.error);
        }
        setProducts(result.data || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los productos.",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };

    if (user) {
        fetchProducts();
    }
  }, [user, toast]);
  
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleRecordSale = async (cashReceived: number) => {
    if (!user) return;
    
    setIsSubmitting(true);
    const subtotal = cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);
    
    const saleData: SaleData = {
      venta: {
        cajero_id: user.id,
        subtotal: subtotal,
        efectivo_recibido: cashReceived,
        cambio: cashReceived - subtotal,
      },
      detalles: cart,
    };

    try {
      const result = await recordSale(saleData);
      if (result.success) {
        toast({
          title: "Venta registrada",
          description: "La venta se ha guardado correctamente.",
        });
        setLastSale(saleData);
        setIsReceiptModalOpen(true);
        setCart([]);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al registrar la venta",
        description: (error as Error).message || "Ocurrió un error inesperado.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Image src="https://btwhvavwqkzifiuhgcao.supabase.co/storage/v1/object/sign/ventas/Logo%20Slogan%20Nuevo%20FINAL-05.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZmZlYzIyMi0yZGUxLTRmNWYtYWJkMC0zNzI5MjAzOGRmMGYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2ZW50YXMvTG9nbyBTbG9nYW4gTnVldm8gRklOQUwtMDUucG5nIiwiaWF0IjoxNzUyODkwNjg1LCJleHAiOjE3ODQ0MjY2ODV9.-ae3rFAIBIplNEOlfrdApUM7i52w35AeKlBJrwAjumk" alt="Logo" width={200} height={47} unoptimized />
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-muted-foreground">Cajero: {user.nombre_completo}</span>
             {user.username === 'administrador' && (
              <Button variant="secondary" size="sm" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <section className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Tags className="text-accent" />
                Productos Disponibles
              </CardTitle>
            </CardHeader>
            <div className="p-4 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {isLoadingProducts ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-[125px] w-full rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : (
                  products.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                  ))
                )}
              </div>
            </div>
          </Card>
        </section>

        <aside className="lg:col-span-1 lg:sticky lg:top-20">
           <Cart
              cartItems={cart}
              setCart={setCart}
              onRecordSale={handleRecordSale}
              isSubmitting={isSubmitting}
            />
        </aside>
      </main>
      
      {lastSale && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          saleData={lastSale}
          cajero={user}
        />
      )}
    </div>
  );
}
