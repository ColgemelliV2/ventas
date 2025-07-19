'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuth from '@/hooks/useAuth';
import { getDashboardData, getSalesByProduct, getAllSales } from '@/app/actions';
import type { DashboardData, ProductSale, VentaConDetalles } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart2, DollarSign, List, ShoppingBag, AlertTriangle, Package } from 'lucide-react';
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

const CHART_COLORS = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5', '--chart-6', '--chart-7', '--chart-8', '--chart-9', '--chart-10'];

type ProductSaleWithColor = ProductSale & { color: string };

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
            
            const [dashboardResult, salesByProductResult, allSalesResult] = await Promise.all([
              getDashboardData(),
              getSalesByProduct(),
              getAllSales(),
            ]);

            if (dashboardResult.error || salesByProductResult.error || allSalesResult.error) {
                const errorMessages = [
                    dashboardResult.error,
                    salesByProductResult.error,
                    allSalesResult.error
                ].filter(Boolean).join('; ');
                throw new Error(errorMessages);
            }
            
            setData(dashboardResult.data);
            setProductSales(salesByProductResult.data || []);
            setAllSales(allSalesResult.data || []);

          } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError((err as Error).message);
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      }
    }
  }, [user, authLoading, router]);

  const productSalesWithColors = useMemo((): ProductSaleWithColor[] => {
    return productSales.map((sale, index) => ({
      ...sale,
      color: `hsl(var(${CHART_COLORS[index % CHART_COLORS.length]}))`,
    }));
  }, [productSales]);

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
                <div className="flex items-center gap-4">
                  <Button variant="secondary" asChild>
                    <Link href="/dashboard/products">
                      <Package className="mr-2 h-4 w-4" />
                      Gestionar Productos
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/')}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver a Ventas
                  </Button>
                </div>
            </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 space-y-6">
        {error && (
             <Card className="border-destructive bg-destructive/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle/> Error al Cargar Datos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive/90">No se pudieron cargar los datos del dashboard. Por favor, revisa tu conexión a internet y la configuración de Supabase. Si el problema persiste, contacta al soporte.</p>
                    <pre className="mt-2 p-2 bg-black/10 rounded-md text-destructive whitespace-pre-wrap text-sm">
                        <code>{error}</code>
                    </pre>
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
                        <BarChart data={productSalesWithColors}>
                             <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} angle={-45} textAnchor="end" height={100} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <Tooltip formatter={(value, name, props) => [`${value} unidades`, props.payload.nombre]} cursor={{fill: 'hsl(var(--accent) / 0.2)'}}/>
                            <Bar dataKey="total_vendido" radius={[4, 4, 0, 0]}>
                                {productSalesWithColors.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
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
