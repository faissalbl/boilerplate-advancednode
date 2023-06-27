$(document).ready(function () {
  const socket = io();
  socket.on('user', data => {
    $('#num-users').text(`${data.currentUsers} users online`);

    const message = `
      ${data.username} has ${data.connected ? 'joined' : 'left'} the chat.
    `;

    $('#messages').append($('<li>').html(`<b>${message}</b>`));
  });

  socket.on('chat message', ({ username, message }) => {
    const text = `${username}: ${message}`;
    $('#messages').append($('<li>').html(text));
  });
  
  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    const messageToSend = $('#m').val();
    socket.emit('chat message', messageToSend);
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});
