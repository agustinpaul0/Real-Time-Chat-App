const messagesContainer = document.getElementById('messages');
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

if (navigator.serviceWorker) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
      console.log("Service Worker successfully registered: ", registration);
    })
    .catch((error) => {
      console.log("Error registering the Service Worker: ", error);
    });
}

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageInput.value;
  const serviceWorkerRegistration = await navigator.serviceWorker.ready;

  sendMessage(serviceWorkerRegistration.active, message);
  addSentMessageToDOM(message);

  messageInput.value = "";
});

navigator.serviceWorker.addEventListener("message", (event) => {
  addReceivedMessageToDOM(event.data);
});

function sendMessage(serviceWorker, message) {
  serviceWorker.postMessage(message);
}

function addSentMessageToDOM(message) {
  const p = document.createElement("p");

  p.textContent = message;
  p.classList.add("sent");

  messagesContainer.appendChild(p);
}

function addReceivedMessageToDOM(message) {
  const p = document.createElement("p");

  p.textContent = message;
  p.classList.add("received");

  messagesContainer.appendChild(p);
}