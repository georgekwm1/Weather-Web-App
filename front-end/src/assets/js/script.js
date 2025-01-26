document.getElementById("sendBtn").addEventListener("click", sendMessage);

function sendMessage() {
  const userInput = document.getElementById("userInput").value.trim();
  if (userInput) {
    appendMessage(userInput, "user");

    // Send the user's message to the Flask backend
    fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userInput })
    })
    .then(response => response.json())
    .then(data => {
      // Append the bot's response to the chat area
      appendMessage(data.response, "bot");
    })
    .catch(error => {
      console.error("Error:", error);
      appendMessage("Error communicating with the server.", "bot");
    });

    document.getElementById("userInput").value = ""; // Clear input
  }
}

function appendMessage(text, sender) {
  const chatArea = document.getElementById("chatArea");
  const message = document.createElement("div");
  message.className = `message ${sender}`;
  message.textContent = text;
  chatArea.appendChild(message);
  chatArea.scrollTop = chatArea.scrollHeight; // Scroll to the bottom
}
