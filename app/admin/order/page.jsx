"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firestore/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // สถานะแสดง/ซ่อนรายการออเดอร์ในแต่ละแถว
  const [showItemsForOrder, setShowItemsForOrder] = useState({});

  // ดึงข้อมูลจาก Firebase
  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        OrderDate: doc.data().OrderDate.toDate(),
      }));
      setOrders(ordersData);
      setFilteredOrders(ordersData); // แสดงทั้งหมดก่อน
      setTotalPrice(ordersData.reduce((sum, order) => sum + order.TotalPrice, 0));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ฟังก์ชันกรองข้อมูลตามวันที่เลือก
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredOrders(orders); // ถ้ายังไม่เลือกวันที่ให้แสดงทั้งหมด
      setTotalPrice(orders.reduce((sum, order) => sum + order.TotalPrice, 0));
      return;
    }

    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.OrderDate).getTime();
      return orderDate >= start && orderDate <= end;
    });

    setFilteredOrders(filtered);
    setTotalPrice(filtered.reduce((sum, order) => sum + order.TotalPrice, 0));
  }, [orders, startDate, endDate]);

  // ฟังก์ชันสำหรับการแสดง/ซ่อนรายการออเดอร์ในแต่ละแถว
  const toggleItemsVisibility = (orderId) => {
    setShowItemsForOrder((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <main className="p-5 flex flex-col space-y-5">
      <div className="flex flex-col bg-white p-6 rounded-xl shadow-md w-full space-y-5">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h1 className="text-xl font-semibold text-gray-800">รายละเอียดคำสั่งซื้อ</h1>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-1">
              <label className="text-sm text-gray-600">วันที่เริ่มต้น:</label>
              <input
                type="date"
                className="p-2 border border-gray-300 rounded-md"
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-sm text-gray-600">วันที่สิ้นสุด:</label>
              <input
                type="date"
                className="p-2 border border-gray-300 rounded-md"
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* แสดงยอดขายรวม */}
        <div className="p-4 bg-green-100 border border-green-300 rounded-md">
          <p className="text-lg font-medium text-green-800">
            ยอดขายรวม: <span className="font-bold">{totalPrice.toLocaleString()} บาท</span>
          </p>
        </div>

        <div className="overflow-x-auto max-w-full">
        <div className="overflow-y-auto max-h-[680px]">
          <table className="min-w-full table-fixed border-collapse border border-gray-300 rounded-lg shadow-sm">
            <thead className="bg-indigo-300">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">รหัสออเดอร์</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ชื่อพนักงาน</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">นามสกุลพนักงาน</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">เบอร์สมาชิก</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">รายการออเดอร์</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">ราคารวม</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">วันที่สั่ง</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-3 text-center text-sm text-gray-500">
                    ไม่มีออเดอร์
                  </td>
                </tr>
              ) : (
                filteredOrders
                  .sort((a, b) => {
                    const numA = parseInt(a.OrderID.replace("ORD", ""), 10);
                    const numB = parseInt(b.OrderID.replace("ORD", ""), 10);
                    return numB - numA;
                  })
                  .map((order, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{order.OrderID}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{order.name}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{order.surname}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">{order.phoneNumber}</td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">
                        {/* ปุ่มแสดง/ซ่อน รายการออเดอร์ */}
                        <button
                          onClick={() => toggleItemsVisibility(order.OrderID)}
                          className="text-blue-500"
                        >
                          {showItemsForOrder[order.OrderID] ? "ซ่อน รายการ" : "แสดง รายการ"}
                        </button>
                        {showItemsForOrder[order.OrderID] && order.OrderItems && order.OrderItems.length > 0 && (
                          <div className="mt-2">
                            {order.OrderItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>{(item.price * item.quantity).toLocaleString()} บาท</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">
                        {order.TotalPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 border border-gray-300 text-sm truncate">
                        {new Date(order.OrderDate).toLocaleString("th-TH")}
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
