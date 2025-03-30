"use client";
import { Button, Input } from "@nextui-org/react";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, limit, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";

export default function BeverageList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [beverage, setBeverage] = useState({
    name: "",
    description: "",
    productId: "",
    price: "",
    imageUrl: "",
    createdAt: null,
    updatedAt: null,
  });
  const [beverages, setBeverages] = useState([]);

  const handleOpenModal = () => {
    setBeverage({
      name: "",
      description: "",
      productId: "",
      price: "",
      imageUrl: "",
      createdAt: null,
      updatedAt: null,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBeverage((prev) => ({
      ...prev,
      [name]: name === "price" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "beverage_images");
    formData.append("cloud_name", "dsbdsiefa");
    formData.append("folder", "beverages/");

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
      let imageUrl = beverage.imageUrl;

      if (beverage.file) {
        imageUrl = await uploadToCloudinary(beverage.file);
        if (!imageUrl) {
          alert("ไม่สามารถอัปโหลดรูปภาพได้");
          return;
        }
      }

      let newProductId = beverage.productId;
      let newBeverageNumber = beverage.beverageNumber ?? 0;

      let beverageRef;

      // ตรวจสอบชื่อซ้ำด้วย query (เฉพาะกรณีเพิ่มใหม่)
      if (!beverage.productId) {
        const duplicateQuery = query(
          collection(db, "beverages"),
          where("name", "==", beverage.name)
        );
        const duplicateSnapshot = await getDocs(duplicateQuery);

        if (!duplicateSnapshot.empty) {
          alert("ชื่อเครื่องดื่มนี้มีอยู่ในระบบแล้ว ไม่สามารถเพิ่มได้");
          return;
        }
      }

      if (beverage.productId) {
        const existingBeverageQuery = query(
          collection(db, "beverages"),
          where("productId", "==", beverage.productId)
        );
        const existingBeverageSnapshot = await getDocs(existingBeverageQuery);

        if (!existingBeverageSnapshot.empty) {
          const docId = existingBeverageSnapshot.docs[0].id;
          beverageRef = doc(db, "beverages", docId);

          await updateDoc(beverageRef, {
            ...beverage,
            imageUrl: imageUrl,
            updatedAt: serverTimestamp(),
          });

          alert("อัปเดตข้อมูลเครื่องดื่มเรียบร้อยแล้ว!");
        } else {
          alert("ไม่พบข้อมูลเครื่องดื่มนี้!");
          return;
        }
      } else {
        const beverageCollection = collection(db, "beverages");
        const lastBeverageQuery = query(
          beverageCollection,
          orderBy("beverageNumber", "desc"),
          limit(1)
        );
        const lastBeverageSnapshot = await getDocs(lastBeverageQuery);

        if (!lastBeverageSnapshot.empty) {
          const lastBeverage = lastBeverageSnapshot.docs[0].data();
          newBeverageNumber = lastBeverage.beverageNumber + 1;
        } else {
          newBeverageNumber = 1;
        }

        if (!newProductId) {
          newProductId = `BEV${newBeverageNumber}`;
        }

        const { file, ...beverageData } = {
          ...beverage,
          productId: newProductId,
          beverageNumber: newBeverageNumber,
          category: "beverages",
          imageUrl: imageUrl,
          createdAt: serverTimestamp(),
        };

        beverageRef = await addDoc(beverageCollection, beverageData);
        alert("เพิ่มเครื่องดื่มเรียบร้อยแล้ว!");
      }

      fetchBeverages();
      handleCloseModal();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลเครื่องดื่ม:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลเครื่องดื่ม");
    }
  };

  const handleEdit = (bev) => {
    setBeverage({
      name: bev.name,
      description: bev.description,
      productId: bev.productId,
      price: bev.price,
      imageUrl: bev.imageUrl,
      createdAt: bev.createdAt,
      updatedAt: serverTimestamp(),
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

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบเครื่องดื่มนี้?");
    if (!confirmDelete) return;

    try {
      console.log("กำลังค้นหาเอกสารด้วย beverageId:", productId);

      const beveragesRef = collection(db, "beverages");
      const q = query(beveragesRef, where("productId", "==", productId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("ไม่พบข้อมูลเครื่องดื่มนี้!");
        return;
      }

      const docID = querySnapshot.docs[0].id;
      const beverageData = querySnapshot.docs[0].data();

      if (beverageData.imageUrl) {
        const urlParts = beverageData.imageUrl.split("image/upload/");
        if (urlParts.length > 1) {
          let publicId = urlParts[1].split(".")[0];
          const versionRemoved = publicId.split("/").slice(1).join("/");

          if (versionRemoved) {
            console.log("กำลังพยายามลบรูปภาพด้วย publicId:", versionRemoved);
            await deleteImageFromCloudinary(versionRemoved);
          } else {
            console.error("ไม่พบ publicId ที่ถูกต้องหลังจากลบเวอร์ชัน:", beverageData.imageUrl);
            alert("ไม่สามารถลบรูปภาพได้: ไม่พบ publicId ที่ถูกต้อง");
            return;
          }
        } else {
          console.error("รูปแบบ URL ของรูปภาพไม่ถูกต้อง:", beverageData.imageUrl);
          alert("ไม่สามารถลบรูปภาพได้: รูปแบบ URL ไม่ถูกต้อง");
          return;
        }
      }

      await deleteDoc(doc(db, "beverages", docID));
      alert("ลบเครื่องดื่มเรียบร้อยแล้ว!");
      fetchBeverages();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบเครื่องดื่ม:", error);
      alert("เกิดข้อผิดพลาดในการลบเครื่องดื่ม: " + error.message);
    }
  };

  const fetchBeverages = async () => {
    try {
      const snapshot = await getDocs(collection(db, "beverages"));
      const beveragesData = snapshot.docs.map((doc) => {
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
      setBeverages(beveragesData);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลเครื่องดื่ม:", error);
    }
  };

  useEffect(() => {
    fetchBeverages();
  }, []);

  return (
    <main className="p-5 flex flex-col gap-5">
      <div className="flex flex-col bg-white p-6 rounded-xl shadow-md w-full overflow-auto">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl font-semibold">การจัดการเครื่องดื่ม</h1>
          <Button
            className="ml-auto py-3 font-semibold flex items-center bg-indigo-600 text-white hover:bg-[#3700B3]"
            color="primary"
            onClick={handleOpenModal}
          >
            เพิ่มเครื่องดื่ม <PlusCircle className="h-4 ml-2" />
          </Button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96">
              <h2 className="text-xl font-semibold mb-4">เพิ่มเครื่องดื่มใหม่</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Input
                    name="name"
                    value={beverage.name}
                    onChange={handleInputChange}
                    label="ชื่อ"
                    fullWidth
                    required
                  />
                </div>
                <div className="mb-4">
                  <Input
                    name="price"
                    value={beverage.price}
                    onChange={handleInputChange}
                    label="ราคา"
                    type="number"
                    fullWidth
                    required
                  />
                </div>
                <div className="mb-4">
                  <Input
                    name="description"
                    value={beverage.description}
                    onChange={handleInputChange}
                    label="คำอธิบาย"
                    fullWidth
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2 ml-2">
                    อัปโหลดรูปภาพเครื่องดื่ม
                  </label>
                  <Input
                    type="file"
                    title="เลือกภาพ"
                    onChange={(e) =>
                      setBeverage((prev) => ({
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
        <div className="overflow-y-auto max-h-[680px]">
          <table className="min-w-full table-fixed border-collapse border border-gray-300 rounded-lg shadow-sm">
            <thead className="bg-indigo-300">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">รหัสสินค้า</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">รูปภาพ</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ชื่อ</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">หมวดหมู่</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ราคา</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">คำอธิบาย</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">วันที่สร้าง</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">วันที่อัปเดต</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {beverages.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-2 text-center text-sm text-gray-500">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                beverages
                  .sort((a, b) => {
                    const productIdA = parseInt(a.productId.replace("BEV", ""));
                    const productIdB = parseInt(b.productId.replace("BEV", ""));
                    return productIdA - productIdB;
                  })
                  .map((beverage, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{beverage.productId}</td>
                      <td className="px-4 py-2 border border-gray-300">
                        <img
                          src={beverage.imageUrl}
                          alt="เครื่องดื่ม"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{beverage.name}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{beverage.category}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{beverage.price}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{beverage.description}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">
                        {new Date(beverage.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">
                        {beverage.updatedAt ? new Date(beverage.updatedAt).toLocaleString("th-TH") : ""}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm">
                        <button
                          className="text-blue-500 hover:underline mr-2"
                          onClick={() => handleEdit(beverage)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => handleDelete(beverage.productId)}
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
      </div>
    </main>
  );
}