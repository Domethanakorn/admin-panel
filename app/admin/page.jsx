"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@nextui-org/react";
import { signOut } from "firebase/auth"; 
import { auth } from "@/lib/firestore/firebase";

export default function AdminPage() {
    const router = useRouter();

}
