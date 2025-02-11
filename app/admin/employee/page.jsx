"use client"
import { Button, Input } from "@nextui-org/react";

import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function EmployeeList() {
    const [isModalOpen, setIsModalOpen] = useState(false); // สถานะเปิด/ปิด modal
    const [employee, setEmployee] = useState({
        name: "",
        EMPID: "",   
        idCard: "",
        phone: "",
        address: "",
        currentAddress: "",
        startDate: "",
        createdAt: null,
        updatedAt: null,
        profilePicture: "",
    });
    const [employees, setEmployees] = useState([]); // State เก็บข้อมูลพนักงานทั้งหมด

    // ฟังก์ชันเปิด modal
    const handleOpenModal = () => {
        setEmployee({
            name: "",
            EMPID: "",   
            idCard: "",
            phone: "",
            address: "",
            currentAddress: "",
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

    // ฟังก์ชันบันทึกข้อมูลพนักงาน
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // ตรวจสอบว่ามี file หรือไม่ (ถ้ามีอัพโหลด)
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
    
        // สร้างข้อมูล employee ที่จะถูกส่งไป
        const employeeData = {
            ...employee,
            profilePicture: profilePictureUrl,
            file: undefined,
        };
    
        // ถ้าไม่มี EMPID แสดงว่าเป็นการเพิ่มใหม่
        if (!employee.EMPID) {
            employeeData.createdAt = date; // ถ้าไม่มี EMPID ให้ใส่ createdAt สำหรับเพิ่มข้อมูลใหม่
    
            // ดึง max EMPID แล้ว increment
            const maxEmpId = await getMaxEmpId();
            employeeData.EMPID = maxEmpId;  // ตั้ง EMPID ใหม่
        }else{
            employeeData.updatedAt = date;
        }
    
        try {
            let response;
            
            if (employee.EMPID !== "") {
                console.log("Performing PUT for updating employee");
                response = await fetch("/api/employees", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(employeeData),
                });
            } else {
                console.log("Performing POST for adding new employee");
                response = await fetch("/api/employees", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(employeeData),
                });
            }
        
            const result = await response.json(); // response JSON
        
            if (response.ok) {
                alert(employee.EMPID ? "Employee updated successfully" : "Employee added successfully");
                fetchEmployees();
                handleCloseModal();
            } else {
             
                alert(`${result.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error saving employee:", error);
            alert("Error saving employee.");
        }
        
    };
    
    // ฟังก์ชันดึง EMPID ล่าสุด
    const getMaxEmpId = async () => {
        try {
            const response = await fetch("/api/employees");  // ใช้ API ดึงข้อมูลพนักงานทั้งหมด
            if (response.ok) {
                const employees = await response.json();
                if (employees && employees.length > 0) {
                    // หาค่า EMPID ที่สูงที่สุดและเพิ่ม 1
                    const maxEmpId = Math.max(...employees.map(emp => parseInt(emp.EMPID.replace('EMP', ''))));
                    return `EMP${maxEmpId + 1}`;
                }
            }
            return 'EMP1';  // ถ้าไม่มีพนักงานเลย ให้เริ่มจาก EMP1
        } catch (error) {
            console.error("Error fetching employees:", error);
            return console.log("Can't added Employees");  
        }
    };

    // แสดงหน้าแก้ไข
    const handleEdit = (emp) => {
        setEmployee({
            name: emp.name,
            EMPID: emp.EMPID,    
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
    };

    // ฟังก์ชันลบข้อมูลพนักงาน
    const handleDelete = async (EMPID) => { 
        const confirmDelete = window.confirm('Are you sure you want to delete this employee?');
        if (!confirmDelete) return;

        try {
            console.log('Deleting employee with EMPID:', EMPID); // ใช้ EMPID
            const response = await fetch("/api/employees", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ EMPID: EMPID }), // ส่ง EMPID สำหรับการลบ
            });

            if (response.ok) {
                alert("Delete employee successfully!");
                fetchEmployees();
            } else {
                alert("Failed to delete employee.");
            }

        } catch (error) {
            console.log("Error deleting employee", error);
            alert("Error deleting employee");
        }
    };

    // ฟังก์ชันดึงข้อมูลพนักงานทั้งหมด
    const fetchEmployees = async () => {
        try {
            const response = await fetch("/api/employees");
            if (response.ok) {
                const data = await response.json();
    
                if (data && data.length > 0) {
                    console.log("Fetched employee data:", data);
                    setEmployees(data);
                } else {
                    console.log("No employees found in the database."); // ข้อความเมื่อไม่มีข้อมูล
                    setEmployees([]); // ตั้งค่าให้เป็นอาร์เรย์ว่าง
                }
            } else {
                console.error(`Failed to fetch employees. Status: ${response.status}`);
                setEmployees([]); // ตั้งค่าเป็นอาร์เรย์ว่างในกรณีดึงข้อมูลไม่สำเร็จ
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            setEmployees([]); // ตั้งค่าให้เป็นอาร์เรย์ว่างในกรณีเกิด error
        }
    };
    
    // ดึงข้อมูลพนักงานเมื่อ component โหลดครั้งแรก
    useEffect(() => {
        fetchEmployees();
    }, []);



    return (
        <main className="p-5 flex flex-col gap-5  ">
        <div className="flex flex-col bg-white p-6 rounded-xl shadow-md w-full overflow-auto ">
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
                <h1 className="text-xl font-semibold">Employee Management</h1>
                <Button
                    className="ml-auto py-3 font-semibold flex items-center bg-indigo-600 text-white hover:bg-[#3700B3]"
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
                            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2 ml-2">
                                    Upload Employee Photo
                                </label>
                                <Input
                                    type="file"
                                    title="Select Photo"
                                    onChange={(e) =>
                                        setEmployee((prev) => ({
                                            ...prev,
                                            file: e.target.files[0],
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button onClick={handleCloseModal} auto flat color="error">
                                    Cancel
                                </Button>
                                <Button type="submit"
                                     color="primary"
                                      className=" bg-indigo-600 text-white hover:bg-[#3700B3]"
                                >
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
    <thead className="bg-indigo-300">
        <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ID</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Profile</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ID Card</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Phone</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Address</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Current Address</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Start Date</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">CreatedAt</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">UpdatedAt</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Action</th>
        </tr>
    </thead>
    <tbody className="bg-white">
    {employees.length === 0 ? (
        <tr><td colSpan="12" className="px-4 py-2 text-center text-sm text-gray-500">No data</td></tr>
    ) : (
        employees
            .sort((a, b) => {
                const empA = parseInt(a.EMPID.replace('EMP', '')); // ดึงเฉพาะตัวเลขของ EMPID
                const empB = parseInt(b.EMPID.replace('EMP', ''));
                return empA - empB; // เรียงจากน้อยไปมาก
            })
            .map((emp, index) => (
                <tr key={index}>
                    <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.EMPID}</td> 
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
                            onClick={() => handleDelete(emp.EMPID)}
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