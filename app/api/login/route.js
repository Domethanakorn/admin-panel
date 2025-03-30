import { db } from "@/lib/firestore/firebase";
import { collection, query,where,getDocs } from "firebase/firestore";

export async function POST(request){
    const { username, password } = await request.json();

    try{
        
        const q = query(collection(db, 'employees'),where('EMPID','==',username));
         const  employeeSnapshot =  await getDocs(q);

         if(employeeSnapshot.empty){
            //ถ้าไม่พบผู้ใช้
            return new Response(JSON.stringify({message: "User not found"}), {status: 401});
         }
          // ดึงข้อมูลของผู้ใช้จาก snapshot
         const userDoc = employeeSnapshot.docs[0];
         const userData = userDoc.data();

         if (userData.password !== password){
            return new Response(JSON.stringify({message: "Invalid password"}), {status: 404});
            
         }
            return new Response(
               JSON.stringify({
                  message: "Login successful",
                  name: userData.name || "Unknown",
                  surname: userData.surname || "Unknown",
                  EMPID: userData.EMPID
               }),
               { status: 200 }
            );

    }catch(error){
            console.log("Error:",error);
          
            return new Response(JSON.stringify({messeage: "Error during login"}), {status: 500})

    }
}