"use client";
import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <main className="relative flex">
      
      {/* Sidebar สำหรับหน้าจอขนาดใหญ่ */}
      <div className="hidden md:block">
        
        <Sidebar />
      </div>

      {/* Sidebar สำหรับหน้าจอขนาดเล็ก */}
      <div
        className={`fixed md:hidden top-0 left-0 h-full z-40 bg-white shadow-lg ease-in-out transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* เนื้อหาหลัก */}
      <section className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
       {/*   <Header toggleSidebar={toggleSidebar} /> */}

        {/* Content Area */}
        <section className="w-full flex-1 bg-[#eff3f4] p-4 overflow-auto">
          {/* Wrapper สำหรับทำให้เนื้อหาภายใน Responsive */}
          <div className="w-full  max-w-[1440px]  mx-auto">{children}</div>
        </section>
      </section>
    </main>
  );
}
