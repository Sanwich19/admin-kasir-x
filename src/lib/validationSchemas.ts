import { z } from 'zod';

// Auth validation
export const authSchema = z.object({
  email: z.string().trim().email({ message: "Email tidak valid" }).max(255, { message: "Email terlalu panjang" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }).max(100, { message: "Password terlalu panjang" }),
});

// Employee validation
export const employeeSchema = z.object({
  name: z.string().trim().min(1, { message: "Nama tidak boleh kosong" }).max(100, { message: "Nama terlalu panjang" }),
  position: z.string().trim().min(1, { message: "Posisi tidak boleh kosong" }).max(50, { message: "Posisi terlalu panjang" }),
  email: z.string().trim().email({ message: "Email tidak valid" }).max(255, { message: "Email terlalu panjang" }),
  phone: z.string().trim().regex(/^[0-9+\-\s()]+$/, { message: "Nomor telepon tidak valid" }).max(20, { message: "Nomor telepon terlalu panjang" }),
  status: z.enum(['active', 'inactive'], { message: "Status tidak valid" }),
});

// Product validation
export const productSchema = z.object({
  name: z.string().trim().min(1, { message: "Nama produk tidak boleh kosong" }).max(100, { message: "Nama produk terlalu panjang" }),
  category: z.string().trim().min(1, { message: "Kategori tidak boleh kosong" }).max(50, { message: "Kategori terlalu panjang" }),
  stock: z.number().int({ message: "Stok harus bilangan bulat" }).min(0, { message: "Stok tidak boleh negatif" }).max(999999, { message: "Stok terlalu besar" }),
  price: z.number().min(0, { message: "Harga tidak boleh negatif" }).max(999999999, { message: "Harga terlalu besar" }),
});

// Transaction validation
export const transactionSchema = z.object({
  customer_name: z.string().trim().max(100, { message: "Nama pelanggan terlalu panjang" }).optional(),
  customer_phone: z.string().trim().regex(/^[0-9+\-\s()]+$/, { message: "Nomor telepon tidak valid" }).max(20, { message: "Nomor telepon terlalu panjang" }).optional(),
  total_amount: z.number().min(0, { message: "Total tidak boleh negatif" }),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().int().min(1),
    notes: z.string().max(200, { message: "Catatan terlalu panjang" }).optional(),
    variant: z.string().max(50).optional(),
  })).min(1, { message: "Harus ada minimal 1 item" }),
});

// Shift validation
export const shiftSchema = z.object({
  employee_name: z.string().trim().min(1, { message: "Nama karyawan tidak boleh kosong" }).max(100, { message: "Nama karyawan terlalu panjang" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Format tanggal tidak valid" }),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Format waktu mulai tidak valid" }),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Format waktu selesai tidak valid" }),
});
