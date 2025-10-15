import { useState, useEffect } from "react";
import { Plus, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { shiftSchema } from "@/lib/validationSchemas";

interface Shift {
  id: string;
  employee_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "ongoing" | "completed";
}

const ShiftKerja = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employee_name: "",
    date: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setShifts((data as any) || []);
    } catch (error: any) {
      toast.error("Gagal memuat data shift");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    const validation = shiftSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Anda harus login terlebih dahulu");
        return;
      }

      const { error } = await supabase
        .from('shifts')
        .insert([{
          employee_name: validation.data.employee_name,
          date: validation.data.date,
          start_time: validation.data.start_time,
          end_time: validation.data.end_time,
          status: 'scheduled',
          created_by: user.id,
        }]);

      if (error) throw error;

      setFormData({ employee_name: "", date: "", start_time: "", end_time: "" });
      setShowForm(false);
      toast.success("Shift berhasil ditambahkan");
      fetchShifts();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    }
  };

  const getStatusColor = (status: Shift["status"]) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "ongoing": return "bg-blue-100 text-blue-700";
      case "scheduled": return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusLabel = (status: Shift["status"]) => {
    switch (status) {
      case "completed": return "Selesai";
      case "ongoing": return "Berlangsung";
      case "scheduled": return "Terjadwal";
    }
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
        <h2 className="text-3xl font-bold text-foreground mb-2">Shift Kerja</h2>
        <p className="text-muted-foreground">Kelola jadwal shift karyawan</p>
      </div>

      <div className="stat-card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-foreground">Jadwal Shift</h3>
          <Button className="button-primary" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Shift
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-accent rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_name">Nama Karyawan</Label>
                <Input
                  id="employee_name"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="start_time">Jam Mulai</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_time">Jam Selesai</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="button-primary">Simpan</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Karyawan</th>
                <th className="text-left p-3">Tanggal</th>
                <th className="text-left p-3">Jam Mulai</th>
                <th className="text-left p-3">Jam Selesai</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id} className="border-b border-border hover:bg-accent/50">
                  <td className="p-3 font-medium text-foreground">{shift.employee_name}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(shift.date).toLocaleDateString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{shift.start_time}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{shift.end_time}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shift.status)}`}>
                      {getStatusLabel(shift.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {shifts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Belum ada jadwal shift</p>
        )}
      </div>
    </div>
  );
};

export default ShiftKerja;
