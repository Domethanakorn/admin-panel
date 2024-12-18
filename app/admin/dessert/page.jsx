"use client"

import { Button, Input } from "@nextui-org/react";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";


export default function DessertList() {
    const [isModalOpen, setIsModalOpen] = useState(false); // สถานะเปิด/ปิด modal
    const [dessert, setDessert] = useState({
        id: "",
        name: "",
        category: "",
        description: "",
        price: 0,
        stock: 0,
        status: "",
        dessertPicture: "",
        createdAt: null,
        updatedAt: null,
    });
    const [desserts, setDesserts] = useState([]); // State เก็บข้อมูลขนม

    const [categories, setCategories] = useState(["Cakes","Cookies","Pies","Pastries"]);

    // ฟังก์ชันเปิด modal
    const handleOpenModal = () => {
        setDessert({
            id: "",
            name: "",
            category: "",
            description: "",
            price: 0,
            stock: 0,
            status: "",
            dessertPicture: "",
            createdAt: null,
            updatedAt: null,
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
        setDessert((prev) => ({
            ...prev,
            [name]: name === 'price' ? Number(value) : value,
        }));
    };

    // ฟังก์ชันอัปโหลดรูปภาพไปยัง Cloudinary
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "dessert_images"); // Replace with your preset
        formData.append("cloud_name", "dsbdsiefa"); // Replace with your cloud name
        formData.append("folder", "desserts/");
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
    const generateDessertId = () => {
        const randomId = Math.floor(Math.random() * 90000) + 1000; // สุ่มเลข 5 หลักจาก 1000 ถึง 9999
        return `DES${randomId}`;
    };


    // ฟังก์ชันบันทึกข้อมูลพนักงาน
    const handleSubmit = async (e) => {
        e.preventDefault();
        const dessertId = generateDessertId();
       
        console.log(dessertId);
        // อัปโหลดรูปภาพก่อน
        let dessertPictureUrl = dessert.dessertPicture;
        if (dessert.file) {
            dessertPictureUrl = await uploadToCloudinary(dessert.file);
            if (!dessertPictureUrl) {
                alert("Failed to upload image.");
                return;
            }
        }
        const status = dessert.stock <= 0 ? "หมด" : "มี";
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
        const dessertData = {
             ...dessert,
             id: dessert.id || dessertId,
             dessertPicture: dessertPictureUrl ,
             status: status,
             createdAt: dessert.id ? dessert.createdAt : date,
             updatedAt: dessert.id ? date : null,
             file: undefined,
            
            };

        try {
                let response;
                    console.log(dessert.id)
            if(dessert.id){
                    response = await fetch("/api/desserts",{
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(dessertData),
                    });
            }else{
                 response = await fetch("/api/desserts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dessertData),
            });
        }
            if (response.ok) {
                alert(dessert.id ? "Dessert updated successfully!": "Dessert added successfully!");
                handleCloseModal();
                fetchDesserts(); // ดึงข้อมูลใหม่หลังเพิ่ม
            } else {
                alert("Failed to save dessert.");
            }
        
        } catch (error) {
            console.error("Error saving dessert:", error);
            alert("Error saving dessert.");
        }
    };

  //เเสดงหน้าเเก้ไข
    const handleEdit = (des) =>{
        setDessert({
            id: des.id,
            name:  des.name,
            category:  des.category,
            description:  des.description,
            price:  des.price,
            stock: des.stock,
            status: des.status,
            dessertPicture: des.dessertPicture,
            createdAt: des.createdAt,
            updatedAt: des.updatedAt,
            file: null,
        });
        setIsModalOpen(true);
    }

    // ฟังก์ชันลบข้อมูลขนม
    const handleDelete = async (id) =>{
        const confirmDelete = window.confirm('Are you want to delete dessert?');
        if(!confirmDelete) return;
       

        try{
            console.log('Deleting dessert with ID:', id); 
            const response = await fetch("/api/desserts", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: id }),
                
            })
           
            if(response.ok){
                alert("Delete dessert successfully!");
                fetchDesserts();
            }else{
                alert("Falied to delete dessert.")
            }

        }catch(error){
                console.log("Error saving dessert ",error);
                alert("Error saving dessert");
        }
    }




    // ฟังก์ชันดึงข้อมูลขนมทั้งหมด
    const fetchDesserts = async () => {
        try {
            const response = await fetch("/api/desserts");
            if (response.ok) {
                const data = await response.json();

                if (data && data.length > 0){
                    console.log("Fetched dessert data:", data); 
                    setDesserts(data);
                }else{
                    console.log("No data found");
                 
                }
               
            } else {
                console.error("Failed to fetch desserts.");
                setDesserts([]);
                
            }
        } catch (error) {
            console.error("Error fetching desserts:", error);
        }
    };

    // ดึงข้อมูลขนมเมื่อ component โหลดครั้งแรก
    useEffect(() => {
        fetchDesserts();
    }, []);

    const handleCategoryChange = (event) => {
        setDessert((prev) => ({
          ...prev,
          category: event.target.value,
        }));
      };
    
      //const handleAddCategory = () => {
        //if (newCategory && !categories.includes(newCategory)) {
          //setCategories([...categories, newCategory]);
          //setDessert((prev) => ({
           // ...prev,
           // category: newCategory,
         // }));
          //setNewCategory('');
       // }
      //};

    return (
        <main className="p-5 flex flex-col gap-5">
        <div className="flex flex-col bg-white p-6 rounded-xl shadow-md w-full ">
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
                <h1 className="text-xl font-semibold">Dessert Management</h1>
                <Button
                    className="ml-auto py-3 font-semibold flex items-center"
                    color="primary"
                    onClick={handleOpenModal}
                >
                    Add Dessert <PlusCircle className="h-4 ml-2" />
                </Button>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl  w-96">
                        <h2 className="text-xl font-semibold mb-4">Add New Dessert</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <Input
                                    name="name"
                                    value={dessert.name}
                                    onChange={handleInputChange}
                                    label="Name"
                                    fullWidth
                                    required
                                />
                            </div>
                            <div className="mb-4 m-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={dessert.category}
                onChange={handleCategoryChange}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm w-3/4"
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
           
            </div>          
                            <div className="mb-4">
                                <Input
                                    name="description"
                                    value={dessert.description}
                                    onChange={handleInputChange}
                                    label="Description"
                                    fullWidth
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    type = "number"
                                    name="price"
                                    value={dessert.price}
                                    onChange={handleInputChange}
                                    label="Price"
                                    fullWidth
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <Input
                                    type="number"
                                    name="stock"
                                    value={dessert.stock}
                                    onChange={handleInputChange}
                                    label="Stock"
                                    fullWidth
                                    required
                                />
                            </div>
                       
                    
                            <div className="mb-4">
                                <Input
                                    type="file"
                                    onChange={(e) =>
                                        setDessert((prev) => ({
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

       {/* Dessert Table */}
       <div className="overflow-x-auto max-w-full">
    <table className="min-w-full table-fixed border-collapse border border-gray-300 rounded-lg shadow-sm">
        <thead className="bg-gray-200">
            <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Image</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Category</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Description</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Price</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Stock</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">CreatedAt</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">UpdatedAt</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Action</th>
            </tr>
        </thead>
        <tbody className="bg-white">
            {desserts.length === 0 ? (
                <tr>
                    <td colSpan="11" className="px-4 py-2 text-center text-sm text-gray-500">No data</td>
                </tr>
            ) : (
                desserts.map((des, index) => (
                    <tr key={index}>
                        <td className="px-4 py-2 border border-gray-300 text-sm truncate">{des.id}</td>
                        <td className="px-4 py-2 border border-gray-300">
                            <img
                                src={des.dessertPicture}
                                alt="Profile"
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        </td>
                        <td className="px-4 py-2 border border-gray-300 text-sm truncate">{des.name}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm truncate">{des.category}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm truncate">{des.description}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm truncate">{des.price}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm truncate">{des.stock}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm truncate">{des.status}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm truncate">{des.createdAt}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm truncate">{des.updatedAt}</td>
                        <td className="px-4 py-2 border border-gray-300 text-sm truncate">
                            <button
                                className="text-blue-500 hover:underline mr-2"
                                onClick={() => handleEdit(des)}
                            >
                                Edit
                            </button>
                            <button
                                className="text-red-500 hover:underline"
                                onClick={() => handleDelete(des.id)}
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
