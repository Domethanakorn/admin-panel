import { db } from "@/lib/firestore/firebase"; 
import { collection, getDocs,getDoc, addDoc, doc, deleteDoc,query,where,updateDoc,serverTimestamp,orderBy,limit } from "firebase/firestore";

// ฟังก์ชัน GET: ดึงข้อมูลพนักงานทั้งหมด
export async function GET() {
    try {
        const snapshot = await getDocs(collection(db, "employees"));
        const employees = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (employees.length === 0) {
            return new Response(JSON.stringify({ message: "No employees found" }), { status: 200 });
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

        if (!newEmployee.idCard) {
            return new Response(JSON.stringify({ message: "ID card number is required" }), { status: 400 });
        }

        // เช็คว่ามีหมายเลขบัตรประชาชนนี้อยู่ใน Firestore แล้วหรือไม่
        const employeeQuery = query(
            collection(db, "employees"),
            where("idCard", "==", newEmployee.idCard)
        );
        const existingEmployeeSnapshot = await getDocs(employeeQuery);

        if (!existingEmployeeSnapshot.empty) {
            return new Response(JSON.stringify({ message: "Employee with this ID card number already exists" }), { status: 400 });
        }

        // ค้นหา EMPID ล่าสุด
        const lastEmployeeQuery = query(collection(db, "employees"), orderBy("EMPID", "desc"), limit(1));
        const lastEmployeeSnapshot = await getDocs(lastEmployeeQuery);
        
        let newEMPID = "EMP1"; // กำหนดค่าเริ่มต้นให้ EMPID เป็น EMP1 ถ้าไม่มีพนักงานในระบบ

        if (!lastEmployeeSnapshot.empty) {
            const lastEmployeeData = lastEmployeeSnapshot.docs[0].data();
            const lastEMPID = lastEmployeeData.EMPID; // ค่าล่าสุดของ EMPID
            const lastEMPIDNumber = parseInt(lastEMPID.replace("EMP", ""), 10); // แปลง EMPID เป็นตัวเลข
            newEMPID = `EMP${lastEMPIDNumber + 1}`; // เพิ่ม 1 ให้ EMPID
        }

        // เพิ่มข้อมูลพนักงานใหม่โดยใช้ addDoc
        const docRef = await addDoc(collection(db, "employees"), {
            ...newEmployee,
            createdAt: serverTimestamp(),
            EMPID: newEMPID, // เพิ่ม EMPID ที่คำนวณได้
        });

        return new Response(
            JSON.stringify({ id: docRef.id, EMPID: newEMPID, ...newEmployee }),
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
export async function PUT(request) {
    try {
        const updatedEmployee = await request.json();
        const { EMPID } = updatedEmployee;

        // ตรวจสอบว่า EMPID มีค่าอยู่หรือไม่
        if (!EMPID) {
            return new Response(
                JSON.stringify({ message: "Employee EMPID is required for update" }),
                { status: 400 }
            );
        }

        // สร้าง query เพื่อค้นหาพนักงานที่มี EMPID ตรงกับที่ได้รับมา
        const employeeQuery = query(collection(db, "employees"), where("EMPID", "==", EMPID));
        const querySnapshot = await getDocs(employeeQuery);

        // ตรวจสอบว่าพบเอกสารหรือไม่
        if (querySnapshot.empty) {
            return new Response(
                JSON.stringify({ message: "Employee not found with the provided EMPID" }),
                { status: 404 }
            );
        }

        // ดึงข้อมูลเอกสารที่พบจาก query
        const employeeDoc = querySnapshot.docs[0];  // เอาเอกสารแรกที่พบ
        const employeeRef = doc(db, "employees", employeeDoc.id); // ใช้ document ID เพื่ออัปเดต

        // อัปเดตข้อมูลในเอกสาร
        await updateDoc(employeeRef, updatedEmployee);

        return new Response(
            JSON.stringify({ message: "Employee updated successfully", EMPID, ...updatedEmployee }),
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



// DELETE
export async function DELETE(request) {
    try {
        const { EMPID } = await request.json();
        console.log("EMPID to delete:", EMPID);
     
        if (!EMPID) {
            return new Response(JSON.stringify({ message: "Invalid employee EMPID" }), { status: 400 });
        }

        // สร้าง query เพื่อค้นหาพนักงานที่มี EMPID ตรงกับที่ได้รับมา
        const employeeQuery = query(collection(db, "employees"), where("EMPID", "==", EMPID));
        const querySnapshot = await getDocs(employeeQuery);
        
        // ตรวจสอบว่าพบเอกสารหรือไม่
        if (querySnapshot.empty) {
            return new Response(
                JSON.stringify({ message: "Employee not found with the provided EMPID" }),
                { status: 404 }
            );
        }

        // ดึงข้อมูลเอกสารที่พบจาก query
        const employeeDoc = querySnapshot.docs[0];  // เอาเอกสารแรกที่พบ
        const employeeRef = doc(db, "employees", employeeDoc.id); // ใช้ document ID เพื่อทำการลบ

        // ลบเอกสาร
        await deleteDoc(employeeRef);
        
        console.log(`Document with ID ${employeeDoc.id} deleted successfully`);
        
        return new Response(JSON.stringify({ message: "Employee deleted successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error:", error.message);
        return new Response(
            JSON.stringify({ message: "Internal Server Error", error: error.message }),
            { status: 500 }
        );
    }
}
