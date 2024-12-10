import { db } from "@/lib/firestore/firebase"; 
import { collection, getDocs, addDoc, doc, deleteDoc,setDoc,updateDoc } from "firebase/firestore";

// ฟังก์ชัน GET: ดึงข้อมูลขนมทั้งหมด
export async function GET() {
    try {
        const snapshot = await getDocs(collection(db, "desserts"));
        const desserts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (desserts.length === 0) {
            return new Response(JSON.stringify({ message: "No desserts found" }), { status: 401 });
        }

        return new Response(JSON.stringify(desserts), { status: 200 });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}

// ฟังก์ชัน POST: เพิ่มข้อมูลขนมใหม่
export async function POST(request) {
    try {
        const newDessert = await request.json();

        if (!newDessert || Object.keys(newDessert).length === 0) {
            return new Response(JSON.stringify({ message: "Invalid dessert data" }), { status: 400 });
        }

       
        const docRef = doc(collection(db, "desserts"), newDessert.id);

        await setDoc(docRef,  newDessert);

        return new Response(
            JSON.stringify({ id: docRef.id, ... newDessert }), // ส่ง ID ที่ Firestore สร้างให้
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
// PUT
export async function  PUT(request) {
    try{
        const updatedDessert = await request.json();
        const { id } = updatedDessert;
       

        //ตรวจสอบ ID ของขนมว่ามีหรือไม่
        if(!id){
            return new Response(JSON.stringify({message: "Dessert ID is required for update"}), {status: 400})
        }

        const dessertRef = doc(db, "desserts", id);
            console.log("Dessert:",dessertRef);
        await updateDoc(dessertRef, updatedDessert);


        return new Response(
            JSON.stringify({message: "Dessert updated successfully", id, ...updatedDessert}),
            { status: 200 }
        );

    }catch (error){
        console.log("Error:",error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message}),
            { status: 500 }
        );

    }
}




// DELETE
export async function DELETE(request) {
    try {
        const { id } = await request.json();
        console.log("ID to delete:", id);
     
        if (!id) {
            return new Response(JSON.stringify({ message: "Invalid dessert ID" }), { status: 400 });
        }

        const dessertRef = doc(db, "desserts", id);
        console.log(dessertRef);
        await deleteDoc(dessertRef);
        
        console.log(`Document with ID ${id} deleted successfully`);
        
        return new Response(JSON.stringify({ message: "Dessert deleted successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}