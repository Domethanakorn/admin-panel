"use client"

import { Button, Input } from "@nextui-org/react";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";


export default function BeverageList() {
    const [isModalOpen, setIsModalOpen] = useState(false); // สถานะเปิด/ปิด modal
    const [ beverage, setBeverage] = useState({
        id: "",
        name: "",
        category: "",
        description: "",
        price: 0,
        beveragePicture: "",
        createdAt: null,
        updatedAt: null,
    });
    const [beverages, setBeverages] = useState([]); // State เก็บข้อมูลน้ำทั้งหมด

    const [categories, setCategories] = useState(["Coffee Hot", "Coffee Cold", "Tea Hot", "Tea Cold", "Milk Hot", "Milk Cold", "Soda"]);

    // ฟังก์ชันเปิด modal
    const handleOpenModal = () => {
        setBeverage({
            id: "",
            name: "",
            category: "",
            description: "",
            price: 0,
            beveragePicture: "",
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
        setBeverage((prev) => ({
            ...prev,
            [name]: name === 'price' ? Number(value) : value,
        }));
    };

    // ฟังก์ชันอัปโหลดรูปภาพไปยัง Cloudinary
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "beverage_images"); // Replace with your preset
        formData.append("cloud_name", "dsbdsiefa"); // Replace with your cloud name
        formData.append("folder", "beverages/");
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
    const generateBeverageId = () => {
        const randomId = Math.floor(Math.random() * 90000) + 1000; 
        return `BER${randomId}`;
    };


    // ฟังก์ชันบันทึกข้อมูลเครื่องดื่ม
    const handleSubmit = async (e) => {
        e.preventDefault();
        const beverageId = generateBeverageId();
       
        console.log(beverageId);
        // อัปโหลดรูปภาพก่อน
        let beveragePictureUrl = beverage.beveragePicture;
        if (beverage.file) {
            beveragePictureUrl = await uploadToCloudinary(beverage.file);
            if (!beveragePictureUrl) {
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
        const beverageData = {
             ...beverage,
             id: beverage.id ||beverageId,
             beveragePicture: beveragePictureUrl ,
         
             createdAt: beverage.id ? beverage.createdAt : date,
             updatedAt: beverage.id ? date : null,
             file: undefined,
            
            };

        try {
                let response;
                    console.log(beverage.id)
            if(beverage.id){
                    response = await fetch("/api/beverages",{
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(beverageData),
                    });
            }else{
                 response = await fetch("/api/beverages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(beverageData),
            });
        }
            if (response.ok) {
                alert(beverage.id ? "Beverage updated successfully!": "Beverage added successfully!");
                handleCloseModal();
                fetchBeverages(); // ดึงข้อมูลใหม่หลังเพิ่ม
            } else {
                alert("Failed to save beverage.");
            }
        
        } catch (error) {
            console.error("Error saving beverage:", error);
            alert("Error saving beverage.");
        }
    };

  //เเสดงหน้าเเก้ไข
    const handleEdit = (ber) =>{
        setBeverage({
            id: ber.id,
            name:  ber.name,
            category:  ber.category,
            description:  ber.description,
            price:  ber.price,
            dessertPicture: ber.dessertPicture,
            createdAt: ber.createdAt,
            updatedAt: ber.updatedAt,
            file: null,
        });
        setIsModalOpen(true);
    }

    // ฟังก์ชันลบข้อมูลเครื่องดื่ม
    const handleDelete = async (id) =>{
        const confirmDelete = window.confirm('Are you want to delete beverage?');
        if(!confirmDelete) return;
       

        try{
            console.log('Deleting beverage with ID:', id); 
            const response = await fetch("/api/beverages", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: id }),
                
            })
           
            if(response.ok){
                alert("Delete beverage successfully!");
                fetchBeverages();
            }else{
                alert("Falied to delete beverage.")
            }

        }catch(error){
                console.log("Error saving beverage ",error);
                alert("Error saving beverage");
        }
    }




    // ฟังก์ชันดึงข้อมูลขนมทั้งหมด
    const fetchBeverages = async () => {
        try {
            const response = await fetch("/api/beverages");
            if (response.ok) {
                const data = await response.json();

                if (data && data.length > 0){
                    console.log("Fetched beverage data:", data); 
                    setBeverages(data);
                }else{
                    console.log("No data found");
                    setBeverages([]);
                }
               
            } else {
                console.error("Failed to fetch beverages.");
                setBeverages([]);
               
                
            }
        } catch (error) {
            console.error("Error fetching beverages:", error);
        }
    };

    // ดึงข้อมูลเครื่องดื่มเมื่อ component โหลดครั้งแรก
    useEffect(() => {
        fetchBeverages();
    }, []);

    const handleCategoryChange = (event) => {
        setBeverage((prev) => ({
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
        <div className="flex flex-col bg-white p-6 rounded-xl shadow-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
                <h1 className="text-xl font-semibold">Beverage Management</h1>
                <Button
                    className="ml-auto py-3 font-semibold flex items-center"
                    color="primary"
                    onClick={handleOpenModal}
                >
                    Add Beverage <PlusCircle className="h-4 ml-2" />
                </Button>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl  w-96">
                        <h2 className="text-xl font-semibold mb-4">Add New Beverage</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <Input
                                    name="name"
                                    value={beverage.name}
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
                value={beverage.category}
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
                                    value={beverage.description}
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
                                    value={beverage.price}
                                    onChange={handleInputChange}
                                    label="Price"
                                    fullWidth
                                    required
                                />
                            </div>
                    
                            <div className="mb-4">
                                <Input
                                    type="file"
                                    onChange={(e) =>
                                        setBeverage((prev) => ({
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
       <div className=" overflow-x-auto max-w-full">
    <table className="min-w-full table-auto border-collapse border border-gray-300 rounded-lg shadow-sm">
        <thead className="bg-gray-200">
            <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Image</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Category</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Description</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Price</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">CreatedAt</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">UpdatedAt</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">Action</th>
            </tr>
        </thead>
        <tbody className="bg-white">
            {beverages.length === 0 ? (
                <tr>
                    <td colSpan="9" className="px-4 py-2 text-center text-sm text-gray-500">No data</td>
                </tr>
            ) : (
                beverages.map((ber, index) => (
                    <tr key={index}>
                        <td className="px-4 py-2 border border-gray-300 truncate max-w-xs text-ellipsis overflow-hidden text-sm">{ber.id}</td>
                        <td className="px-4 py-2 border border-gray-300">
                            <img
                                src={ber.beveragePicture}
                                alt="Profile"
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        </td>
                        <td className="px-4 py-2 border border-gray-300 truncate max-w-xs text-ellipsis overflow-hidden text-sm">{ber.name}</td>
                        <td className="px-4 py-2 border border-gray-300 truncate max-w-xs text-ellipsis overflow-hidden text-sm">{ber.category}</td>
                        <td className="px-4 py-2 border border-gray-300 truncate max-w-xs text-ellipsis overflow-hidden text-sm">{ber.description}</td>
                        <td className="px-4 py-2 border border-gray-300 truncate max-w-xs text-ellipsis overflow-hidden text-sm">{ber.price}</td>
                        <td className="px-4 py-2 border border-gray-300 truncate max-w-xs text-ellipsis overflow-hidden text-sm">{ber.createdAt}</td>
                        <td className="px-4 py-2 border border-gray-300 truncate max-w-xs text-ellipsis overflow-hidden text-sm">{ber.updatedAt}</td>
                        <td className="px-4 py-2 border border-gray-300 truncate max-w-xs text-ellipsis">
                            <button
                                className="text-blue-500 hover:underline mr-2"
                                onClick={() => handleEdit(ber)}
                            >
                                Edit
                            </button>
                            <button
                                className="text-red-500 hover:underline"
                                onClick={() => handleDelete(ber.id)}
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
