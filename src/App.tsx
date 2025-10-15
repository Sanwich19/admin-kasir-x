import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import POSKasir from "./pages/POSKasir";
import Inventory from "./pages/Inventory";
import Karyawan from "./pages/Karyawan";
import ShiftKerja from "./pages/ShiftKerja";
import Laporan from "./pages/Laporan";
import Pengaturan from "./pages/Pengaturan";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/pos" element={<Layout><POSKasir /></Layout>} />
          <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
          <Route path="/karyawan" element={<Layout><Karyawan /></Layout>} />
          <Route path="/shift" element={<Layout><ShiftKerja /></Layout>} />
          <Route path="/laporan" element={<Layout><Laporan /></Layout>} />
          <Route path="/pengaturan" element={<Layout><Pengaturan /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
