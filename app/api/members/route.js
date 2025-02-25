import { db } from "@/lib/firestore/firebase";
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, query, where,orderBy, limit, serverTimestamp,runTransaction } from "firebase/firestore";

// ฟังก์ชัน GET: ดึงข้อมูลสมาชิกทั้งหมด
export async function GET() {
    try {
        const snapshot = await getDocs(collection(db, "members")); // เปลี่ยนเป็น members
        const members = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (members.length === 0) {
            return new Response(JSON.stringify({ message: "No members found" }), { status: 200 });
        }

        return new Response(JSON.stringify(members), { status: 200 });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}

// ฟังก์ชัน POST: เพิ่มข้อมูลสมาชิกใหม่
export async function POST(request) {
    try {
        const newMember = await request.json();
        if (!newMember || !newMember.phoneNumber) {
            return new Response(JSON.stringify({ message: "Invalid member data" }), { status: 400 });
        }

        const membersRef = collection(db, "members");

        // ตรวจสอบเบอร์โทรซ้ำ
        const existingQuery = query(membersRef, where("phoneNumber", "==", newMember.phoneNumber));
        const existingSnapshot = await getDocs(existingQuery);

        if (!existingSnapshot.empty) {
            return new Response(
                JSON.stringify({ message: "Already a member", phoneNumber: newMember.phoneNumber }),
                { status: 409 }
            );
        }

        // คำนวณ MEMID และ memNumber ใหม่
        const lastMemberQuery = query(membersRef, orderBy("memNumber", "desc"), limit(1));
        const lastMemberSnapshot = await getDocs(lastMemberQuery);

        let newMemberNumber = 1; // เริ่มต้นจาก 1 หากไม่มีสมาชิกในระบบ
        let newMEMID = "MEM1"; // เริ่มต้นจาก MEM1 หากไม่มีสมาชิก

        if (!lastMemberSnapshot.empty) {
            const lastMember = lastMemberSnapshot.docs[0].data();
            newMemberNumber = lastMember.memNumber + 1; // เพิ่ม memNumber ล่าสุด
            newMEMID = `MEM${newMemberNumber}`; // สร้าง MEMID ถัดไป
        }

        const totalPoints = 10; // แต้มเริ่มต้น

        const newMemberDoc = {
            MEMID: newMEMID,
            memNumber: newMemberNumber, 
            ...newMember,
            points: totalPoints,
            createdAt: serverTimestamp(),
        };

        // เพิ่มข้อมูลสมาชิกใหม่ลง Firestore
        const docRef = await addDoc(membersRef, newMemberDoc);

        return new Response(
            JSON.stringify({ message: "Member added successfully", MEMID: newMemberDoc.MEMID }),
            { status: 201 }
        );
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}
