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
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setError('');
      setIsLoginSuccess(true);
      setTimeout(() => {
        router.push('/admin/employee');
      }, 1500);
    } catch (err) {
      setError("Email or password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full h-screen flex justify-center items-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full sm:w-[400px]">
         {/* <div className="flex justify-center mb-6">
          <img src="/admin.png" alt="Logo" className="h-12" />
        </div>*/}
        <h2 className="text-center text-xl font-semibold text-indigo-600 mb-6">CAFE MANAGEMENT </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
          <input
            type="password"
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
          />
         <Button
          type="submit"
          disabled={loading}
          className="w-full py-2 mt-4 rounded-xl bg-indigo-600 text-white hover:bg-[#3700B3]"
        >
          {loading ? "Logging in..." : "Login"}
          </Button>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          <p className="text-center mt-2 text-gray-600">
            Forgot password? Please contact support.
          </p>
        </form>
      </div>
    </main>
  );
}
