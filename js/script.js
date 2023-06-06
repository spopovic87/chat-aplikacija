const channelID = 'Y9hBMxlDhjHDw9Pd';
const drone = new Scaledrone(channelID);

const getRandomUserName = function() {
  const adjectives = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black', 'White'];
  const nouns = ['Lion', 'Tiger', 'Elephant', 'Giraffe', 'Monkey', 'Kangaroo', 'Penguin', 'Dolphin', 'Squirrel'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
};

const getRandomColor = function() {
  const colors = ['#a3c1ad', '#f4d2c2', '#b8dff2', '#e3d7ff', '#ffe8aa', '#e6c7c7', '#c7e6d9', '#fad2d2', '#d2e7ff', '#ffdab9'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const createUser = function() {
  const user = {
    name: getRandomUserName(),
    color: getRandomColor(),
  };
  return user;
};

const createChatPanel = function(user) {
  const chatWrapper = document.querySelector('.chat-wrapper');
  
  const chatPanel = document.createElement('div');
  chatPanel.id = `chat-panel-${user.name}`;
  chatPanel.classList.add('chat-panel');

  const messageWrapper = document.createElement('div');
  messageWrapper.id = `message-wrapper-${user.name}`;
  messageWrapper.classList.add('message-wrapper');
  
  const form = document.createElement('div');
  form.classList.add('form');
  
  const inputBox = document.createElement('input');
  inputBox.id = `inputBox-${user.name}`;
  inputBox.classList.add('input-box');
  inputBox.type = 'text';
  inputBox.placeholder = 'Type your message';
  
  const button = document.createElement('button');
  button.id = `send-${user.name}`;
  button.classList.add('button');
  button.textContent = 'Send';
  
  form.appendChild(inputBox);
  form.appendChild(button);
  
  chatPanel.appendChild(messageWrapper);
  chatPanel.appendChild(form);
  
  chatWrapper.appendChild(chatPanel);
};

const activeUsers = {};

const displayMessage = function(containerId, author, content, color, isCurrentUser) {
  const container = document.getElementById(containerId);
  const message = document.createElement('div');
  message.classList.add('message');

  if (isCurrentUser) {
    message.classList.add('message-user1');
  } else {
    message.classList.add('message-user2');
  }

  const authorDiv = document.createElement('div');
  authorDiv.classList.add('author-wrapper');

  const authorSpan = document.createElement('span');
  authorSpan.classList.add('author');
  authorSpan.textContent = author + ': ';

  authorDiv.appendChild(authorSpan);
  message.appendChild(authorDiv);

  const messageText = document.createElement('div');
  messageText.classList.add('message-text');
  messageText.style.backgroundColor = color;

  messageText.appendChild(document.createTextNode(content));

  message.appendChild(messageText);
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
};

drone.on('open', function(error) {
  if (error) {
    return console.error(error);
  }
  console.log('Successfully connected to Scaledrone');

  const room = drone.subscribe('general');

  room.on('open', function() {
    console.log('Connected to the general room');
  });

  room.on('message', function(message) {
    const { user, content } = message.data;
    for (const userName in activeUsers) {
      const currentUser = activeUsers[userName];
      const isCurrentUser = userName === user.name;
      displayMessage(`message-wrapper-${userName}`, user.name, content, user.color, isCurrentUser);
    }
  });
});

drone.on('close', function(event) {
  console.log('Connection closed', event);
});

drone.on('error', function(error) {
  console.error('Error in Scaledrone', error);
});

const sendMessage = function(user, message) {
  drone.publish({
    room: 'general',
    message: {
      user: user,
      content: message,
    },
  });
};

const addUser = function() {
  const user = createUser();
  activeUsers[user.name] = user;
  createChatPanel(user);

  const inputBox = document.getElementById(`inputBox-${user.name}`);
  const sendButton = document.getElementById(`send-${user.name}`);

  sendButton.addEventListener('click', function() {
    const message = inputBox.value;
    if (message.trim() !== '') {
      sendMessage(user, message);
      inputBox.value = '';
    }
  });

  inputBox.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      const message = inputBox.value;
      if (message.trim() !== '') {
        sendMessage(user, message);
        inputBox.value = '';
      }
    }
  });

  console.log(`User ${user.name} joined the chat`);
};

addUser();
