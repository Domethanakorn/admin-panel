import { db } from "@/lib/firestore/firebase";
import { collection, getDocs, addDoc,  getDoc, query, orderBy, limit, serverTimestamp,runTransaction,doc } from "firebase/firestore";

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

        // ตรวจสอบข้อมูลว่าถูกต้องหรือไม่
        if (!orderData || !orderData.OrderItems || orderData.OrderItems.length === 0) {
            return new Response(JSON.stringify({ message: "Invalid order data" }), { status: 400 });
        }

      
        const newOrderData = await runTransaction(db, async (transaction) => {
            const orderRef = collection(db, "orders");

            const lastOrderQuery = query(orderRef, orderBy("orderNumber", "desc"), limit(1));
            const lastOrderSnapshot = await getDocs(lastOrderQuery);

            let lastOrderId = 0;
            if (!lastOrderSnapshot.empty) {
                const lastOrder = lastOrderSnapshot.docs[0].data();
                lastOrderId = lastOrder.orderNumber || 0;
            }

            const newOrderId = `ORD${lastOrderId + 1}`;

            // สร้างข้อมูลออเดอร์ใหม่
            const newOrder = {
                OrderID: newOrderId,
                orderNumber: lastOrderId + 1, 
                EMPID: orderData.EMPID,
                phoneNumber: orderData.phoneNumber,
                OrderItems: orderData.OrderItems,
                TotalPrice: orderData.TotalPrice,
                OrderDate: serverTimestamp(),
            };

         
            const newDocRef = await addDoc(orderRef, newOrder);
            return newDocRef;
        });

        return new Response(
            JSON.stringify({ message: "Order added successfully", orderID: newOrderData.id }),
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