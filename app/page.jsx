"use client";

import { Button } from "@nextui-org/react";
import { auth } from "@/lib/firestore/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoginSuccess, setIsLoginSuccess] = useState(false); // สถานะการล็อกอินสำเร็จ
  const [loading, setLoading] = useState(false); // สถานะการกำลังโหลด
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // สถานะสำหรับแสดงข้อความสำเร็จ
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // ตั้งค่าสถานะกำลังโหลด
    console.log("Login attempt...");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setError("");  // ลบข้อความแสดงข้อผิดพลาดเก่า
      setIsLoginSuccess(true); // ตั้งค่าสถานะล็อกอินสำเร็จ
      setShowSuccessMessage(true); // แสดงข้อความสำเร็จ
      setTimeout(() => {
        setShowSuccessMessage(false); // ซ่อนข้อความสำเร็จ
        router.push('/admin'); // เปลี่ยนหน้าหลังจาก 1.5 วินาที
      }, 1500); // ตั้งเวลาแค่ 1.5 วินาที
    } catch (err) {
      setError("Email or password is incorrect");
    } finally {
      setLoading(false); // ปิดสถานะกำลังโหลด
    }
  };

  // Move the handleKeyPress function outside of handleLogin
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);  // Trigger the login when the Enter key is pressed
    }
  };

  return (
    <main className="w-full flex justify-center items-center bg-gray-400 md:p-24 p-10 min-h-screen">
      <section className="flex flex-col gap-3 min-h-screen">
        <div className="flex flex-col gap-3 bg-white md:p-10 p-5 rounded-xl min-w-[440px] w-full">
          <div className="flex justify-center">
            <img className="h-14" src="admin.png" alt="" />
          </div>
          <h1 className="font-bold text-xl text-center">Admin Panel</h1>
          <form className="flex flex-col gap-3">
            <input 
              placeholder="Enter Your Email" 
              type="email" 
              name="user-email" 
              id="user-email"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}  // Attach onKeyDown to the input
              className="px-3 py-2 rounded-xl border focus:outline-none w-full"
            />
            <input 
              placeholder="Enter Your Password" 
              type="password" 
              name="user-password" 
              id="user-password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}  // Attach onKeyDown to the password input
              className="px-3 py-2 rounded-xl border focus:outline-none w-full"
            />
            <Button 
              color="primary"  
              onClick={handleLogin}
              disabled={loading} // Disable while loading
            >
              Login
            </Button>
            <hr />
           
            {error && <p className="text-red-500 text-center">{error}</p>}
            <p className="text-red-500 text-center">ลืมรหัสผ่านโปรดติดต่อเจ้าหน้าที่</p>
            {/* Show Success Message */}
            {showSuccessMessage && (
              <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 bg-gray-700">
                <div className="flex flex-col justify-center items-center bg-white p-6 rounded-lg">
                  <span className="text-green-500 text-4xl">✔</span> {/* Success icon */}
                  <p className="text-green-500 text-xl mt-2">Login Success</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>                    
    </main>
  );
}
