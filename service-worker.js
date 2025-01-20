self.addEventListener("message", (event) => {
  const senderTabID = event.source.id; // ID of the tab which sent the message to the worker

  clients.matchAll().then((clients) => {
    const recipientTabs = clients.filter((client) => client.id !== senderTabID);

    recipientTabs.forEach((client) => {
      client.postMessage(event.data);
    });
  });
});
