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
  notes?: string;
  variant?: string;
}

const POSKasir = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
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

  const addToCart = (product: Product, variant?: string) => {
    const cartKey = variant ? `${product.id}-${variant}` : product.id;
    const existing = cart.find(item => {
      const itemKey = item.variant ? `${item.id}-${item.variant}` : item.id;
      return itemKey === cartKey;
    });
    
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error("Stok tidak mencukupi");
        return;
      }
      setCart(cart.map(item => {
        const itemKey = item.variant ? `${item.id}-${item.variant}` : item.id;
        return itemKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item;
      }));
    } else {
      const displayName = variant ? `${product.name} (${variant})` : product.name;
      setCart([...cart, { 
        id: product.id, 
        name: displayName, 
        price: product.price, 
        quantity: 1,
        variant 
      }]);
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

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateNotes = (index: number, notes: string) => {
    setCart(cart.map((item, i) => i === index ? { ...item, notes } : item));
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
      customer_phone: customerPhone || undefined,
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

      // Use edge function for atomic checkout processing
      const { data, error } = await supabase.functions.invoke('process-checkout', {
        body: {
          cart,
          user_id: user.id,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
          total_amount: total
        }
      });

      if (error) throw error;
      
      if (data && data.error) {
        if (data.error === 'Insufficient stock' && data.details) {
          const stockErrors = data.details.map((item: any) => 
            `${item.product_name}: Stok tersedia ${item.available}, diminta ${item.requested}`
          ).join('\n');
          toast.error(`Stok tidak mencukupi:\n${stockErrors}`);
        } else {
          throw new Error(data.error);
        }
        return;
      }

      toast.success(`Transaksi berhasil! Total: Rp ${total.toLocaleString()}`);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      fetchProducts(); // Refresh product list
    } catch (error: any) {
      console.error('Checkout error:', error);
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
                {products.map((product) => {
                  const hasVariants = ['Coffee', 'Tea Series', 'Mocktail', 'Milk Based', 'Minuman', 'Kopi'].some(cat => 
                    product.category === cat || product.category.toLowerCase().includes(cat.toLowerCase())
                  );
                  
                  if (hasVariants) {
                    return (
                      <div key={product.id} className="p-4 bg-accent rounded-lg">
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-primary font-bold mt-2">Rp {product.price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">Stok: {product.stock}</p>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(product, "Hot")}
                            disabled={product.stock === 0}
                            className="text-xs"
                          >
                            🔥 Hot
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(product, "Ice")}
                            disabled={product.stock === 0}
                            className="text-xs"
                          >
                            ❄️ Ice
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
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
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Keranjang</h3>
          </div>

          <div className="space-y-3 mb-4">
            <Input
              placeholder="Nama Pelanggan (Opsional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              maxLength={100}
            />
            <Input
              placeholder="Nomor Telepon (Opsional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Keranjang kosong</p>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="p-3 bg-accent rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
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
                      <Button size="icon" variant="destructive" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Input
                    placeholder='Catatan (contoh: "tidak pedas", "tanpa bawang")'
                    value={item.notes || ""}
                    onChange={(e) => updateNotes(index, e.target.value)}
                    className="text-sm"
                    maxLength={200}
                  />
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
