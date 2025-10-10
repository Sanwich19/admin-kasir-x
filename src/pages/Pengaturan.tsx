import { useState, useEffect } from "react";
import { Save, Store, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Pengaturan = () => {
  const [settings, setSettings] = useState({
    shopName: "Coffee Shop Admin",
    address: "Jl. Raya No. 123, Jakarta",
    phone: "021-12345678",
    email: "admin@coffeeshop.com",
    theme: localStorage.getItem("app-theme") || "blue-white",
    taxRate: "10",
  });

  useEffect(() => {
    // Apply theme on mount and when theme changes
    const root = document.documentElement;
    root.classList.remove("dark", "theme-purple-orange", "theme-black-orange");
    
    if (settings.theme === "black-orange") {
      root.classList.add("theme-black-orange");
    }
    
    localStorage.setItem("app-theme", settings.theme);
  }, [settings.theme]);

  const handleSave = () => {
    toast.success("Pengaturan berhasil disimpan!");
  };

  const themes = [
    { value: "blue-white", label: "Biru & Putih (Default)", color: "bg-[#0044cc]" },
    { value: "black-orange", label: "Hitam & Oranye", color: "bg-[#1a1a1a]" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Pengaturan</h2>
        <p className="text-muted-foreground">Kelola konfigurasi dan preferensi sistem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-6">
            <Store className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">Informasi Toko</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="shopName">Nama Toko</Label>
              <Input
                id="shopName"
                value={settings.shopName}
                onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Tema Tampilan</h3>
            </div>
            
            <div className="space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setSettings({ ...settings, theme: theme.value })}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    settings.theme === theme.value
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${theme.color}`} />
                    <span className="font-medium text-foreground">{theme.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Pengaturan Lainnya</h3>
            <div>
              <Label htmlFor="taxRate">Pajak (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="button-primary" size="lg" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
};

export default Pengaturan;
