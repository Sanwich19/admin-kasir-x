import { useState, useEffect } from "react";
import { Save, Store, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

const Pengaturan = () => {
  const { canManageSettings, loading: roleLoading } = useUserRole();
  const [settings, setSettings] = useState({
    shopName: "",
    address: "",
    phone: "",
    email: "",
    theme: localStorage.getItem("app-theme") || "blue-white",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value');

        if (error) throw error;

        if (data) {
          const settingsMap: Record<string, string> = {};
          data.forEach(item => {
            settingsMap[item.key] = item.value;
          });

          setSettings(prev => ({
            ...prev,
            shopName: settingsMap.shopName || "Coffee Shop Admin",
            address: settingsMap.address || "Jl. Raya No. 123, Jakarta",
            phone: settingsMap.phone || "021-12345678",
            email: settingsMap.email || "admin@coffeeshop.com",
          }));
        }
      } catch (error: any) {
        console.error('Error loading settings:', error);
        toast.error("Gagal memuat pengaturan");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    // Apply theme on mount and when theme changes
    const root = document.documentElement;
    root.classList.remove("dark", "theme-purple-orange", "theme-black-orange");
    
    if (settings.theme === "dark") {
      root.classList.add("dark");
    }
    
    localStorage.setItem("app-theme", settings.theme);
  }, [settings.theme]);

  const handleSave = async () => {
    if (!canManageSettings) {
      toast.error("Anda tidak memiliki izin untuk mengubah pengaturan");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login terlebih dahulu");
        return;
      }

      // Update all settings
      const settingsToUpdate = [
        { key: 'shopName', value: settings.shopName },
        { key: 'address', value: settings.address },
        { key: 'phone', value: settings.phone },
        { key: 'email', value: settings.email },
      ];

      for (const setting of settingsToUpdate) {
        const { error } = await supabase
          .from('settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            updated_by: user.id
          }, {
            onConflict: 'key'
          });

        if (error) throw error;
      }

      toast.success("Pengaturan berhasil disimpan!");
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { value: "blue-white", label: "Biru & Putih (Default)", color: "bg-[#0044cc]" },
    { value: "dark", label: "Mode Gelap", color: "bg-gray-900" },
  ];

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Memuat pengaturan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Pengaturan</h2>
        <p className="text-muted-foreground">Kelola konfigurasi dan preferensi sistem</p>
        {!canManageSettings && (
          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ℹ️ Anda hanya dapat melihat pengaturan. Hubungi administrator untuk mengubah pengaturan.
            </p>
          </div>
        )}
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
                disabled={!canManageSettings}
              />
            </div>
            <div>
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                disabled={!canManageSettings}
              />
            </div>
            <div>
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                disabled={!canManageSettings}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                disabled={!canManageSettings}
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
        </div>
      </div>

      {canManageSettings && (
        <div className="flex justify-end">
          <Button 
            className="button-primary" 
            size="lg" 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pengaturan;
