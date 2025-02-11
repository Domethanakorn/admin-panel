"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserSearch, NotebookText, CakeSlice, GlassWaterIcon, ListOrdered, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firestore/firebase";
import { useRouter } from "next/navigation";

export default function Sidebar() {
    const router = useRouter();

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    const menuList = [
        { name: "Employee", Link: "/admin/employee", icon: <UserSearch className="h-5 w-5" /> },
        { name: "Member", Link: "/admin/member", icon: <NotebookText className="h-5 w-5" /> },
        { name: "Dessert", Link: "/admin/dessert", icon: <CakeSlice className="h-5 w-5" /> },
        { name: "Beverage", Link: "/admin/beverage", icon: <GlassWaterIcon className="h-5 w-5" /> },
        { name: "Order", Link: "/admin/order", icon: <ListOrdered className="h-5 w-5" /> },
    ];

    return (
        <section className="flex flex-col gap-5 bg-white border-r px-6 py-4 h-screen w-[250px] shadow-md">
            <div className="flex justify-center py-3">
                <h2 className="text-lg font-bold text-indigo-600">CAFE MANAGEMENT</h2>
            </div>

            <ul className="flex-1 flex flex-col gap-3 overflow-y-auto">
                {menuList.map((item, key) => (
                    <SidebarItem item={item} key={key} />
                ))}
            </ul>

            <button
                className="flex items-center justify-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 border rounded-lg hover:bg-red-100 transition"
                onClick={handleLogout}
            >
                <LogOut className="h-5 w-5" />
                Logout
            </button>
        </section>
    );
}

function SidebarItem({ item }) {
    const pathname = usePathname();
    const isSelected = pathname === item.Link;

    return (
        <Link href={item.Link}>
            <li
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium cursor-pointer transition-all
                    ${isSelected ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-indigo-100"}
                `}
            >
                {item.icon}
                <span className="text-sm">{item.name}</span>
            </li>
        </Link>
    );
}
