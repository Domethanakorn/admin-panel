"use client";

import { AuthContextProvider } from "@/contexts/AuthContext";
import AdminLayout from "./components/AdminLayout";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@nextui-org/react";
import { useAuth } from "@/contexts/AuthContext";

// ใช้ AdminChecking ภายใน Layout
export default function Layout({ children }) {
  return (
    <AuthContextProvider>
      <AdminChecking>{children}</AdminChecking> 
    </AuthContextProvider>
  );
}

function AdminChecking({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/"); // ถ้าไม่มีผู้ใช้และไม่กำลังโหลด, ทำการ redirect
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <CircularProgress />
      </div>
    );
  }

  if (!user) {
    return ( // ใส่ return ในกรณีที่ไม่มี user
      <div className="h-screen w-screen flex justify-center items-center">
        <h1>Please Login First!</h1>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>; // ถ้ามี user, แสดง AdminLayout
}
