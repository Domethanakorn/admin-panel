"use client";
import { useState,useEffect,useRef } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }){
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();  
  const sidebarRef = useRef(null);
 console.log(isOpen);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
      toggleSidebar;
  }, [pathname]);

  useEffect(() => {
    function handleClickOutsideEvent(event){
      if (sidebarRef.current && !sidebarRef?.current?.contains(event.target)){
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideEvent);
    return () => {
        document.removeEventListener("mousedown", handleClickOutsideEvent);
    };
  
  }, []);


  return     (
    <main className=" relative flex ">
      <div className="hidden md:block ">
      <Sidebar />
      </div>
      <div 
      ref={sidebarRef}
      className={`fixed md:hidden ease-in-out transition-all duration-400
        ${isOpen ? "translate-x-0":"-translate-x-[240px]"}`}>
      <Sidebar />
      </div>
      <section className="flex-1 flex flex-col min-h-screen ">
        <Header toggleSidebar={toggleSidebar} />
        <section className="flex-1 bg-[#eff3f4]">{children}</section>
      </section>
    </main>

        );
}