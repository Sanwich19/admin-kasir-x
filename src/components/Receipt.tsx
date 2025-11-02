import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface ReceiptProps {
  orderNumber: string;
  customerName: string;
  items: ReceiptItem[];
  total: number;
  onClose: () => void;
}

export const Receipt = ({ orderNumber, customerName, items, total, onClose }: ReceiptProps) => {
  const now = new Date();
  const date = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-black max-w-md w-full rounded-lg shadow-xl overflow-hidden print:shadow-none">
        <div className="p-6 print:p-8">
          {/* Header - Hide close button when printing */}
          <div className="flex justify-between items-start mb-6 print:hidden">
            <h2 className="text-xl font-bold">Struk Pembayaran</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Receipt Content */}
          <div className="font-mono text-sm space-y-4">
            {/* Shop Info */}
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-4">
              <h3 className="font-bold text-lg mb-1">Olu Signature Coffe</h3>
              <p className="text-xs">Jl. Achmad Adnawijaya no.34 Tegal Gundil</p>
              <p className="text-xs">Kota Bogor, Jawa Barat, 16152</p>
              <p className="text-xs">082334557771</p>
            </div>

            {/* Order Code */}
            {orderNumber && (
              <div className="text-center border-b-2 border-dashed border-gray-300 pb-3">
                <p className="text-base font-bold">Kode Pesanan: {orderNumber}</p>
              </div>
            )}

            {/* Transaction Info */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>{date}</span>
                <span>{time}</span>
              </div>
              {customerName && (
                <div className="flex justify-between">
                  <span>Bill Name</span>
                  <span>{customerName}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="border-t-2 border-dashed border-gray-300 pt-3 space-y-2">
              {items.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="flex-1">{item.name}</span>
                    <span className="mx-4">x{item.quantity}</span>
                    <span className="text-right">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                  {item.notes && (
                    <div className="text-xs text-gray-600 pl-2">
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t-2 border-dashed border-gray-300 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs border-t-2 border-dashed border-gray-300 pt-4">
              <p>Terima kasih atas kunjungan Anda!</p>
              <p className="mt-1">Selamat menikmati</p>
            </div>
          </div>

          {/* Action Buttons - Hide when printing */}
          <div className="flex gap-3 mt-6 print:hidden">
            <Button onClick={handlePrint} className="flex-1">
              Cetak Struk
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
