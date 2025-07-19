'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { createProduct, updateProduct } from '@/app/actions';
import type { Product } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const productFormSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  precio: z.coerce.number().min(0, 'El precio no puede ser negativo.'),
  imagen_url: z.string().url('Debe ser una URL válida.').optional().or(z.literal('')),
  activo: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export default function ProductFormDialog({ isOpen, onClose, product, onSuccess }: ProductFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
  });

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
  }, [product, isOpen, reset]);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      let result;
      if (product) {
        result = await updateProduct(product.id, data);
      } else {
        result = await createProduct(data);
      }

      if (result.success) {
        toast({
          title: 'Éxito',
          description: `El producto se ha ${product ? 'actualizado' : 'creado'} correctamente.`,
        });
        onSuccess();
      } else {
        throw new Error(result.error || 'Ocurrió un error desconocido.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Producto' : 'Crear Nuevo Producto'}</DialogTitle>
          <DialogDescription>
            {product
              ? 'Modifica los detalles del producto existente.'
              : 'Completa el formulario para añadir un nuevo producto al catálogo.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Producto</Label>
            <Input id="nombre" {...register('nombre')} disabled={isSubmitting} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio">Precio</Label>
            <Input id="precio" type="number" {...register('precio')} disabled={isSubmitting} />
            {errors.precio && <p className="text-sm text-destructive">{errors.precio.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="imagen_url">URL de la Imagen (Opcional)</Label>
            <Input id="imagen_url" placeholder="https://ejemplo.com/imagen.png" {...register('imagen_url')} disabled={isSubmitting} />
            {errors.imagen_url && <p className="text-sm text-destructive">{errors.imagen_url.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="activo" {...register('activo')} defaultChecked={product ? product.activo : true} disabled={isSubmitting} />
            <Label htmlFor="activo">Producto Activo</Label>
          </div>
          {errors.activo && <p className="text-sm text-destructive">{errors.activo.message}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Guardando...' : (product ? 'Guardar Cambios' : 'Crear Producto')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
