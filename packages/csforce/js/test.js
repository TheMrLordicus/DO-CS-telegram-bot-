const handler = require('./index.js');
const mockReq = { body: { message: { chat: { id: 1446777548 }, text: '/online' } } };
const mockRes = {}; // Not used directly, but required for signature
handler(mockReq, mockRes).then(() => console.log('Handler executed')).catch(err => console.error('Handler error:', err));