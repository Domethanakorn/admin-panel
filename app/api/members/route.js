import { db } from "@/lib/firestore/firebase";
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, query, where,orderBy, limit, serverTimestamp,runTransaction } from "firebase/firestore";

// ฟังก์ชัน GET: ดึงข้อมูลสมาชิกทั้งหมด, Check ข้อมูลสมาชิก
export async function GET(request) {
    try {
        // ดึง phoneNumber จาก query parameter
        const url = new URL(request.url);
        const phoneNumber = url.searchParams.get("phoneNumber");

        const membersRef = collection(db, "members");

        // กรณีมี phoneNumber: ดูคนเดียว
        if (phoneNumber && phoneNumber.trim() !== "") {
            const q = query(membersRef, where("phoneNumber", "==", phoneNumber));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return new Response(
                    JSON.stringify({ message: "Member not found" }),
                    { status: 404 }
                );
            }

            const member = snapshot.docs[0].data();
            return new Response(
                JSON.stringify({
                    id: snapshot.docs[0].id,
                    ...member
                }),
                { status: 200 }
            );
        }

        // กรณีไม่มี phoneNumber: ดึงทั้งหมด
        const snapshot = await getDocs(membersRef);
        const members = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        if (members.length === 0) {
            return new Response(
                JSON.stringify({ message: "No members found" }),
                { status: 404 }
            );
        }

        return new Response(JSON.stringify(members), { status: 200 });

    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Something went wrong" }),
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

        const totalPoints = 0; // แต้มเริ่มต้น

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


export async function PUT(request) {
    try {
        const { phoneNumber, pointsToDeduct } = await request.json();

        if (!phoneNumber || pointsToDeduct === undefined) {
            return new Response(
                JSON.stringify({ message: "phoneNumber and pointsToDeduct are required" }),
                { status: 400 }
            );
        }

        const membersRef = collection(db, "members");
        const memberQuery = query(membersRef, where("phoneNumber", "==", phoneNumber));
        const snapshot = await getDocs(memberQuery);

        if (snapshot.empty) {
            return new Response(
                JSON.stringify({ message: "Member not found" }),
                { status: 404 }
            );
        }

        const memberDoc = snapshot.docs[0];
        const currentPoints = memberDoc.data().points || 0;

        if (currentPoints < pointsToDeduct) {
            return new Response(
                JSON.stringify({ message: "Insufficient points" }),
                { status: 400 }
            );
        }

        const memberRef = doc(db, "members", memberDoc.id);
        const newPoints = currentPoints - pointsToDeduct;

        // อัปเดตข้อมูลโดยใช้ updateDoc 
        await updateDoc(memberRef, {
            points: newPoints,
            updatedAt: serverTimestamp()
        });

        return new Response(
            JSON.stringify({
                message: "Points deducted successfully",
                newPoints: newPoints,
                phoneNumber: phoneNumber
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}