import { useState } from "react";
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const POSKasir = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");

  const products = [
    { id: 1, name: "Kopi Espresso", price: 15000, category: "Minuman" },
    { id: 2, name: "Cappuccino", price: 18000, category: "Minuman" },
    { id: 3, name: "Nasi Goreng", price: 25000, category: "Makanan" },
    { id: 4, name: "Mie Goreng", price: 22000, category: "Makanan" },
    { id: 5, name: "Croissant", price: 12000, category: "Snack" },
    { id: 6, name: "Sandwich", price: 20000, category: "Snack" },
  ];

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const checkout = () => {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong!");
      return;
    }
    toast.success(`Transaksi berhasil! Total: Rp ${total.toLocaleString()}`);
    setCart([]);
    setCustomerName("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">POS Kasir</h2>
        <p className="text-muted-foreground">Sistem point of sale untuk transaksi pelanggan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="stat-card">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Produk</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-left"
                >
                  <p className="font-semibold text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <p className="text-primary font-bold mt-2">Rp {product.price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Keranjang</h3>
          </div>

          <Input
            placeholder="Nama Pelanggan (Opsional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mb-4"
          />

          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Keranjang kosong</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-primary">Rp {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">Rp {total.toLocaleString()}</span>
            </div>
            <Button className="w-full button-primary" size="lg" onClick={checkout}>
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSKasir;
