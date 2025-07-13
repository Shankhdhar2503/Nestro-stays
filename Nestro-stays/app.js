// Core Module
const path = require('path');
const session = require('express-session')
const MongoDBStore = require('connect-mongo');
const multer = require("multer");
const { default : mongoose} = require('mongoose');
const DB_PATH =  "mongodb+srv://root:Kartik%4001@completecoding.hdzuz8g.mongodb.net/airbnb?retryWrites=true&w=majority&appName=CompleteCoding";


// External Module
const express = require('express');

// Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const rootDir = require("./utils/pathUtil");

// ✅ Fix: Prevent crash by ensuring `errors.js` exists and exports `pageNotFound`
const errorsController = require("./controllers/errors");
const authRouter = require("./routes/authRouter");
const { error } = require('console');




const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = MongoDBStore.create({
  mongoUrl : DB_PATH,
  collectionName : 'sessions'
})

const randomString = (length) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const storage = multer.diskStorage({
  destination : (req , file , cb) =>{
    cb(null , "uploads/")
  },
  filename : (req , file , cb) =>{
    cb(null , randomString(10) + '-' + file.originalname);
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const multerOptions = {
  storage, fileFilter,
}

app.use(express.urlencoded());
app.use(multer(multerOptions).single('photo'));
app.use(express.static(path.join(rootDir, 'public')));
app.use("/uploads", express.static(path.join(rootDir, 'uploads')))
app.use("/host/uploads", express.static(path.join(rootDir, 'uploads')))
app.use("/homes/uploads", express.static(path.join(rootDir, 'uploads')))
app.use(express.static(path.join(__dirname, 'public')));




app.use(session({
  secret:"knowledgeGate ai with completecoding",
  resave: false,
  saveUninitialized:true,
  store
}));

app.use((req , res , next) =>{
  // console.log('cookie check middleware' , req.get('Cookie'));
  // req.isLoggedin = req.get('cookie')?req.get('cookie').split('=')[1] === 'true' : false;   ye cookie ke liye tha
  req.isLoggedin = req.session.isLoggedin;
  next();
})
app.use(storeRouter);
app.use(authRouter);

// Routes
app.get('/', (req, res) => {
  res.render('index'); // views/index.ejs
});

app.use("/host", (req , res , next)=>{
  if(req.isLoggedin)
  {
    next();
  }
  else
  {
  return res.redirect("/login");
  }
});

app.use("/host", hostRouter);


app.use(errorsController.pageNotFound);

const PORT = 3000;
mongoose.connect(DB_PATH).then(() =>{
  console.log("connected to mongo");
   app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  })
}).catch(err =>{
  console.log("error while connecting to mongoose" , err)
})