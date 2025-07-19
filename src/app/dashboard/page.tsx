'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { getDashboardData, getSalesByProduct, getAllSales } from '@/app/actions';
import type { DashboardData, ProductSale, VentaConDetalles } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart2, DollarSign, List, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [allSales, setAllSales] = useState<VentaConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.username !== 'administrador') {
        router.push('/');
      } else {
        const fetchData = async () => {
          try {
            setLoading(true);
            setError(null);
            const [dashboardData, salesByProductData, allSalesData] = await Promise.all([
              getDashboardData(),
              getSalesByProduct(),
              getAllSales(),
            ]);
            setData(dashboardData);
            setProductSales(salesByProductData || []);
            setAllSales(allSalesData || []);
          } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('No se pudieron cargar los datos del dashboard. Es posible que las funciones de la base de datos (RPC) no estén creadas o no tengan los permisos correctos. Por favor, revise las instrucciones y ejecute el script SQL proporcionado en el editor de Supabase.');
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || (!error && loading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="space-y-4 p-8 w-full max-w-4xl">
            <h1 className="text-3xl font-bold text-primary">Cargando Dashboard...</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
             <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <h1 className="text-2xl font-bold text-primary">Dashboard de Administrador</h1>
            <Button variant="outline" onClick={() => router.push('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Ventas
            </Button>
            </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 space-y-6">
        {error && (
             <Card className="border-destructive bg-destructive/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle/> Error al cargar los datos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive/90">{error}</p>
                    <p className='mt-2 text-sm text-muted-foreground'>Asegúrate de haber ejecutado el script SQL necesario en el "SQL Editor" de tu proyecto de Supabase.</p>
                </CardContent>
            </Card>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Recaudado</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data?.total_revenue || 0)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Ventas</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{data?.total_sales || 0}</div>
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 className="text-accent"/>Ventas por Producto (Unidades)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={productSales}>
                             <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" height={100} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip formatter={(value) => [`${value} unidades`, "Vendido"]} cursor={{fill: 'hsl(var(--accent) / 0.2)'}}/>
                            <Bar dataKey="total_vendido" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><List className="text-accent"/>Recaudado por Producto</CardTitle>
                </CardHeader>
                 <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-right">Recaudado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productSales.length > 0 ? productSales.map(p => (
                                <TableRow key={p.producto_id}>
                                    <TableCell className="font-medium">{p.nombre}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(p.recaudo_total)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">No hay datos de ventas.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Todas las Ventas</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID Venta</TableHead>
                            <TableHead>Cajero</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Detalles</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allSales.length > 0 ? allSales.map(sale => (
                            <TableRow key={sale.id}>
                                <TableCell className="font-medium">{sale.id}</TableCell>
                                <TableCell>{sale.cajero_nombre}</TableCell>
                                <TableCell>{new Date(sale.fecha_venta).toLocaleString('es-CO')}</TableCell>
                                <TableCell>
                                    <ul className='list-disc list-inside'>
                                        {sale.detalles.map(d => (
                                            <li key={`${sale.id}-${d.producto_id}`}>{d.cantidad} x {d.nombre_producto}</li>
                                        ))}
                                    </ul>
                                </TableCell>
                                <TableCell className="text-right">{formatCurrency(sale.subtotal)}</TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">No se han registrado ventas.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
