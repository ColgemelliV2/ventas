'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from './ui/separator';
import type { SaleData, Cajero } from '@/types';
import { Printer } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: SaleData;
  cajero: Cajero;
}

const ReceiptModal = ({ isOpen, onClose, saleData, cajero }: ReceiptModalProps) => {
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to restore event listeners and original page
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <div id="receipt-content">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #receipt-content, #receipt-content * { visibility: visible; }
              #receipt-content { position: absolute; left: 0; top: 0; width: 100%; }
              .no-print { display: none; }
            }
          `}</style>
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold">Bingo SalesMate</DialogTitle>
              <p className="text-center text-sm text-muted-foreground">Recibo de Venta</p>
            </DialogHeader>
            <div className="my-4 text-sm">
              <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
              <p><strong>Cajero:</strong> {cajero.nombre_completo}</p>
            </div>
            <Separator />
            <div className="my-4 max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Cant.</th>
                    <th className="text-left py-2 font-semibold">Producto</th>
                    <th className="text-right py-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {saleData.detalles.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">{item.nombre}</td>
                      <td className="text-right py-2">{formatCurrency(item.precio * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Separator />
            <div className="mt-4 space-y-2 text-base">
              <div className="flex justify-between font-bold">
                <span>Subtotal:</span>
                <span>{formatCurrency(saleData.venta.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Efectivo Recibido:</span>
                <span>{formatCurrency(saleData.venta.efectivo_recibido)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-accent">
                <span>Cambio:</span>
                <span>{formatCurrency(saleData.venta.cambio)}</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="p-6 pt-0 sm:justify-between no-print">
           <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <DialogClose asChild>
            <Button type="button" onClick={onClose}>
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
