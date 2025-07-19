'use server';

import { createClient } from '@supabase/supabase-js';
import type { Product, SaleData, DashboardData, ProductSale, VentaConDetalles, DetalleVentaConNombre } from '@/types';

// Helper function to get the Supabase client within an action
// This ensures env vars are available at runtime.
const getSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL and Anon Key are required.');
    }
    return createClient(supabaseUrl, supabaseAnonKey);
}

export async function login(credentials: { username: string; password?: string }) {
  const supabase = getSupabaseClient();
  const { data: user, error } = await supabase
    .from('cajeros')
    .select('*')
    .eq('username', credentials.username)
    .single();

  if (error || !user) {
    console.error('Supabase login error:', error);
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }
  
  if (user.password_hash && user.password_hash !== credentials.password) {
     return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }

  if (!user.activo) {
    return { success: false, error: 'La cuenta del cajero está inactiva.' };
  }
  
  // Exclude password_hash from the returned user object
  const { password_hash, ...cajeroData } = user;
  
  return { success: true, user: cajeroData };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Could not fetch products.');
  }

  const getCategoryOrder = (productName: string): number => {
    const lowerCaseName = productName.toLowerCase();
    
    const foodKeywords = ['empanada', 'pastel', 'chorizo', 'arepa', 'hamburguesa', 'perro', 'pizza', 'torta', 'dedito'];
    const drinkKeywords = ['gaseosa', 'agua', 'jugo', 'cerveza', 'limonada', 'refajo', 'malta'];
    
    if (foodKeywords.some(keyword => lowerCaseName.includes(keyword))) {
      return 1;
    }
    if (drinkKeywords.some(keyword => lowerCaseName.includes(keyword))) {
      return 2;
    }
    return 3;
  };

  const sortedData = (data || []).sort((a, b) => {
    const orderA = getCategoryOrder(a.nombre);
    const orderB = getCategoryOrder(b.nombre);

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.nombre.localeCompare(b.nombre);
  });

  return sortedData;
}


export async function recordSale(saleData: SaleData) {
  const supabase = getSupabaseClient();
  try {
    const { data: ventaData, error: ventaError } = await supabase
      .from('ventas')
      .insert([saleData.venta])
      .select('id')
      .single();

    if (ventaError || !ventaData || !ventaData.id) {
      console.error('Error inserting sale:', ventaError);
      const errorMessage = ventaError ? `Detalle de Supabase: ${ventaError.message}` : 'No se pudo crear el registro de la venta principal.';
      throw new Error(errorMessage);
    }

    const venta_id = ventaData.id;

    const detallesToInsert = saleData.detalles.map(item => ({
      venta_id: venta_id,
      producto_id: item.id,
      cantidad: item.quantity,
      precio_unitario: item.precio,
      subtotal: item.precio * item.quantity,
    }));

    const { error: detalleError } = await supabase
      .from('detalle_ventas')
      .insert(detallesToInsert);

    if (detalleError) {
      console.error('Error inserting sale details:', detalleError);
      await supabase.from('ventas').delete().eq('id', venta_id);
      throw new Error('No se pudieron guardar los detalles de la venta. La venta principal ha sido revertida.');
    }

    return { success: true, venta_id };
  } catch (error) {
    console.error('Full error recording sale:', error);
    return { success: false, error: (error as Error).message };
  }
}

// --- Product Management Actions ---

type ProductFormData = {
  nombre: string;
  precio: number;
  imagen_url?: string;
  activo: boolean;
};

export async function createProduct(productData: ProductFormData) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('productos')
        .insert([{ 
            ...productData, 
            imagen_url: productData.imagen_url || null 
        }])
        .select();
    
    if (error) {
        console.error('Error creating product:', error);
        return { success: false, error: 'No se pudo crear el producto. ' + error.message };
    }

    return { success: true, data: data ? data[0] : null };
}


export async function updateProduct(id: number, productData: ProductFormData) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('productos')
        .update({ 
            ...productData, 
            imagen_url: productData.imagen_url || null 
        })
        .eq('id', id)
        .select();

    if (error) {
        console.error(`Error updating product ${id}:`, error);
        return { success: false, error: 'No se pudo actualizar el producto. ' + error.message };
    }

    return { success: true, data: data ? data[0] : null };
}


// --- Dashboard Actions ---

export async function getDashboardData(): Promise<{data: DashboardData | null, error: string | null}> {
    const supabase = getSupabaseClient();
    try {
        const { data, error } = await supabase
            .from('ventas')
            .select('subtotal');

        if (error) {
            console.error('Error fetching dashboard summary:', error);
            return { data: null, error: error.message };
        }

        const total_revenue = data.reduce((acc, sale) => acc + sale.subtotal, 0);
        const total_sales = data.length;

        return { data: { total_revenue, total_sales }, error: null };
    } catch (e: any) {
        return { data: null, error: e.message };
    }
}

export async function getSalesByProduct(): Promise<{data: ProductSale[] | null, error: string | null}> {
    const supabase = getSupabaseClient();
    try {
        const { data, error } = await supabase
            .from('detalle_ventas')
            .select(`
                cantidad,
                subtotal,
                productos ( id, nombre )
            `);
        
        if (error) {
            console.error('Error fetching sales by product:', error);
            return { data: null, error: error.message };
        }

        const salesMap = new Map<number, ProductSale>();

        for (const detail of data) {
            if (!detail.productos) continue;

            const productId = detail.productos.id;
            const existingEntry = salesMap.get(productId);

            if (existingEntry) {
                existingEntry.total_vendido += detail.cantidad;
                existingEntry.recaudo_total += detail.subtotal;
            } else {
                salesMap.set(productId, {
                    producto_id: productId,
                    nombre: detail.productos.nombre,
                    total_vendido: detail.cantidad,
                    recaudo_total: detail.subtotal,
                });
            }
        }
        
        const result = Array.from(salesMap.values()).sort((a,b) => b.total_vendido - a.total_vendido);

        return { data: result, error: null };
    } catch (e: any) {
        return { data: null, error: e.message };
    }
}

export async function getAllSales(): Promise<{data: VentaConDetalles[] | null, error: string | null}> {
    const supabase = getSupabaseClient();
    try {
        const { data: ventas, error: ventasError } = await supabase
            .from('ventas')
            .select(`
                *,
                cajeros ( nombre_completo )
            `)
            .order('fecha_venta', { ascending: false });

        if (ventasError) {
            console.error('Error fetching sales:', ventasError);
            return { data: null, error: ventasError.message };
        }

        const { data: detalles, error: detallesError } = await supabase
            .from('detalle_ventas')
            .select(`
                *,
                productos ( nombre )
            `);
        
        if (detallesError) {
            console.error('Error fetching sale details:', detallesError);
            return { data: null, error: detallesError.message };
        }

        const ventasConDetalles = (ventas || []).map(venta => {
            const detallesDeVenta: DetalleVentaConNombre[] = (detalles || [])
                .filter(d => d.venta_id === venta.id)
                .map(d => ({
                    ...d,
                    nombre_producto: d.productos?.nombre || 'Producto desconocido'
                }));

            return {
                ...venta,
                cajero_nombre: venta.cajeros?.nombre_completo || 'Cajero desconocido',
                detalles: detallesDeVenta
            };
        });
        
        return { data: ventasConDetalles, error: null };
    } catch (e: any) {
        return { data: null, error: e.message };
    }
}
