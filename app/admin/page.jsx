"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@nextui-org/react";
import { signOut } from "firebase/auth"; 
import { auth } from "@/lib/firestore/firebase";

export default function AdminPage() {
    const { user, isLoading } = useAuth(); // Assuming setUser comes from your context
    const router = useRouter();
    console.log("User:", user);
    console.log("IsLoading:", isLoading);
    useEffect(() => {
        if (!user && !isLoading) {
            router.push("/"); 
        }
    }, [user, isLoading, router]);


}
