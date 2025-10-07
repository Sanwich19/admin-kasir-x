import { useState } from "react";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
}

const Karyawan = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees] = useState<Employee[]>([
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
          <Button className="button-primary">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Karyawan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="p-4 bg-accent rounded-lg border border-border hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 bg-primary text-primary-foreground">
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
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{employee.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Karyawan;
