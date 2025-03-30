"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firestore/firebase";
import { collection, getDocs } from "firebase/firestore";
export default function MemberManagement() {
    const [members, setMembers] = useState([]);

const fetchMembers = async () => {
    try {
        const snapshot = await getDocs(collection(db, "members"));
        const membersData = snapshot.docs.map((doc) => {
            const data = doc.data();
            // ตรวจสอบว่า createdAt มีอยู่ในเอกสารหรือไม่
            const createdAt = data.createdAt?.toDate() || null;

            return {
                id: doc.id,
                ...data,
                createdAt: createdAt,  // แปลง createdAt ถ้ามี
            };
        });
        setMembers(membersData); // อัพเดทข้อมูลใน state
    } catch (error) {
        console.error("Error fetching members:", error);
    }
};

useEffect(() => {
    fetchMembers();
},[]);

return (
    <main className="p-5 flex flex-col gap-5">
      <div className="flex flex-col bg-white p-6 rounded-xl shadow-md w-full">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl font-semibold text-gray-800">การจัดการสมาชิก</h1>
        </div>
        {/* ตารางสมาชิก */}
        <div className="overflow-x-auto max-w-full">
        <div className="overflow-y-auto max-h-[680px]">
          <table className="min-w-full table-fixed border-collapse border border-gray-300 rounded-lg shadow-sm">
            <thead className="bg-indigo-300">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">รหัสสมาชิก</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ชื่อ-นามสกุล</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">เบอร์โทรศัพท์</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">วันที่สมัคร</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">คะแนน</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {members.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-2 text-center text-sm text-gray-500">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                members
                  .sort((a, b) => {
                    const idA = parseInt(a.MEMID.replace("MEM", ""), 10);
                    const idB = parseInt(b.MEMID.replace("MEM", ""), 10);
                    return idA - idB;
                  })
                  .map((member, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{member.MEMID}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{member.Name}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{member.phoneNumber}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">
                        {/* แสดงวันที่ที่แปลงแล้วเป็นภาษาไทย */}
                        {new Date(member.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{member.points}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </main>
  );
}
