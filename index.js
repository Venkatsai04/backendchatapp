const express = require('express')
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userSchema = require('./Models/UserSchema')
const chatSchema = require('./Models/ChatSchema');
const MessageSchema = require('./Models/MessageSchema');
const socket = require('socket.io')
const cors = require("cors")
const port = 8008
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


var db = mongoose.connection;
mongoose.set('strictQuery', true);
db.on('connected', function () {
  console.log('database is connected successfully');
});
db.on('disconnected', function () {
  console.log('database is disconnected successfully');
})
mongoose.set('strictQuery', true)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://not-whatsup.netlify.app');
  next();
})


app.use(cors({
  origin: 'https://not-whatsup.netlify.app'
}));


app.use(express.json())
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.send('Hello World!')
  console.log("hello world");
})


app.post('/user', async (req, res) => {
  const findemail = await userSchema.findOne({ email: req.body.email })
  if (findemail != null) {
    res.send(findemail)
  }
  else {
    res.send("no user")
  }
})


app.post('/user/avatar/:id', async (req, res) => {
  try {
    const user = await userSchema.findById(req.params.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.avatar = req.body.url;
    await user.save();

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});


app.post('/user/register', async (req, res) => {
  try {
    const findemail = await userSchema.findOne({ email: req.body.email })
    const findUser = await userSchema.findOne({ username: req.body.username })
    console.log(findUser);
    if (findUser && findemail) {
      res.status(200).json({ msg: "Useranme and email already exist", status: false })
    } else if (findUser) {
      res.status(200).json({ msg: "Username already exists", status: false })
    } else if (findemail) {
      res.status(200).json({ msg: "Email already exists", status: false })
    } else {
      const User = new userSchema(req.body)
      User.save()
      res.status(200).json({ User, status: true })
    }
  } catch (error) {
    res.send(error)
  }
})


app.post('/user/login', async (req, res) => {
  // const findUser = await userSchema.findOne({ username: req.body.username })
  const findemail = await userSchema.findOne({ email: req.body.email })
  if (findemail != null) {
    if (findemail.password == req.body.password) {
      res.send(findemail)
    }
    else {
      res.send('Wrong password')
    }
  }
  else {
    res.send('wrong credentianls')
  }
})


app.get('/user/allusers/:id', async (req, res) => {
  try {
    const user = await userSchema.findById(req.params.id);
    const users = await userSchema.find({ _id: { $ne: user } })
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


app.post('/user/chat', (req, res) => {
  try {
    const persons = [req.body.sender, req.body.reciver]
    const newChat = new chatSchema({ persons })
    newChat.save()
    res.send(newChat)
  } catch (error) {
    console.log(error);
  }
})


app.get('/user/chat/:userid', async (req, res) => {
  try {
    const userChats = await chatSchema.find({
      persons: { $in: [req.params.userid] }
    })

    res.send(userChats)
  } catch (error) {
    res.send(error)
  }
})


app.get('/user/chat/:userid_1/:userid_2', async (req, res) => {
  try {
    const findChats = await MessageSchema.find({
      usersOfChat: { $all: [req.params.userid_1, req.params.userid_2] }
    }).sort({ updatedAt: 1 })

    const allMsg = findChats.map((msg) => {
      return {
        isSender: msg.usersOfChat[0].toString() === req.params.userid_1,
        text: msg.text
      }
    })

    res.send(allMsg)


  } catch (error) {
    res.send(error)
  }
})


app.post('/chat/message', (req, res) => {
  try {
    const usersOfChat = [req.body.sender, req.body.reciver]
    const { text } = req.body
    const msg = new MessageSchema({
      usersOfChat,
      text
    })

    res.send(msg)
    msg.save()
    console.log(msg);
  } catch (error) {
    console.log(error);
  }
})


app.get('/chat/findmsg/:chatid', async (req, res) => {
try {
  const findMsg = await MessageSchema.find({ $in: req.params.chatid })
  res.send(findMsg)
} catch (error) {
  console.log(error);
}
})


const io = socket(server, {
  cors: {
    origin: "https://not-whatsup.netlify.app",
    credentials: true,
  },
});


global.onlineUsers = new Map()


io.on('connection', (socket) => {
  global.chatSocket = socket;
  // console.log("login");
  socket.on("chatUser", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  

  socket.on("sendMsg", (message) => {
    const sendUserSocket = onlineUsers.get(message.reciver);
    console.log(message)
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msgRecived", message.text);
    }
  });
  
})
