const io = require('socket.io-client');

// Thay YOUR_JWT_TOKEN bằng token thực tế từ login
const TOKEN = process.argv[2] || 'YOUR_JWT_TOKEN';
const RECEIVER_ID = process.argv[3] || 'RECEIVER_UUID';

const socket = io('http://localhost:5001', {
  auth: { token: TOKEN }
});

socket.on('connect', () => {
  console.log('✓ Connected to WebSocket server');
  console.log('Socket ID:', socket.id);
  
  // Test gửi tin nhắn
  console.log('\nGửi tin nhắn test...');
  socket.emit('send_message', {
    receiverId: RECEIVER_ID,
    content: 'Hello! Đây là tin nhắn test từ WebSocket.'
  });
});

socket.on('message_sent', (message) => {
  console.log('\n✓ Tin nhắn đã gửi thành công:');
  console.log(JSON.stringify(message, null, 2));
});

socket.on('new_message', (message) => {
  console.log('\n✓ Nhận tin nhắn mới:');
  console.log(JSON.stringify(message, null, 2));
});

socket.on('error', (error) => {
  console.error('\n✗ Lỗi:', error.message);
});

socket.on('disconnect', () => {
  console.log('\n✗ Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('\n✗ Connection error:', error.message);
  process.exit(1);
});

// Tự động disconnect sau 5 giây
setTimeout(() => {
  console.log('\nĐóng kết nối...');
  socket.disconnect();
  process.exit(0);
}, 5000);
