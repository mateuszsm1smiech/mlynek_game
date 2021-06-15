const express = require("express");
const socketIO = require("socket.io");
const PORT = 5000;
const app = express();
var mongoClient = require("mongodb").MongoClient;

const uri = "mongodb+srv://mlynek_app:hIWosbClWGoWey0M@cluster0.uq1zs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var initData;

mongoClient.connect(uri, function (_err, client) {

  let db = client.db("mlynek_database");
  collection = db.collection("game_data");
  collection.findOne({ "_id": "GameData" }).then(value => {
    initData = value;
    if (initData == null) {
      console.log("Can't find data from database");
      return;
    }
    lauchAfterGameDataInit();
  }).catch(error => {
    console.log(error);
  });

})

function lauchAfterGameDataInit() {

  const server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });

  app.use(express.static('static'));

  const io = socketIO(server);
  let usersCount = 0;

  io.on("connection", function (socket) {
    console.log("Made socket connection");
    usersCount++;
    if(usersCount == 1){
      initData.control = true;
      socket.emit("init", initData);
    }
    else if(usersCount == 2){
      initData.control = false;
      socket.emit("init", initData);
    }
    else{
      socket.disconnect()
    }

    socket.on("gameData", data=>{
      socket.broadcast.emit("gameData", data);
      console.log(data);
    });

    socket.on("disconnect", () => {
      usersCount--;
    });

  });

}
