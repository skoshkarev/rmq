const socket = io();
document.getElementById('save-rate').addEventListener('click',()=>{
    const rate = document.getElementById('message-rate').value;
    socket.emit('setRate', rate);
});
socket.on('chessNotification',(message)=>{
    //console.info(message);
});
socket.on('Ql', (lengths) => {
document.getElementById('mobile-queue').textContent = lengths.mobile || 0;
document.getElementById('web-queue').textContent = lengths.web || 0;
document.getElementById('email-queue').textContent = lengths.email || 0;
});
