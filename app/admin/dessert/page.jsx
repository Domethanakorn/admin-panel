"use client";
import { Button, Input } from "@nextui-org/react";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, limit, serverTimestamp, where, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firestore/firebase";

export default function DessertList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dessert, setDessert] = useState({
    name: "",
    description: "",
    productId: "",
    price: "",
    imageUrl: "",
    createdAt: null,
    updatedAt: null,
  });
  const [desserts, setDesserts] = useState([]);

  const handleOpenModal = () => {
    setDessert({
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
    setDessert((prev) => ({
      ...prev,
      [name]: name === "price" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "dessert_images");
    formData.append("cloud_name", "dsbdsiefa");
    formData.append("folder", "desserts/");

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
      let imageUrl = dessert.imageUrl;

      if (dessert.file) {
        imageUrl = await uploadToCloudinary(dessert.file);
        if (!imageUrl) {
          alert("ไม่สามารถอัปโหลดรูปภาพได้");
          return;
        }
      }

      let newProductId = dessert.productId;
      let newDessertNumber = dessert.dessertNumber ?? 0;

      let dessertRef;

      // ตรวจสอบชื่อซ้ำด้วย query (เฉพาะกรณีเพิ่มใหม่)
      if (!dessert.productId) {
        const duplicateQuery = query(
          collection(db, "desserts"),
          where("name", "==", dessert.name)
        );
        const duplicateSnapshot = await getDocs(duplicateQuery);

        if (!duplicateSnapshot.empty) {
          alert("ชื่อของหวานนี้มีอยู่ในระบบแล้ว ไม่สามารถเพิ่มได้");
          return;
        }
      }

      if (dessert.productId) {
        const existingDessertQuery = query(
          collection(db, "desserts"),
          where("productId", "==", dessert.productId)
        );
        const existingDessertSnapshot = await getDocs(existingDessertQuery);

        if (!existingDessertSnapshot.empty) {
          const docId = existingDessertSnapshot.docs[0].id;
          dessertRef = doc(db, "desserts", docId);

          await updateDoc(dessertRef, {
            ...dessert,
            imageUrl: imageUrl,
            updatedAt: serverTimestamp(),
          });

          alert("อัปเดตข้อมูลของหวานเรียบร้อยแล้ว!");
        } else {
          alert("ไม่พบข้อมูลของหวานนี้!");
          return;
        }
      } else {
        const dessertCollection = collection(db, "desserts");
        const lastDessertQuery = query(
          dessertCollection,
          orderBy("dessertNumber", "desc"),
          limit(1)
        );
        const lastDessertSnapshot = await getDocs(lastDessertQuery);

        if (!lastDessertSnapshot.empty) {
          const lastDessert = lastDessertSnapshot.docs[0].data();
          newDessertNumber = lastDessert.dessertNumber + 1;
        } else {
          newDessertNumber = 1;
        }

        if (!newProductId) {
          newProductId = `DES${newDessertNumber}`;
        }

        const { file, ...dessertData } = {
          ...dessert,
          productId: newProductId,
          dessertNumber: newDessertNumber,
          category: "desserts",
          imageUrl: imageUrl,
          createdAt: serverTimestamp(),
        };

        dessertRef = await addDoc(dessertCollection, dessertData);
        alert("เพิ่มของหวานเรียบร้อยแล้ว!");
      }

      fetchDesserts();
      handleCloseModal();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลของหวาน:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลของหวาน");
    }
  };

  const handleEdit = (dess) => {
    setDessert({
      name: dess.name,
      description: dess.description,
      productId: dess.productId,
      price: dess.price,
      imageUrl: dess.imageUrl,
      createdAt: dess.createdAt,
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
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบของหวานนี้?");
    if (!confirmDelete) return;

    try {
      console.log("กำลังค้นหาเอกสารด้วย dessertId:", productId);

      const dessertsRef = collection(db, "desserts");
      const q = query(dessertsRef, where("productId", "==", productId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("ไม่พบข้อมูลของหวานนี้!");
        return;
      }

      const docID = querySnapshot.docs[0].id;
      const dessertData = querySnapshot.docs[0].data();

      if (dessertData.imageUrl) {
        const urlParts = dessertData.imageUrl.split("image/upload/");
        if (urlParts.length > 1) {
          let publicId = urlParts[1].split(".")[0];
          const versionRemoved = publicId.split("/").slice(1).join("/");

          if (versionRemoved) {
            console.log("กำลังพยายามลบรูปภาพด้วย publicId:", versionRemoved);
            await deleteImageFromCloudinary(versionRemoved);
          } else {
            console.error("ไม่พบ publicId ที่ถูกต้องหลังจากลบเวอร์ชัน:", dessertData.imageUrl);
            alert("ไม่สามารถลบรูปภาพได้: ไม่พบ publicId ที่ถูกต้อง");
            return;
          }
        } else {
          console.error("รูปแบบ URL ของรูปภาพไม่ถูกต้อง:", dessertData.imageUrl);
          alert("ไม่สามารถลบรูปภาพได้: รูปแบบ URL ไม่ถูกต้อง");
          return;
        }
      }

      await deleteDoc(doc(db, "desserts", docID));
      alert("ลบของหวานเรียบร้อยแล้ว!");
      fetchDesserts();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบของหวาน:", error);
      alert("เกิดข้อผิดพลาดในการลบของหวาน: " + error.message);
    }
  };

  const fetchDesserts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "desserts"));
      const dessertsData = snapshot.docs.map((doc) => {
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
      setDesserts(dessertsData);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลของหวาน:", error);
    }
  };

  useEffect(() => {
    fetchDesserts();
  }, []);

  return (
    <main className="p-5 flex flex-col gap-5">
      <div className="flex flex-col bg-white p-6 rounded-xl shadow-md w-full overflow-auto">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-xl font-semibold">การจัดการของหวาน</h1>
          <Button
            className="ml-auto py-3 font-semibold flex items-center bg-indigo-600 text-white hover:bg-[#3700B3]"
            color="primary"
            onClick={handleOpenModal}
          >
            เพิ่มของหวาน <PlusCircle className="h-4 ml-2" />
          </Button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-96">
              <h2 className="text-xl font-semibold mb-4">เพิ่มของหวานใหม่</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Input
                    name="name"
                    value={dessert.name}
                    onChange={handleInputChange}
                    label="ชื่อ"
                    fullWidth
                    required
                  />
                </div>
                <div className="mb-4">
                  <Input
                    name="price"
                    value={dessert.price}
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
                    value={dessert.description}
                    onChange={handleInputChange}
                    label="คำอธิบาย"
                    fullWidth
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2 ml-2">
                    อัปโหลดรูปภาพของหวาน
                  </label>
                  <Input
                    type="file"
                    title="เลือกภาพ"
                    onChange={(e) =>
                      setDessert((prev) => ({
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
              {desserts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-2 text-center text-sm text-gray-500">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              ) : (
                desserts
                  .sort((a, b) => {
                    const productIdA = parseInt(a.productId.replace("DES", ""));
                    const productIdB = parseInt(b.productId.replace("DES", ""));
                    return productIdA - productIdB;
                  })
                  .map((dessert, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{dessert.productId}</td>
                      <td className="px-4 py-2 border border-gray-300">
                        <img
                          src={dessert.imageUrl}
                          alt="ของหวาน"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{dessert.name}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{dessert.category}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{dessert.price}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{dessert.description}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">
                        {new Date(dessert.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">
                        {dessert.updatedAt ? new Date(dessert.updatedAt).toLocaleString("th-TH") : ""}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm">
                        <button
                          className="text-blue-500 hover:underline mr-2"
                          onClick={() => handleEdit(dessert)}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => handleDelete(dessert.productId)}
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