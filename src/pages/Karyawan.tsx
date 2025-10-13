import { useState } from "react";
import { Plus, Search, Mail, Phone, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  photo?: string;
}

const Karyawan = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: "Andi Setiawan", position: "Kasir", email: "andi@email.com", phone: "0812-3456-7890", status: "active" },
    { id: 2, name: "Siti Nurhaliza", position: "Kasir", email: "siti@email.com", phone: "0813-4567-8901", status: "active" },
    { id: 3, name: "Budi Santoso", position: "Chef", email: "budi@email.com", phone: "0814-5678-9012", status: "active" },
    { id: 4, name: "Dewi Lestari", position: "Manajer", email: "dewi@email.com", phone: "0815-6789-0123", status: "active" },
    { id: 5, name: "Rudi Hartono", position: "Kasir", email: "rudi@email.com", phone: "0816-7890-1234", status: "inactive" },
  ]);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    photo: "",
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setEmployees(employees.map(emp =>
        emp.id === editingId ? { ...emp, ...formData } : emp
      ));
      toast.success("Data karyawan berhasil diperbarui");
    } else {
      const newEmployee: Employee = {
        id: employees.length + 1,
        ...formData,
        status: "active",
      };
      setEmployees([...employees, newEmployee]);
      toast.success("Karyawan berhasil ditambahkan");
    }
    setFormData({ name: "", position: "", email: "", phone: "", photo: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const editEmployee = (employee: Employee) => {
    setFormData({
      name: employee.name,
      position: employee.position,
      email: employee.email,
      phone: employee.phone,
      photo: employee.photo || "",
    });
    setEditingId(employee.id);
    setShowForm(true);
  };

  const deleteEmployee = () => {
    if (deleteId) {
      setEmployees(employees.filter(emp => emp.id !== deleteId));
      toast.success("Karyawan berhasil dihapus");
      setDeleteId(null);
    }
  };

  const toggleStatus = (id: number) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, status: emp.status === "active" ? "inactive" : "active" } : emp
    ));
    const employee = employees.find(emp => emp.id === id);
    toast.success(`Status ${employee?.name} berhasil diubah`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Karyawan</h2>
        <p className="text-muted-foreground">Kelola data dan informasi karyawan</p>
      </div>

      <div className="stat-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="button-primary" onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", position: "", email: "", phone: "", photo: "" });
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Karyawan
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-accent rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Posisi</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="photo">Foto Karyawan</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="cursor-pointer"
                />
                {formData.photo && (
                  <div className="mt-2">
                    <img src={formData.photo} alt="Preview" className="h-20 w-20 rounded-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="button-primary">
                {editingId ? "Update" : "Simpan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: "", position: "", email: "", phone: "", photo: "" });
              }}>Batal</Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="p-4 bg-accent rounded-lg border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 bg-primary text-primary-foreground">
                  {employee.photo && <AvatarImage src={employee.photo} alt={employee.name} />}
                  <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{employee.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      employee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {employee.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{employee.position}</p>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{employee.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Switch 
                        id={`status-${employee.id}`}
                        checked={employee.status === "active"}
                        onCheckedChange={() => toggleStatus(employee.id)}
                      />
                      <Label htmlFor={`status-${employee.id}`} className="cursor-pointer">
                        {employee.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => editEmployee(employee)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => setDeleteId(employee.id)}
                        className="flex-1"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Karyawan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus karyawan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={deleteEmployee} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Karyawan;
