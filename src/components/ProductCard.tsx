'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';
import { PlusCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const imageUrl = product.imagen_url || 'https://placehold.co/300x300.png';
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer" onClick={() => onAddToCart(product)}>
      <CardHeader className="p-0">
        <div className="aspect-square relative w-full">
          <Image
            src={imageUrl}
            alt={product.nombre}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
            data-ai-hint="bingo card"
            unoptimized={imageUrl.startsWith('https://placehold.co')}
          />
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow">
        <h3 className="font-semibold text-sm truncate">{product.nombre}</h3>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <p className="font-bold text-lg text-primary">{formatCurrency(product.precio)}</p>
         <Button size="sm" variant="ghost" className="text-accent hover:bg-accent/10 hover:text-accent">
          <PlusCircle className="h-5 w-5" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
