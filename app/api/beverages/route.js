import { db } from "@/lib/firestore/firebase"; 
import { collection, getDocs, addDoc, doc, deleteDoc, setDoc, updateDoc, query, where } from "firebase/firestore";

// ฟังก์ชัน GET: ดึงข้อมูลเครื่องดื่มทั้งหมด
export async function GET() {
    try {
        const snapshot = await getDocs(collection(db, "beverages"));
        const beverages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (beverages.length === 0) {
            return new Response(JSON.stringify({ message: "No beverages found" }), { status: 200 });
        }

        return new Response(JSON.stringify(beverages), { status: 200 });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}

// ฟังก์ชัน POST: เพิ่มข้อมูลเครื่องดื่มใหม่
export async function POST(request) {
    try {
        const newBeverage = await request.json();

        if (!newBeverage || Object.keys(newBeverage).length === 0) {
            return new Response(JSON.stringify({ message: "Invalid beverage data" }), { status: 400 });
        }

        const docRef = await addDoc(collection(db, "beverages"), newBeverage);

        return new Response(
            JSON.stringify({ id: docRef.id, ...newBeverage }), // ส่ง ID ที่ Firestore สร้างให้
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

// PUT: อัปเดตข้อมูลเครื่องดื่ม
export async function PUT(request) {
    try {
        const updatedBeverage = await request.json();
        const { BEVID } = updatedBeverage;

        // ตรวจสอบ ID ของเครื่องดื่มว่ามีหรือไม่
        if (!BEVID) {
            return new Response(JSON.stringify({ message: "Beverage ID is required for update" }), { status: 400 });
        }

        const beverageQuery = query(collection(db, "beverages"), where("BEVID", "==", BEVID));
        const querySnapshot = await getDocs(beverageQuery);

        if (querySnapshot.empty) {
            return new Response(
                JSON.stringify({ message: "Beverage not found with the provided BEVID" }),
                { status: 404 }
            );
        }

        const beverageDoc = querySnapshot.docs[0];
        const beverageRef = doc(db, "beverages", beverageDoc.id);
        
        await updateDoc(beverageRef, updatedBeverage);
        return new Response(
            JSON.stringify({ message: "Beverage updated successfully", BEVID, ...updatedBeverage }),
            { status: 200 }
        );

    } catch (error) {
        console.log("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}

// DELETE: ลบข้อมูลเครื่องดื่ม
export async function DELETE(request) {
    try {
        const { BEVID } = await request.json();
        console.log("ID to delete:", BEVID);

        if (!BEVID) {
            return new Response(JSON.stringify({ message: "Invalid beverage ID" }), { status: 400 });
        }
        const beverageQuery = query(collection(db, "beverages"), where("BEVID", "==", BEVID));
        const querySnapshot = await getDocs(beverageQuery);

        if (querySnapshot.empty) {
            return new Response(
                JSON.stringify({ message: "Beverage not found with the provided BEVID" }),
                { status: 404 }
            );
        }
        const beverageDoc = querySnapshot.docs[0];
        const beverageRef = doc(db, "beverages", beverageDoc.id);

        await deleteDoc(beverageRef);

        return new Response(JSON.stringify({ message: "Beverage deleted successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}
