"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BookHeart, PackageSearch, CircleDollarSign, NotebookText, UserSearch, LogOut, CakeIcon, CakeSlice, ListOrdered, GlassWaterIcon } from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firestore/firebase";
import { useRouter } from "next/navigation";


export default function Sidebar() {
    const router = useRouter(); // เรียก useRouter ใน Component หลัก

    const handleLogout = async () => {

        await signOut(auth);  // Log out จาก Firebase
        router.push("/");  //กลับไปหน้า Login
    };

    const menuList = [
        {
            name: "Dashboard",
            Link: "/admin",
            icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
            name: "Employee",
            Link: "/admin/employee",
            icon: <UserSearch className="h-5 w-5" />,
        },
        {
            name: "Member",
            Link: "/admin/member",
            icon: <NotebookText className="h-5 w-5" />,
        },
        {
            name: "Dessert",
            Link: "/admin/dessert",
            icon: <CakeSlice className="h-5 w-5" />,
        },
        {
            name: "Beverage",
            Link: "/admin/beverage",
            icon: <GlassWaterIcon className="h-5 w-5" />,
        },
        {
            name: "Order",
            Link: "/admin/order",
            icon: <ListOrdered className="h-5 w-5" />,
        },
    ];

    return (
        <section className="flex flex-col gap-7 bg-white border-r px-5 py-3 h-screen overflow-hidden w-[240px]">
            <div className="flex justify-center py-3">
               
            </div>

            <ul className="flex-1 flex flex-col gap-4 h-full overflow-y-auto text-medium">
                {menuList?.map((item, key) => {
                    return (
                        <Tap item={item} key={key} />
                    );
                })}
            </ul>
            <div className="flex justify-center w-full">
                <button
                    className="flex gap-2 items-center px-3 py-2 hover:bg-indigo-100 rounded-xl w-full justify-center ease-soft-spring duration-400 transition-all"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />Logout
                </button>
            </div>
        </section>
    );
}

function Tap({ item }) {
    const pathname = usePathname();
    const isSelected = pathname === item?.Link;
    return (
        <Link href={item?.Link}>
            <li
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ease-soft-spring transition-all duration-300
                    ${isSelected ? " bg-primary text-white" : "bg-white text-black"}
                `}
            >
                {item?.icon} {item?.name}
            </li>
        </Link>
    );
}
