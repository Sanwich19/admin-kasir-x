import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Laporan = () => {
  const salesData = [
    { date: "Sen", total: 2500000, transactions: 45 },
    { date: "Sel", total: 3200000, transactions: 58 },
    { date: "Rab", total: 2800000, transactions: 52 },
    { date: "Kam", total: 3500000, transactions: 65 },
    { date: "Jum", total: 4200000, transactions: 78 },
    { date: "Sab", total: 4800000, transactions: 85 },
    { date: "Min", total: 3800000, transactions: 68 },
  ];

  const productData = [
    { product: "Kopi Espresso", sales: 1200000 },
    { product: "Cappuccino", sales: 980000 },
    { product: "Nasi Goreng", sales: 1500000 },
    { product: "Mie Goreng", sales: 890000 },
    { product: "Croissant", sales: 650000 },
  ];

  const handleDownloadReport = () => {
    const reportData = {
      periode: "Minggu Ini",
      tanggal: new Date().toLocaleDateString("id-ID"),
      ringkasan: {
        totalPenjualan: "Rp 24.8 Juta",
        totalTransaksi: 451,
        rataRataTransaksi: "Rp 55.000"
      },
      penjualanMingguan: salesData,
      produkTerlaris: productData
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Laporan berhasil diunduh!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Laporan</h2>
          <p className="text-muted-foreground">Analisis penjualan dan performa toko</p>
        </div>
        <Button onClick={handleDownloadReport} className="button-primary">
          <Download className="h-4 w-4 mr-2" />
          Unduh Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="stat-card">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Total Penjualan Minggu Ini</h3>
          <p className="text-3xl font-bold text-primary">Rp 24.8 Juta</p>
          <p className="text-sm text-green-600 mt-1">↑ 12% dari minggu lalu</p>
        </div>
        <div className="stat-card">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Total Transaksi</h3>
          <p className="text-3xl font-bold text-primary">451</p>
          <p className="text-sm text-green-600 mt-1">↑ 8% dari minggu lalu</p>
        </div>
        <div className="stat-card">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Rata-rata per Transaksi</h3>
          <p className="text-3xl font-bold text-primary">Rp 55.000</p>
          <p className="text-sm text-green-600 mt-1">↑ 4% dari minggu lalu</p>
        </div>
      </div>

      <div className="stat-card">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Penjualan Mingguan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `Rp ${value.toLocaleString()}`}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              name="Total Penjualan"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="stat-card">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Top 5 Produk Terlaris</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `Rp ${value.toLocaleString()}`}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="sales" fill="hsl(var(--primary))" name="Penjualan" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Laporan;
