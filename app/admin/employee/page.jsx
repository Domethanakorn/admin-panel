"use client";
import { Button, Input } from "@nextui-org/react";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firestore/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, limit, serverTimestamp, where } from "firebase/firestore";

export default function EmployeeList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employee, setEmployee] = useState({
    name: "",
    surname: "",
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
  const [employees, setEmployees] = useState([]);

  const handleOpenModal = () => {
    setEmployee({
      name: "",
      surname: "",
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "employee_images");
    formData.append("cloud_name", "dsbdsiefa");
    formData.append("folder", "employees/");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dsbdsiefa/image/upload",
        { method: "POST", body: formData }
      );

      if (response.ok) {
        const data = await response.json();
        return data.secure_url;
      } else {
        console.error("ไม่สามารถอัปโหลดรูปภาพได้");
        return null;
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let profilePicture = employee.profilePicture;

      if (employee.file) {
        profilePicture = await uploadToCloudinary(employee.file);
        if (!profilePicture) {
          alert("ไม่สามารถอัปโหลดรูปภาพได้");
          return;
        }
      }

      let newEmployeeId = employee.EMPID;
      let newEmployeeNumber = employee.employeeNumber ?? 0;

      let employeeRef;

      // ตรวจสอบชื่อและนามสกุลซ้ำ (เฉพาะกรณีเพิ่มใหม่)
      if (!employee.EMPID) {
        const duplicateQuery = query(
          collection(db, "employees"),
          where("name", "==", employee.name),
          where("surname", "==", employee.surname)
        );
        const duplicateSnapshot = await getDocs(duplicateQuery);

        if (!duplicateSnapshot.empty) {
          alert("ชื่อและนามสกุลนี้มีอยู่ในระบบแล้ว ไม่สามารถเพิ่มได้");
          return;
        }
      }

      if (employee.EMPID) {
        const existingEmployeeQuery = query(
          collection(db, "employees"),
          where("EMPID", "==", employee.EMPID)
        );
        const existingEmployeeSnapshot = await getDocs(existingEmployeeQuery);

        if (!existingEmployeeSnapshot.empty) {
          const docId = existingEmployeeSnapshot.docs[0].id;
          employeeRef = doc(db, "employees", docId);

          await updateDoc(employeeRef, {
            ...employee,
            profilePicture: profilePicture,
            updatedAt: serverTimestamp(),
          });

          alert("อัปเดตข้อมูลพนักงานเรียบร้อยแล้ว!");
        } else {
          alert("ไม่พบข้อมูลพนักงานนี้!");
          return;
        }
      } else {
        const employeeCollection = collection(db, "employees");
        const lastEmployeeQuery = query(
          employeeCollection,
          orderBy("employeeNumber", "desc"),
          limit(1)
        );
        const lastEmployeeSnapshot = await getDocs(lastEmployeeQuery);

        if (!lastEmployeeSnapshot.empty) {
          const lastEmployee = lastEmployeeSnapshot.docs[0].data();
          newEmployeeNumber = lastEmployee.employeeNumber + 1;
        } else {
          newEmployeeNumber = 1;
        }

        if (!newEmployeeId) {
          newEmployeeId = `EMP${newEmployeeNumber}`;
        }

        const { file, ...employeeData } = {
          ...employee,
          EMPID: newEmployeeId,
          employeeNumber: newEmployeeNumber,
          profilePicture: profilePicture,
          createdAt: serverTimestamp(),
        };

        employeeRef = await addDoc(employeeCollection, employeeData);
        alert("เพิ่มพนักงานเรียบร้อยแล้ว!");
      }

      fetchEmployees();
      handleCloseModal();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลพนักงาน:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลพนักงาน");
    }
  };

  const handleEdit = (emp) => {
    setEmployee({
      name: emp.name,
      surname: emp.surname,
      EMPID: emp.EMPID,
      idCard: emp.idCard,
      phone: emp.phone,
      address: emp.address,
      currentAddress: emp.currentAddress,
      startDate: emp.startDate,
      createdAt: emp.createdAt,
      updatedAt: serverTimestamp(),
      profilePicture: emp.profilePicture,
    });
    setIsModalOpen(true);
  };

  const deleteImageFromCloudinary = async (publicId) => {
    try {
      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("ลบรูปภาพเรียบร้อยแล้ว:", data.message);
      } else {
        console.error("ไม่สามารถลบรูปภาพจาก Cloudinary ได้:", data.error || data);
        alert("ไม่สามารถลบรูปภาพจาก Cloudinary ได้");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบรูปภาพจาก Cloudinary:", error);
      alert("เกิดข้อผิดพลาดในการลบรูปภาพจาก Cloudinary");
    }
  };

  const handleDelete = async (employeeId) => {
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานนี้?");
    if (!confirmDelete) return;

    try {
      console.log("กำลังค้นหาเอกสารด้วย employeeId:", employeeId);

      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, where("EMPID", "==", employeeId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("ไม่พบข้อมูลพนักงานนี้!");
        return;
      }

      const docID = querySnapshot.docs[0].id;
      const employeeData = querySnapshot.docs[0].data();

      if (employeeData.profilePicture) {
        const urlParts = employeeData.profilePicture.split("image/upload/");
        if (urlParts.length > 1) {
          let publicId = urlParts[1].split(".")[0];
          const versionRemoved = publicId.split("/").slice(1).join("/");

          if (versionRemoved) {
            console.log("กำลังพยายามลบรูปภาพด้วย publicId:", versionRemoved);
            await deleteImageFromCloudinary(versionRemoved);
          } else {
            console.error("ไม่พบ publicId ที่ถูกต้องหลังจากลบเวอร์ชัน:", employeeData.profilePicture);
            alert("ไม่สามารถลบรูปภาพได้: ไม่พบ publicId ที่ถูกต้อง");
            return;
          }
        } else {
          console.error("รูปแบบ URL ของรูปภาพไม่ถูกต้อง:", employeeData.profilePicture);
          alert("ไม่สามารถลบรูปภาพได้: รูปแบบ URL ไม่ถูกต้อง");
          return;
        }
      }

      await deleteDoc(doc(db, "employees", docID));
      alert("ลบพนักงานเรียบร้อยแล้ว!");
      fetchEmployees();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบพนักงาน:", error);
      alert("เกิดข้อผิดพลาดในการลบพนักงาน: " + error.message);
    }
  };

  const fetchEmployees = async () => {
    try {
      const snapshot = await getDocs(collection(db, "employees"));
      const employeesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate() || null;
        const updatedAt = data.updatedAt?.toDate() || null;

        return {
          id: doc.id,
          ...data,
          createdAt: createdAt,
          updatedAt: updatedAt,
        };
      });
      setEmployees(employeesData);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <main className="p-5 flex flex-col gap-5">
      <div className="flex flex-col bg-white p-6 rounded-xl shadow-md w-full overflow-auto">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl font-semibold">การจัดการพนักงาน</h1>
          <Button
            className="ml-auto py-3 font-semibold flex items-center bg-indigo-600 text-white hover:bg-[#3700B3]"
            color="primary"
            onClick={handleOpenModal}
          >
            เพิ่มพนักงาน <PlusCircle className="h-4 ml-2" />
          </Button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96">
              <h2 className="text-xl font-semibold mb-4">เพิ่มพนักงานใหม่</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Input
                    name="name"
                    value={employee.name}
                    onChange={handleInputChange}
                    label="ชื่อ (*กรุณาใส่คำนำหน้าชื่อ นาย-นางสาว)"
                    fullWidth
                    required
                  />
                </div>
                <div className="mb-4">
                  <Input
                    name="surname"
                    value={employee.surname}
                    onChange={handleInputChange}
                    label="นามสกุล"
                    fullWidth
                    required
                  />
                </div>
                <div className="mb-4">
                  <Input
                    name="idCard"
                    value={employee.idCard}
                    onChange={handleInputChange}
                    label="เลขบัตรประชาชน"
                    maxLength={13}
                    fullWidth
                    required
                  />
                </div>
                <div className="mb-4">
                  <Input
                    name="phone"
                    value={employee.phone}
                    onChange={handleInputChange}
                    label="เบอร์โทรศัพท์"
                    maxLength={10}
                    fullWidth
                    required
                  />
                </div>
                <div className="mb-4">
                  <Input
                    name="address"
                    value={employee.address}
                    onChange={handleInputChange}
                    label="ที่อยู่ตามบัตรประชาชน"
                    fullWidth
                    required
                  />
                </div>
                <div className="mb-4">
                  <Input
                    name="currentAddress"
                    value={employee.currentAddress}
                    onChange={handleInputChange}
                    label="ที่อยู่ปัจจุบัน"
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
                    label="วันที่เริ่มงาน"
                    fullWidth
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2 ml-2">
                    อัปโหลดรูปภาพพนักงาน
                  </label>
                  <Input
                    type="file"
                    title="เลือกภาพ"
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
                    ยกเลิก
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    className="bg-indigo-600 text-white hover:bg-[#3700B3]"
                  >
                    บันทึก
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="overflow-x-auto max-w-full">
          <table className="min-w-full table-fixed border-collapse border border-gray-300 rounded-lg shadow-sm">
            <thead className="bg-indigo-300">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">รหัสพนักงาน</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">รูปภาพ</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ชื่อ</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">นามสกุล</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">เลขบัตรประชาชน</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">เบอร์โทรศัพท์</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ที่อยู่ตามบัตรประชาชน</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ที่อยู่ปัจจุบัน</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">วันที่เริ่มงาน</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">วันที่สร้าง</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">วันที่อัปเดต</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-2 text-center text-sm text-gray-500">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                employees
                  .sort((a, b) => {
                    const empA = parseInt(a.EMPID.replace("EMP", ""));
                    const empB = parseInt(b.EMPID.replace("EMP", ""));
                    return empA - empB;
                  })
                  .map((emp, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.EMPID}</td>
                      <td className="px-4 py-2 border border-gray-300">
                        <img
                          src={emp.profilePicture}
                          alt="พนักงาน"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.name}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.surname}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.idCard}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.phone}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.address}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.currentAddress}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{emp.startDate}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">
                        {new Date(emp.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">
                        {emp.updatedAt ? new Date(emp.updatedAt).toLocaleString("th-TH") : ""}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm">
                        <button
                          className="text-blue-500 hover:underline mr-2"
                          onClick={() => handleEdit(emp)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => handleDelete(emp.EMPID)}
                        >
                          ลบ
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