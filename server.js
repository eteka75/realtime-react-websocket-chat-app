const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("sendMessage", async (message) => {
    const savedMessage = await prisma.message.create({
      data: { content: message },
    });
    io.emit("receiveMessage", savedMessage);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.get("/messages", async (req, res) => {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(messages);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
