"use client";
import { useEffect, useState } from "react";

export default function MemberManagement() {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        // ดึงข้อมูลสมาชิกจาก API
        fetch("/api/members/")
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    // แปลงค่า createdAt ในข้อมูลสมาชิก
                    const membersWithFormattedDate = data.map((member) => ({
                        ...member,
                        createdAt: formatDate(member.createdAt), // แปลง createdAt
                    }));
                    setMembers(membersWithFormattedDate); // ตั้งค่าข้อมูลสมาชิก
                } else {
                    setMembers([]);
                    console.log("No members data available");
                }
            })
            .catch((error) => console.error("Error fetching members:", error));
    }, []);

    // ฟังก์ชันแปลง createdAt ที่เป็น timestamp เป็นวันที่ที่ต้องการ
    const formatDate = (timestamp) => {
        if (!timestamp) {
            return "Date Not Available";
        }
    
        const date = new Date(timestamp.seconds * 1000); // แปลง timestamp เป็น date object
        if (date.toString() === "Invalid Date") {
            return "Invalid Date";
        }
    
        return date.toLocaleString("en-US", {
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    };

    return (
        <main className="p-5 flex flex-col gap-5">
            <div className="flex flex-col bg-white p-6 rounded-xl shadow-md w-full">
                <div className="flex items-center justify-between pb-4">
                    <h1 className="text-xl font-semibold text-gray-800">Member Management</h1>
                </div>
                {/* ตารางสมาชิก */}
                <div className="overflow-x-auto max-w-full">
                    <table className="min-w-full table-fixed border-collapse border border-gray-300 rounded-lg shadow-sm">
                        <thead className="bg-indigo-300">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ID</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Name</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Phone Number</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">CreatedAt</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Points</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-2 text-center text-sm text-gray-500">
                                        No data available
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
                                                {/* แสดงวันที่ที่แปลงแล้ว */}
                                                {member.createdAt}
                                            </td>
                                            <td className="px-4 py-2 border border-gray-300 text-sm truncate">{member.points}</td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
