import { db } from "@/lib/firestore/firebase";
import { collection, getDocs, addDoc,  getDoc, query, orderBy, limit, serverTimestamp,doc,where,updateDoc } from "firebase/firestore";

// 🔹 GET: ดึงรายการสั่งซื้อทั้งหมด
export async function GET() {
    try {
        const snapshot = await getDocs(collection(db, "orders"));
        const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (orders.length === 0) {
            return new Response(JSON.stringify({ message: "No orders found" }), { status: 200 });
        }

        return new Response(JSON.stringify(orders), { status: 200 });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}



// ฟังก์ชัน POST: เพิ่มข้อมูลออเดอร์ใหม่
export async function POST(request) {
    try {
        // รับข้อมูลจาก request body
        const orderData = await request.json();

        // ตรวจสอบข้อมูลหลักว่าถูกต้องหรือไม่
        if (!orderData || !orderData.OrderItems || orderData.OrderItems.length === 0) {
            return new Response(JSON.stringify({ message: "Invalid order data" }), { status: 400 });
        }

        // อ้างอิง collection orders
        const orderRef = collection(db, "orders");
        
        // หา order ล่าสุด
        const lastOrderQuery = query(orderRef, orderBy("orderNumber", "desc"), limit(1));
        const lastOrderSnapshot = await getDocs(lastOrderQuery);
        let lastOrderId = 0;
        if (!lastOrderSnapshot.empty) {
            lastOrderId = lastOrderSnapshot.docs[0].data().orderNumber || 0;
        }
        const newOrderId = `ORD${lastOrderId + 1}`;

        // คำนวณแต้มและอัพเดทสมาชิก (ไม่มีเงื่อนไขตรวจ phoneNumber)
        let pointsEarned = 0;
        let pointsUpdated = 0;

        // ถ้ามี phoneNumber ให้ลองค้นหาและอัพเดท
        if (orderData.phoneNumber) {
            pointsEarned = Math.floor(orderData.TotalPrice / 100) * 10;
            
            const memberRef = collection(db, "members");
            const memberQuery = query(memberRef, where("phoneNumber", "==", orderData.phoneNumber));
            const memberSnapshot = await getDocs(memberQuery);

            if (!memberSnapshot.empty) {
                const memberDoc = memberSnapshot.docs[0];
                const memberId = memberDoc.id;
                const currentPoints = memberDoc.data().points || 0;
                await updateDoc(doc(db, "members", memberId), {
                    points: currentPoints + pointsEarned
                });
                pointsUpdated = pointsEarned;
            } else {
                console.log(`No member found with phone number: ${orderData.phoneNumber}`);
            }
        }

        // สร้างข้อมูลออเดอร์ใหม่
        const newOrder = {
            OrderID: newOrderId,
            orderNumber: lastOrderId + 1,
            name: orderData.name || null,       
            surname: orderData.surname || null,  
            phoneNumber: orderData.phoneNumber || null,
            OrderItems: orderData.OrderItems,
            TotalPrice: orderData.TotalPrice,
            OrderDate: serverTimestamp(),
            pointsEarned: pointsUpdated
        };

        const newDocRef = await addDoc(orderRef, newOrder);

        return new Response(
            JSON.stringify({ 
                message: "Order added successfully", 
                orderID: newDocRef.id,
                pointsEarned: pointsUpdated,
                phoneNumber: orderData.phoneNumber || null
            }),
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