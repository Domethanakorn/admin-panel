"use client";

import { Menu } from "lucide-react";

export default function Header({ toggleSidebar }) {
  return (
    <section className="flex items-center gap-3 bg-white border-b px-4 py-3">
      {/* Button สำหรับเปิด Sidebar (เฉพาะหน้าจอขนาดเล็ก) */}
      <div className="flex justify-center items-center md:hidden">
        <button onClick={toggleSidebar}>
          <Menu />
        </button>
      </div>

      {/* แสดงคำว่า AdminPanel */}
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">AdminPanel</h1>
      </div>
    </section>
  );
}
