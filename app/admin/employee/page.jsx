"use client"
import { Button, Input } from "@nextui-org/react";

import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function EmployeeList() {
    const [isModalOpen, setIsModalOpen] = useState(false); // สถานะเปิด/ปิด modal
    const [employee, setEmployee] = useState({
        id: "",
        name: "",
        idCard: "",
        phone: "",
        address: "",
        currentAddress: "",
        password: "",
        startDate: "",
        createdAt: null,
        updatedAt: null,
        profilePicture: "",
    });
    const [employees, setEmployees] = useState([]); // State เก็บข้อมูลพนักงานทั้งหมด

    // ฟังก์ชันเปิด modal
    const handleOpenModal = () => {
        setEmployee({
            id: "",
            name: "",
            idCard: "",
            phone: "",
            address: "",
            currentAddress: "",
            password: "",
            startDate: "",
            createdAt: null,
            updatedAt: null,
            profilePicture: "",
        });
        setIsModalOpen(true);
    };

    // ฟังก์ชันปิด modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // ฟังก์ชันจัดการการเปลี่ยนแปลงใน input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmployee((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ฟังก์ชันอัปโหลดรูปภาพไปยัง Cloudinary
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "employee_images"); // Replace with your preset
        formData.append("cloud_name", "dsbdsiefa"); // Replace with your cloud name
        formData.append("folder", "employees/");
        try {
            const response = await fetch(
                "https://api.cloudinary.com/v1_1/dsbdsiefa/image/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (response.ok) {
                const data = await response.json();
                return data.secure_url; // URL ของรูปภาพ
            } else {
                console.error("Failed to upload image.");
                return null;
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            return null;
        }
    };
    const generateEmployeeId = () => {
        const randomId = Math.floor(Math.random() * 90000) + 1000; // สุ่มเลข 5 หลักจาก 1000 ถึง 9999
        return `EMP${randomId}`;
    };

    const generatePassword = () => {
         const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
         let password = "";
         for(let i = 0; i < 8; i++){
            password += characters.charAt(Math.floor(Math.random() * characters.length));
         }
         return password
    }

    // ฟังก์ชันบันทึกข้อมูลพนักงาน
    const handleSubmit = async (e) => {
        e.preventDefault();
        const employeeId = generateEmployeeId();
        const password =  employee.id ? employee.password :  generatePassword();
        console.log(employeeId);
        // อัปโหลดรูปภาพก่อน
        let profilePictureUrl = employee.profilePicture;
        if (employee.file) {
            profilePictureUrl = await uploadToCloudinary(employee.file);
            if (!profilePictureUrl) {
                alert("Failed to upload image.");
                return;
            }
        }
        const date = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Bangkok",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });

        const employeeData = {
             ...employee,
             id: employee.id || employeeId,
             password: password,
             profilePicture: profilePictureUrl ,
             createdAt: employee.id ? employee.createdAt : date,
             updatedAt: employee.id ? date : null,
             file: undefined 
            };

        try {
                let response;
                    console.log(employee.id)
            if(employee.id){
                    response = await fetch("/api/employees/",{
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(employeeData),
                    });
            }else{
                 response = await fetch("/api/employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(employeeData),
            });
        }
            if (response.ok) {
                alert(employee.id ? "Employee updated successfully!": "Employee added successfully!");
                handleCloseModal();
                fetchEmployees(); // ดึงข้อมูลใหม่หลังเพิ่ม
            } else {
                alert("Failed to save employee.");
            }
        
        } catch (error) {
            console.error("Error saving employee:", error);
            alert("Error saving employee.");
        }
    };

  //เเสดงหน้าเเก้ไข
    const handleEdit = (emp) =>{
        setEmployee({
            id: emp.id,
            name: emp.name,
            idCard: emp.idCard,
            phone: emp.phone,
            address: emp.address,
            currentAddress: emp.currentAddress,
            startDate: emp.startDate,
            createdAt: emp.createdAt,
            updatedAt: emp.updatedAt,
            profilePicture: emp.profilePicture,
            file: null,
        });
        setIsModalOpen(true);
    }

    // ฟังก์ชันลบข้อมูลพนักงาน
    const handleDelete = async (id) =>{
        const confirmDelete = window.confirm('Are you want to delete employee?');
        if(!confirmDelete) return;
       

        try{
            console.log('Deleting employee with ID:', id); 
            const response = await fetch("/api/employees", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: id }),
                
            })
           
            if(response.ok){
                alert("Delete employee successfully!");
                fetchEmployees();
            }else{
                alert("Falied to delete employee.")
            }

        }catch(error){
                console.log("Error saving employee ",error);
                alert("Error saving employee");
        }
    }




    // ฟังก์ชันดึงข้อมูลพนักงานทั้งหมด
    const fetchEmployees = async () => {
        try {
            const response = await fetch("/api/employees");
            if (response.ok) {
                const data = await response.json();

                if (data && data.length > 0){
                    console.log("Fetched employee data:", data); 
                    setEmployees(data);
                }else{
                    console.log("No data found");
                 
                }
               
            } else {
                console.error("Failed to fetch employee.");
                setDesserts([]);
                
            }
        } catch (error) {
            console.error("Error fetching desserts:", error);
        }
    };

    // ดึงข้อมูลพนักงานเมื่อ component โหลดครั้งแรก
    useEffect(() => {
        fetchEmployees();
    }, []);



    return (
        <main className="p-5 flex flex-col gap-5 ">
        <div className="flex flex-col bg-white p-6 rounded-xl shadow-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
                <h1 className="text-xl font-semibold">Employee Management</h1>
                <Button
                    className="ml-auto py-3 font-semibold flex items-center"
                    color="primary"
                    onClick={handleOpenModal}
                >
                    Add Employee <PlusCircle className="h-4 ml-2" />
                </Button>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl  w-96">
                        <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <Input
                                    name="name"
                                    value={employee.name}
                                    onChange={handleInputChange}
                                    label="Name"
                                    fullWidth
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    name="idCard"
                                    value={employee.idCard}
                                    onChange={handleInputChange}
                                    label="ID Card"
                                    fullWidth
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    name="phone"
                                    value={employee.phone}
                                    onChange={handleInputChange}
                                    label="Phone"
                                    fullWidth
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    name="address"
                                    value={employee.address}
                                    onChange={handleInputChange}
                                    label="Address"
                                    fullWidth
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    name="currentAddress"
                                    value={employee.currentAddress}
                                    onChange={handleInputChange}
                                    label="Current Address"
                                    fullWidth
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    name="startDate"
                                    type="date"
                                    value={employee.startDate}
                                    onChange={handleInputChange}
                                    label="Start Date"
                                    fullWidth
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    type="file"
                                    onChange={(e) =>
                                        setEmployee((prev) => ({
                                            ...prev,
                                            file: e.target.files[0],
                                        }))
                                    }
                                    label=""
                                    fullWidth
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button onClick={handleCloseModal} auto flat color="error">
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary">
                                    Save
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

       {/* Employee Table */}
       <div className="overflow-x-auto max-w-full ">
       <table className="min-w-full table-fixed border-collapse border border-gray-300 rounded-lg shadow-sm">
    <thead className="bg-gray-200">
        <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ID</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Profile</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ID Card</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Phone</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Address</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Current Address</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Password</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Start Date</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">CreatedAt</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">UpdatedAt</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Action</th>
        </tr>
    </thead>
    <tbody className="bg-white">
        {employees.length === 0 ? (
            <tr>
                <td colSpan="12" className="px-4 py-2 text-center text-sm text-gray-500">No data</td>
            </tr>
        ) : (
            employees.map((emp, index) => (
                <tr key={index}>
                    <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.id}</td>
                    <td className="px-4 py-2 border border-gray-300">
                        <img
                            src={emp.profilePicture}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    </td>
                    <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.name}</td>
                    <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.idCard}</td>
                    <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.phone}</td>
                    <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.address}</td>
                    <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.currentAddress}</td>
                    <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.password}</td>
                    <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.startDate}</td>
                    <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.createdAt}</td>
                    <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.updatedAt}</td>
                    <td className="px-4 py-2 border border-gray-300 text-sm">
                        <button
                            className="text-blue-500 hover:underline mr-2"
                            onClick={() => handleEdit(emp)}
                        >
                            Edit
                        </button>
                        <button
                            className="text-red-500 hover:underline"
                            onClick={() => handleDelete(emp.id)}
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            ))
        )}
    </tbody>
</table>

</div>

</div>
 </main>
    );
}