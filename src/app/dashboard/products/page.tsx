'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { getProducts, createProduct, updateProduct } from '@/app/actions';
import type { Product, ProductFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, PlusCircle, AlertTriangle } from 'lucide-react';
import ProductFormDialog from '@/components/ProductFormDialog';

const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
};

export default function ProductManagementPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getProducts();
            if (result.error) throw new Error(result.error);
            setProducts(result.data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError((err as Error).message);
            toast({
                variant: 'destructive',
                title: 'Error al cargar productos',
                description: 'No se pudieron cargar los productos. Por favor, intente de nuevo.'
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        if (!authLoading) {
            if (!user || user.username !== 'administrador') {
                router.push('/');
            } else {
                fetchProducts();
            }
        }
    }, [user, authLoading, router, fetchProducts]);

    const handleOpenNewDialog = () => {
        setEditingProduct(null);
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (product: Product) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    const handleFormSubmit = async (formData: ProductFormData) => {
        try {
            let result;
            if (editingProduct) {
                result = await updateProduct(editingProduct.id, formData);
            } else {
                result = await createProduct(formData);
            }

            if (result.error || !result.data) {
                throw new Error(result.error || 'Ocurrió un error desconocido.');
            }
            
            toast({
                title: `Producto ${editingProduct ? 'actualizado' : 'creado'}`,
                description: `El producto "${result.data.nombre}" se ha guardado correctamente.`,
            });
            
            setIsDialogOpen(false);
            await fetchProducts(); // Refresh the product list

        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Error al guardar el producto',
                description: (e as Error).message,
            });
        }
    };

    if (authLoading || (!error && loading && products.length === 0)) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="space-y-4 p-8 w-full max-w-4xl">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <h1 className="text-2xl font-bold text-primary">Gestión de Productos</h1>
                    <div className="flex items-center gap-2">
                         <Button onClick={handleOpenNewDialog}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Producto
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/dashboard')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Dashboard
                        </Button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-6">
                {error && (
                    <Card className="mb-6 border-destructive bg-destructive/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle/> Error de Carga
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-destructive/90">No se pudieron cargar los datos de los productos. Revisa tu conexión y la configuración de Supabase.</p>
                            <pre className="mt-2 p-2 bg-black/10 rounded-md text-destructive whitespace-pre-wrap text-sm">
                                <code>{error}</code>
                            </pre>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Productos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : products.length > 0 ? (
                                    products.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.nombre}</TableCell>
                                            <TableCell>{formatCurrency(product.precio)}</TableCell>
                                            <TableCell>
                                                <Badge variant={product.activo ? 'default' : 'secondary'}>
                                                    {product.activo ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(product)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No se encontraron productos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
            <ProductFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSubmit={handleFormSubmit}
                product={editingProduct}
            />
        </div>
    )
}
