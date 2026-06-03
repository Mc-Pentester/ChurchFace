const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 user connected:", socket.id);

  socket.on("chat:new", (data) => {
    socket.broadcast.emit("chat:new", data);
  });

  socket.on("comment:new", (data) => {
    io.emit("comment:new", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 user disconnected");
  });
});

server.listen(3001, () => {
  console.log("🚀 Socket server running on http://localhost:3001");
});