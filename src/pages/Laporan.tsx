import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";
import { id as localeId } from "date-fns/locale";

const Laporan = () => {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      let intervals: Date[];

      switch (period) {
        case "day":
          startDate = startOfWeek(now, { locale: localeId });
          endDate = endOfWeek(now, { locale: localeId });
          intervals = eachDayOfInterval({ start: startDate, end: endDate });
          break;
        case "week":
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          intervals = eachWeekOfInterval({ start: startDate, end: endDate }, { locale: localeId });
          break;
        case "month":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          intervals = eachMonthOfInterval({ start: startDate, end: endDate });
          break;
      }

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at');

      if (error) throw error;

      // Calculate sales by interval
      const salesByInterval = intervals.map(intervalStart => {
        let intervalEnd: Date;
        let label: string;

        switch (period) {
          case "day":
            intervalEnd = endOfDay(intervalStart);
            label = format(intervalStart, "EEE", { locale: localeId });
            break;
          case "week":
            intervalEnd = endOfWeek(intervalStart, { locale: localeId });
            label = `Minggu ${format(intervalStart, "d MMM", { locale: localeId })}`;
            break;
          case "month":
            intervalEnd = endOfMonth(intervalStart);
            label = format(intervalStart, "MMM", { locale: localeId });
            break;
        }

        const intervalTransactions = transactions?.filter(t => {
          const tDate = new Date(t.created_at);
          return tDate >= intervalStart && tDate <= intervalEnd;
        }) || [];

        const total = intervalTransactions.reduce((sum, t) => sum + Number(t.total_amount), 0);

        return {
          date: label,
          total,
          transactions: intervalTransactions.length
        };
      });

      setSalesData(salesByInterval);

      // Calculate total sales and transactions
      const allTotal = transactions?.reduce((sum, t) => sum + Number(t.total_amount), 0) || 0;
      setTotalSales(allTotal);
      setTotalTransactions(transactions?.length || 0);

      // Calculate top products
      const productSales: { [key: string]: number } = {};
      transactions?.forEach(transaction => {
        const items = transaction.items as any[];
        items.forEach(item => {
          const productName = item.name;
          if (!productSales[productName]) {
            productSales[productName] = 0;
          }
          productSales[productName] += item.price * item.quantity;
        });
      });

      const topProducts = Object.entries(productSales)
        .map(([product, sales]) => ({ product, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      setProductData(topProducts);
    } catch (error: any) {
      toast.error("Gagal memuat laporan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const reportData = {
      periode: period === "day" ? "Harian" : period === "week" ? "Mingguan" : "Bulanan",
      tanggal: new Date().toLocaleDateString("id-ID"),
      ringkasan: {
        totalPenjualan: `Rp ${totalSales.toLocaleString()}`,
        totalTransaksi: totalTransactions,
        rataRataTransaksi: `Rp ${Math.round(totalSales / (totalTransactions || 1)).toLocaleString()}`
      },
      penjualan: salesData,
      produkTerlaris: productData
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-${period}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Laporan berhasil diunduh!");
  };

  const avgPerTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Memuat laporan...</p>
      </div>
    );
  }

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

      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="day">Per Hari</TabsTrigger>
          <TabsTrigger value="week">Per Minggu</TabsTrigger>
          <TabsTrigger value="month">Per Bulan</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="stat-card">
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                Total Penjualan {period === "day" ? "Minggu Ini" : period === "week" ? "Bulan Ini" : "Tahun Ini"}
              </h3>
              <p className="text-3xl font-bold text-primary">Rp {totalSales.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Total Transaksi</h3>
              <p className="text-3xl font-bold text-primary">{totalTransactions}</p>
            </div>
            <div className="stat-card">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Rata-rata per Transaksi</h3>
              <p className="text-3xl font-bold text-primary">Rp {Math.round(avgPerTransaction).toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Penjualan {period === "day" ? "Harian" : period === "week" ? "Mingguan" : "Bulanan"}
            </h3>
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
            {productData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada data penjualan produk</p>
            ) : (
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
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Laporan;
