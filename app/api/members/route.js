import { db } from "@/lib/firestore/firebase";
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, query, where,orderBy, limit, serverTimestamp } from "firebase/firestore";

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
        if (!newMember || Object.keys(newMember).length === 0 || !newMember.phoneNumber) {
            return new Response(JSON.stringify({ message: "Invalid member data" }), { status: 400 });
        }

        const membersRef = collection(db, "members");
        const q = query(membersRef, where("phoneNumber", "==", newMember.phoneNumber));
        const snapshot = await getDocs(q);

        let newMEMID = '';
        let totalPoints = 10; // ให้ 10 แต้มเริ่มต้น

        if (!snapshot.empty) {
            // 🔹 ถ้าพบสมาชิก → อัปเดตแต้ม
            const memberDoc = snapshot.docs[0]; // เอกสารแรกที่พบ
            const memberData = memberDoc.data();
            totalPoints = (memberData.points || 0) + 10; // เพิ่ม 10 แต้มเข้าไป

            const memberRef = doc(db, "members", memberDoc.id);
            await updateDoc(memberRef, { points: totalPoints });

            newMEMID = memberData.MEMID; // ใช้ MEMID เดิม
            return new Response(
                JSON.stringify({ message: "Points updated successfully", MEMID: newMEMID, totalPoints }),
                { status: 200 }
            );
        } else {
            // 🔹 ถ้าไม่พบสมาชิก → เพิ่มสมาชิกใหม่
            const q = query(membersRef, orderBy("MEMID", "desc"), limit(1));
            const snapshot = await getDocs(q);

            let lastId = 0;
            if (!snapshot.empty) {
                const lastMember = snapshot.docs[0].data();
                lastId = parseInt(lastMember.MEMID.replace("MEM", ""), 10) || 0;
            }

            newMEMID = `MEM${lastId + 1}`;

            // 🔹 เพิ่มข้อมูลสมาชิกใหม่ พร้อมแต้มเริ่มต้น 10
            const newMemberData = {
                MEMID: newMEMID,
                ...newMember,
                points: totalPoints, 
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(membersRef, newMemberData);
            const docSnap = await getDoc(docRef);

            return new Response(
                JSON.stringify({ message: "Member added successfully", MEMID: newMEMID, ...docSnap.data() }),
                { status: 201 }
            );
        }

    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}
