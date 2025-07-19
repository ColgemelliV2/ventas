'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData, type Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  product: Product | null;
}

const ProductFormDialog = ({ isOpen, onClose, onSubmit, product }: ProductFormDialogProps) => {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: '',
      precio: 0,
      imagen_url: '',
      activo: true,
    },
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = form;

  useEffect(() => {
    if (product) {
      reset({
        nombre: product.nombre,
        precio: product.precio,
        imagen_url: product.imagen_url || '',
        activo: product.activo,
      });
    } else {
      reset({
        nombre: '',
        precio: 0,
        imagen_url: '',
        activo: true,
      });
    }
  }, [product, reset, isOpen]);

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data);
    // The parent component will close the dialog on success
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
          <DialogDescription>
            {product ? 'Actualiza los detalles del producto.' : 'Completa el formulario para añadir un nuevo producto.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} className="col-span-3" placeholder="Ej: Chorizo con arepa" />
                  </FormControl>
                  <div className="col-start-2 col-span-3">
                     <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="precio"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Precio</FormLabel>
                   <FormControl>
                    <Input {...field} type="number" className="col-span-3" placeholder="Ej: 5000" />
                  </FormControl>
                   <div className="col-start-2 col-span-3">
                     <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imagen_url"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">URL de Imagen</FormLabel>
                   <FormControl>
                    <Input {...field} className="col-span-3" placeholder="https://ejemplo.com/imagen.png" />
                  </FormControl>
                   <div className="col-start-2 col-span-3">
                     <FormMessage />
                  </div>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="activo" className="text-right">Activo</Label>
                  <FormControl>
                    <div className="col-span-3 flex items-center">
                        <Switch
                            id="activo"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
