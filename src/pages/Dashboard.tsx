import { TrendingUp, Users, Package, DollarSign } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { label: "Total Penjualan Hari Ini", value: "Rp 2.450.000", icon: DollarSign, color: "text-green-600" },
    { label: "Transaksi", value: "48", icon: TrendingUp, color: "text-blue-600" },
    { label: "Produk Terjual", value: "156", icon: Package, color: "text-purple-600" },
    { label: "Karyawan Aktif", value: "8", icon: Users, color: "text-orange-600" },
  ];

  const recentTransactions = [
    { id: "TRX001", customer: "Andi Setiawan", total: "Rp 85.000", time: "10:30" },
    { id: "TRX002", customer: "Siti Nurhaliza", total: "Rp 120.000", time: "10:45" },
    { id: "TRX003", customer: "Budi Santoso", total: "Rp 95.000", time: "11:00" },
    { id: "TRX004", customer: "Dewi Lestari", total: "Rp 150.000", time: "11:15" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Ringkasan aktivitas dan performa toko Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-accent ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Transaksi Terbaru</h3>
          <div className="space-y-3">
            {recentTransactions.map((trx) => (
              <div key={trx.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{trx.customer}</p>
                  <p className="text-sm text-muted-foreground">{trx.id} • {trx.time}</p>
                </div>
                <p className="font-semibold text-primary">{trx.total}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Produk Populer</h3>
          <div className="space-y-3">
            {[
              { name: "Kopi Espresso", sold: 45, revenue: "Rp 450.000" },
              { name: "Cappuccino", sold: 38, revenue: "Rp 380.000" },
              { name: "Nasi Goreng Spesial", sold: 32, revenue: "Rp 640.000" },
              { name: "Croissant", sold: 28, revenue: "Rp 280.000" },
            ].map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.sold} terjual</p>
                </div>
                <p className="font-semibold text-primary">{product.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
