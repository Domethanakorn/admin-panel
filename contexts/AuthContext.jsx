import { createContext, useState, useEffect, useContext } from "react";
import { auth } from "@/lib/firestore/firebase"; // import firebase auth
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // ตั้งค่าผู้ใช้
      setIsLoading(false); // หมดสถานะการโหลด
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
