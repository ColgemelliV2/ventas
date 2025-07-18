'use client';

import { useState, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MinusCircle, PlusCircle, XCircle, ShoppingCart, Loader2 } from 'lucide-react';
import type { CartItem } from '@/types';

interface CartProps {
  cartItems: CartItem[];
  setCart: Dispatch<SetStateAction<CartItem[]>>;
  onRecordSale: (cashReceived: number) => Promise<void>;
  isSubmitting: boolean;
}

export default function Cart({ cartItems, setCart, onRecordSale, isSubmitting }: CartProps) {
  const [cashReceived, setCashReceived] = useState('');

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
      );
    }
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.precio * item.quantity, 0);
  }, [cartItems]);

  const change = useMemo(() => {
    const cash = parseFloat(cashReceived);
    if (!isNaN(cash) && cash >= subtotal) {
      return cash - subtotal;
    }
    return 0;
  }, [cashReceived, subtotal]);

  const canFinalize = useMemo(() => {
    const cash = parseFloat(cashReceived);
    return cartItems.length > 0 && !isNaN(cash) && cash >= subtotal && !isSubmitting;
  }, [cashReceived, subtotal, cartItems, isSubmitting]);

  const handleFinalize = () => {
    if(canFinalize) {
      onRecordSale(parseFloat(cashReceived)).then(() => {
        setCashReceived('');
      });
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShoppingCart className="text-accent" />
          Venta Actual
        </CardTitle>
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
                    <p className="text-xs text-muted-foreground">${item.precio.toFixed(2)}</p>
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
                  <p className="font-semibold w-16 text-right">${(item.precio * item.quantity).toFixed(2)}</p>
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
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="cash-received" className="font-semibold">Efectivo</label>
            <Input
              id="cash-received"
              type="number"
              placeholder="0.00"
              className="w-32 text-right font-mono"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              disabled={isSubmitting || cartItems.length === 0}
            />
          </div>
          <div className="flex justify-between font-bold text-accent">
            <span>Cambio</span>
            <span>${change.toFixed(2)}</span>
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
