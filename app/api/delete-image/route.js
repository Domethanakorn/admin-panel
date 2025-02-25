import { v2 as cloudinary } from 'cloudinary';

// ตั้งค่าการเชื่อมต่อกับ Cloudinary
cloudinary.config({
  cloud_name: 'dsbdsiefa',
  api_key: '839756622429573',
  api_secret: 'lY3CBk-9nn5ZRtBo1FSSYJnAf-k',
});

// ฟังก์ชันลบไฟล์จาก Cloudinary สำหรับ HTTP POST
export async function POST(req) {
  const { publicId } = await req.json();  // ใช้ .json() เพื่อดึงข้อมูลจาก body

  if (!publicId) {
    return new Response(JSON.stringify({ error: 'Public ID is required' }), { status: 400 });
  }

  try {
    console.log('Attempting to delete image with publicId:', publicId);  // แสดง publicId ที่จะลบ
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return new Response(JSON.stringify({ message: 'Image deleted successfully' }), { status: 200 });
    } else {
      console.error('Cloudinary delete error result:', result); // Log ข้อมูลเพื่อช่วยในการดีบัก
      return new Response(JSON.stringify({ error: 'Error deleting image from Cloudinary', result }), { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting image:', error); // Log ข้อผิดพลาดจาก Cloudinary
    return new Response(JSON.stringify({ error: 'Error deleting image from Cloudinary', error: error.message }), { status: 500 });
  }
}
