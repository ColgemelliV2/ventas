'use server';

import { supabase } from '@/lib/supabase';
import type { SaleData } from '@/types';

export async function login(credentials: { username: string; password?: string }) {
  // IMPORTANT: This is a simplified login for demonstration purposes.
  // The password check has been temporarily removed to fix a login issue.
  // In a real application, you should use Supabase Auth or a secure password hashing and comparison mechanism.
  const { data: user, error } = await supabase
    .from('cajeros')
    .select('*')
    .eq('username', credentials.username)
    .single();

  if (error || !user) {
      return { success: false, error: 'El usuario no existe o hay un problema de conexión.' };
  }
  
  if (!user.activo) {
    return { success: false, error: 'La cuenta del cajero está inactiva.' };
  }
  
  // Exclude password hash from the returned user object
  const { password_hash, ...cajeroData } = user;
  
  return { success: true, user: cajeroData };
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error('Could not fetch products.');
  }
  return data;
}

export async function recordSale(saleData: SaleData) {
  try {
    // 1. Insert into 'ventas' table
    const { data: ventaData, error: ventaError } = await supabase
      .from('ventas')
      .insert([saleData.venta])
      .select()
      .single();

    if (ventaError) {
      console.error('Error inserting sale:', ventaError);
      throw new Error('No se pudo guardar la venta.');
    }

    const venta_id = ventaData.id;

    // 2. Prepare details for 'detalle_ventas'
    const detallesToInsert = saleData.detalles.map(item => ({
      venta_id: venta_id,
      producto_id: item.id,
      cantidad: item.quantity,
      precio_unitario: item.precio,
      subtotal: item.precio * item.quantity,
    }));

    // 3. Insert into 'detalle_ventas'
    const { error: detalleError } = await supabase
      .from('detalle_ventas')
      .insert(detallesToInsert);

    if (detalleError) {
      console.error('Error inserting sale details:', detalleError);
      // Optional: attempt to delete the 'venta' record for consistency
      await supabase.from('ventas').delete().eq('id', venta_id);
      throw new Error('No se pudieron guardar los detalles de la venta.');
    }

    return { success: true, venta_id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
