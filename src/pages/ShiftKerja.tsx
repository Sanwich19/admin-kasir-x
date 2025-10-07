import { useState } from "react";
import { Plus, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Shift {
  id: number;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "ongoing" | "completed";
}

const ShiftKerja = () => {
  const [shifts, setShifts] = useState<Shift[]>([
    { id: 1, employeeName: "Andi Setiawan", date: "2025-01-15", startTime: "08:00", endTime: "16:00", status: "completed" },
    { id: 2, employeeName: "Siti Nurhaliza", date: "2025-01-15", startTime: "16:00", endTime: "23:00", status: "ongoing" },
    { id: 3, employeeName: "Budi Santoso", date: "2025-01-16", startTime: "08:00", endTime: "16:00", status: "scheduled" },
    { id: 4, employeeName: "Dewi Lestari", date: "2025-01-16", startTime: "16:00", endTime: "23:00", status: "scheduled" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newShift: Shift = {
      id: shifts.length + 1,
      ...formData,
      status: "scheduled",
    };
    setShifts([...shifts, newShift]);
    setFormData({ employeeName: "", date: "", startTime: "", endTime: "" });
    setShowForm(false);
    toast.success("Shift berhasil ditambahkan");
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
                <Label htmlFor="employeeName">Nama Karyawan</Label>
                <Input
                  id="employeeName"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
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
                <Label htmlFor="startTime">Jam Mulai</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">Jam Selesai</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
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
                  <td className="p-3 font-medium text-foreground">{shift.employeeName}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(shift.date).toLocaleDateString('id-ID')}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{shift.startTime}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{shift.endTime}</span>
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
      </div>
    </div>
  );
};

export default ShiftKerja;
