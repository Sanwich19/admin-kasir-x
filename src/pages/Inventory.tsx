import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
}

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Kopi Espresso", category: "Minuman", stock: 50, price: 15000 },
    { id: 2, name: "Cappuccino", category: "Minuman", stock: 45, price: 18000 },
    { id: 3, name: "Nasi Goreng", category: "Makanan", stock: 30, price: 25000 },
    { id: 4, name: "Mie Goreng", category: "Makanan", stock: 28, price: 22000 },
    { id: 5, name: "Croissant", category: "Snack", stock: 60, price: 12000 },
    { id: 6, name: "Sandwich", category: "Snack", stock: 35, price: 20000 },
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success("Produk berhasil dihapus");
  };

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
          <Button className="button-primary">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </div>

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
                      <Button size="icon" variant="outline">
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
      </div>
    </div>
  );
};

export default Inventory;
