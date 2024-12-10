import { db } from "@/lib/firestore/firebase"; 
import { collection, getDocs, addDoc, doc, deleteDoc,setDoc,updateDoc } from "firebase/firestore";

// ฟังก์ชัน GET: ดึงข้อมูลเครื่องดื่มทั้งหมด
export async function GET() {
    try {
        const snapshot = await getDocs(collection(db, "beverages"));
        const beverages = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (beverages.length === 0) {
            return new Response(JSON.stringify({ message: "No beverages found" }), { status: 401 });
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

       
        const docRef = doc(collection(db, "beverages"), newBeverage.id);

        await setDoc(docRef,  newBeverage);

        return new Response(
            JSON.stringify({ id: docRef.id, ... newBeverage }), 
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
        const updatedBeverage = await request.json();
        const { id } = updatedBeverage;
       

        //ตรวจสอบ ID ของขนมว่ามีหรือไม่
        if(!id){
            return new Response(JSON.stringify({message: "Beverage ID is required for update"}), {status: 400})
        }

        const beverageRef = doc(db, "beverages", id);
            console.log("Beverage:",beverageRef);
        await updateDoc(beverageRef, updatedBeverage);


        return new Response(
            JSON.stringify({message: "Beverage updated successfully", id, ...updatedBeverage}),
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
            return new Response(JSON.stringify({ message: "Invalid beverage ID" }), { status: 400 });
        }

        const beverageRef = doc(db, "beverages", id);
        console.log(beverageRef);
        await deleteDoc(beverageRef);
        
        console.log(`Document with ID ${id} deleted successfully`);
        
        return new Response(JSON.stringify({ message: "Beverage deleted successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}