import { z } from 'zod';

export interface Product {
  id: number;
  nombre: string;
  precio: number;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Cajero {
  id: number;
  username: string;
  nombre_completo: string;
  activo: boolean;
}

export interface Venta {
  id?: number;
  cajero_id: number;
  subtotal: number;
  efectivo_recibido: number;
  cambio: number;
  fecha_venta?: string;
}

export interface DetalleVenta {
  id?: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface SaleData {
  venta: Venta;
  detalles: CartItem[];
}


// --- Dashboard Types ---

export interface DashboardData {
    total_revenue: number;
    total_sales: number;
}

export interface ProductSale {
    producto_id: number;
    nombre: string;
    total_vendido: number;
    recaudo_total: number;
}

export interface DetalleVentaConNombre extends DetalleVenta {
    nombre_producto: string;
}

export interface VentaConDetalles extends Venta {
    cajero_nombre: string;
    detalles: DetalleVentaConNombre[];
}

// --- Product Management Types ---
export const productSchema = z.object({
  nombre: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  precio: z.coerce.number().positive({ message: "El precio debe ser un número positivo." }),
  imagen_url: z.string().url({ message: "Por favor ingrese una URL de imagen válida." }).or(z.literal('')),
  activo: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;
