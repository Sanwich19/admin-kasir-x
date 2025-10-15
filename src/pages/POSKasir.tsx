import { useState, useEffect } from "react";
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { transactionSchema } from "@/lib/validationSchemas";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const POSKasir = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error("Stok tidak mencukupi");
        return;
      }
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > (product?.stock || 0)) {
          toast.error("Stok tidak mencukupi");
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const checkout = async () => {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong!");
      return;
    }

    // Validate transaction data
    const transactionData = {
      customer_name: customerName || undefined,
      total_amount: total,
      items: cart,
    };

    const validation = transactionSchema.safeParse(transactionData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login terlebih dahulu");
        return;
      }

      // Insert transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          customer_name: customerName || null,
          total_amount: total,
          items: cart as any,
        }]);

      if (transactionError) throw transactionError;

      // Update product stock
      for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          const { error: stockError } = await supabase
            .from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.id);

          if (stockError) throw stockError;
        }
      }

      toast.success(`Transaksi berhasil! Total: Rp ${total.toLocaleString()}`);
      setCart([]);
      setCustomerName("");
      fetchProducts(); // Refresh product list
    } catch (error: any) {
      toast.error(error.message || "Transaksi gagal");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Memuat produk...</p>
      </div>
    );
  }

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
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Tidak ada produk tersedia</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 bg-accent hover:bg-accent/80 rounded-lg transition-colors text-left"
                    disabled={product.stock === 0}
                  >
                    <p className="font-semibold text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <p className="text-primary font-bold mt-2">Rp {product.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Stok: {product.stock}</p>
                  </button>
                ))}
              </div>
            )}
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
            maxLength={100}
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
            <Button 
              className="w-full button-primary" 
              size="lg" 
              onClick={checkout}
              disabled={processing || cart.length === 0}
            >
              {processing ? "Memproses..." : "Checkout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSKasir;
