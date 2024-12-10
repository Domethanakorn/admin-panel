import { db } from "@/lib/firestore/firebase"; 
import { collection, getDocs, addDoc, doc, deleteDoc,setDoc,updateDoc } from "firebase/firestore";

// ฟังก์ชัน GET: ดึงข้อมูลพนักงานทั้งหมด
export async function GET() {
    try {
        const snapshot = await getDocs(collection(db, "employees"));
        const employees = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (employees.length === 0) {
            return new Response(JSON.stringify({ message: "No employees found" }), { status: 401 });
        }

        return new Response(JSON.stringify(employees), { status: 200 });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}

// ฟังก์ชัน POST: เพิ่มข้อมูลพนักงานใหม่
export async function POST(request) {
    try {
        const newEmployee = await request.json();

        if (!newEmployee || Object.keys(newEmployee).length === 0) {
            return new Response(JSON.stringify({ message: "Invalid employee data" }), { status: 400 });
        }

        // ใช้ addDoc เพื่อให้ Firestore สร้าง ID ให้เอง
        const docRef = doc(collection(db, "employees"), newEmployee.id);

        await setDoc(docRef, newEmployee);

        return new Response(
            JSON.stringify({ id: docRef.id, ...newEmployee }), // ส่ง ID ที่ Firestore สร้างให้
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
        const updatedEmployee = await request.json();
        const { id } = updatedEmployee;
       

        //ตรวจสอบ ID ของพนักงานว่ามีหรือไม่
        if(!id){
            return new Response(JSON.stringify({message: "Employee ID is required for update"}), {status: 400})
        }

        const employeeRef = doc(db, "employees", id);
            console.log("Employee:",employeeRef);
        await updateDoc(employeeRef, updatedEmployee);


        return new Response(
            JSON.stringify({message: "Employee updated successfully", id, ...updatedEmployee}),
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
            return new Response(JSON.stringify({ message: "Invalid employee ID" }), { status: 400 });
        }

        const employeeRef = doc(db, "employees", id);
        console.log(employeeRef);
        await deleteDoc(employeeRef);
        
        console.log(`Document with ID ${id} deleted successfully`);
        
        return new Response(JSON.stringify({ message: "Employee deleted successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}