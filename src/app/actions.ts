'use server';

import { supabase } from '@/lib/supabase';
import type { Product, SaleData, DashboardData, ProductSale, VentaConDetalles, DetalleVentaConNombre } from '@/types';

export async function login(credentials: { username: string; password?: string }) {
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
  
  const { password_hash, ...cajeroData } = user;
  
  return { success: true, user: cajeroData };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
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

  const sortedData = data.sort((a, b) => {
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
  try {
    const { data: ventaData, error: ventaError } = await supabase
      .from('ventas')
      .insert([saleData.venta])
      .select('id')
      .single();

    if (ventaError || !ventaData || !ventaData.id) {
      console.error('Error inserting sale:', ventaError);
      throw new Error('No se pudo crear el registro de la venta principal.');
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

// --- Dashboard Actions ---

export async function getDashboardData(): Promise<DashboardData> {
    const { data, error } = await supabase.rpc('get_dashboard_summary');

    if (error) {
        console.error('Error fetching dashboard summary:', error);
        throw new Error('Could not fetch dashboard summary.');
    }

    return (data && data[0]) || { total_revenue: 0, total_sales: 0 };
}


export async function getSalesByProduct(): Promise<ProductSale[]> {
    const { data, error } = await supabase.rpc('get_sales_by_product');

    if (error) {
        console.error('Error fetching sales by product:', error);
        throw new Error('Could not fetch sales by product.');
    }
    return data || [];
}

export async function getAllSales(): Promise<VentaConDetalles[]> {
    const { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select(`
            *,
            cajeros ( nombre_completo )
        `)
        .order('fecha_venta', { ascending: false });

    if (ventasError) {
        console.error('Error fetching sales:', ventasError);
        throw new Error('Could not fetch sales.');
    }

    const { data: detalles, error: detallesError } = await supabase
        .from('detalle_ventas')
        .select(`
            *,
            productos ( nombre )
        `);
    
    if (detallesError) {
        console.error('Error fetching sale details:', detallesError);
        throw new Error('Could not fetch sale details.');
    }

    const ventasConDetalles = ventas.map(venta => {
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
    
    return ventasConDetalles;
}
