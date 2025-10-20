import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { productSchema } from "@/lib/validationSchemas";

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
}

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: 0,
    price: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Produk berhasil dihapus");
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus produk");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(validation.data)
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Produk berhasil diperbarui");
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{
            name: validation.data.name,
            category: validation.data.category,
            stock: validation.data.stock,
            price: validation.data.price,
          }]);

        if (error) throw error;
        toast.success("Produk berhasil ditambahkan");
      }

      setFormData({ name: "", category: "", stock: 0, price: 0 });
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    }
  };

  const editProduct = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Inventory</h2>
        <p className="text-muted-foreground">Kelola stok dan produk toko Anda</p>
      </div>

      <div className="stat-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="button-primary" onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", category: "", stock: 0, price: 0 });
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-accent rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama Produk</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Makanan">Makanan</option>
                </select>
              </div>
              <div>
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Harga</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="button-primary">
                {editingId ? "Update" : "Simpan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: "", category: "", stock: 0, price: 0 });
              }}>Batal</Button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Nama Produk</th>
                <th className="text-left p-3">Kategori</th>
                <th className="text-left p-3">Stok</th>
                <th className="text-left p-3">Harga</th>
                <th className="text-center p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-accent/50">
                  <td className="p-3 font-medium text-foreground">{product.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-accent rounded text-sm">{product.category}</span>
                  </td>
                  <td className="p-3">
                    <span className={`font-semibold ${product.stock < 20 ? 'text-destructive' : 'text-foreground'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-primary">Rp {product.price.toLocaleString()}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => editProduct(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {searchTerm ? "Tidak ada produk yang ditemukan" : "Belum ada produk"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Inventory;
