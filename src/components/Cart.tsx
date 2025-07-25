'use client';

import { useState, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MinusCircle, PlusCircle, XCircle, ShoppingCart, Loader2, Trash2 } from 'lucide-react';
import type { CartItem } from '@/types';

interface CartProps {
  cartItems: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  onRecordSale: (cashReceived: number) => Promise<void>;
  isSubmitting: boolean;
}

export default function Cart({ cartItems, setCart, onRecordSale, isSubmitting }: CartProps) {
  const [cashReceived, setCashReceived] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  const parseFormattedNumber = (value: string) => {
    return parseFloat(value.replace(/\./g, ''));
  };

  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, ''); // Allow only numbers
    if (rawValue === '') {
        setCashReceived('');
        return;
    }
    const numericValue = Number(rawValue);
    if (!isNaN(numericValue)) {
        const formattedValue = new Intl.NumberFormat('es-CO').format(numericValue);
        setCashReceived(formattedValue);
    }
  };


  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
      );
    }
  };
  
  const handleClearCart = () => {
    setCart([]);
    setCashReceived('');
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.precio * item.quantity, 0);
  }, [cartItems]);

  const change = useMemo(() => {
    const cash = parseFormattedNumber(cashReceived);
    if (!isNaN(cash) && cash >= subtotal) {
      return cash - subtotal;
    }
    return 0;
  }, [cashReceived, subtotal]);

  const canFinalize = useMemo(() => {
    // The only conditions to finalize are having items in the cart and not currently submitting.
    return cartItems.length > 0 && !isSubmitting;
  }, [cartItems, isSubmitting]);

  const handleFinalize = () => {
    if(canFinalize) {
      const cash = parseFormattedNumber(cashReceived);
      // If cash is not a valid number or is less than subtotal, assume exact payment
      const cashToRecord = !isNaN(cash) && cash >= subtotal ? cash : subtotal;
      onRecordSale(cashToRecord).then(() => {
        setCashReceived('');
      });
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="text-accent" />
            Venta Actual
          </CardTitle>
          {cartItems.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearCart}
              className="h-8 w-8 text-destructive/80 hover:text-destructive"
              aria-label="Vaciar venta"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64 pr-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">El carrito está vacío.</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-grow">
                    <p className="font-medium text-sm truncate">{item.nombre}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(item.precio)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="font-semibold w-20 text-right">{formatCurrency(item.precio * item.quantity)}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/80 hover:text-destructive" onClick={() => updateQuantity(item.id, 0)}>
                      <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="space-y-2 text-lg">
          <div className="flex justify-between font-bold">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="cash-received" className="font-semibold">Efectivo</label>
            <Input
              id="cash-received"
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="w-32 text-right font-mono"
              value={cashReceived}
              onChange={handleCashChange}
              disabled={isSubmitting || cartItems.length === 0}
            />
          </div>
          <div className="flex justify-between font-bold text-accent">
            <span>Cambio</span>
            <span>{formatCurrency(change)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="lg" className="w-full" disabled={!canFinalize} onClick={handleFinalize}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? 'Registrando...' : 'Finalizar Venta'}
        </Button>
      </CardFooter>
    </Card>
  );
}
