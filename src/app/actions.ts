'use server';

import { supabase } from '@/lib/supabase';
import type { Product, SaleData } from '@/types';

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

  // NOTE: This is a plain text password check.
  // For a real production app, you should use a secure hashing library like bcrypt to compare hashes.
  if (user.password_hash !== credentials.password) {
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }

  if (!user.activo) {
    return { success: false, error: 'La cuenta del cajero está inactiva.' };
  }
  
  // Exclude password hash from the returned user object
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

  // Custom sorting logic
  const getCategoryOrder = (productName: string): number => {
    const lowerCaseName = productName.toLowerCase();
    
    // Keywords for food
    const foodKeywords = ['empanada', 'pastel', 'chorizo', 'arepa', 'hamburguesa', 'perro', 'pizza', 'torta', 'dedito'];
    // Keywords for drinks
    const drinkKeywords = ['gaseosa', 'agua', 'jugo', 'cerveza', 'limonada', 'refajo', 'malta'];
    
    if (foodKeywords.some(keyword => lowerCaseName.includes(keyword))) {
      return 1; // Foods first
    }
    if (drinkKeywords.some(keyword => lowerCaseName.includes(keyword))) {
      return 2; // Drinks second
    }
    return 3; // Others last
  };

  const sortedData = data.sort((a, b) => {
    const orderA = getCategoryOrder(a.nombre);
    const orderB = getCategoryOrder(b.nombre);

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    // If they are in the same category, sort alphabetically
    return a.nombre.localeCompare(b.nombre);
  });

  return sortedData;
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
