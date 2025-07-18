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
