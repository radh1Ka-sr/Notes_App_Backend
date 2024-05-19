// const express = require("express")
// const jwt = require('jsonwebtoken');
// const bodyParser = require('body-parser')

// const app = express();
// const cors = require('cors')

// app.use(bodyParser.json());
// app.use(cors());
// const mongoose = require('mongoose')
// const SECRET = 'SECr3t';
// //MONGOOSH SCHEMA
// const userSchema = new mongoose.Schema({
//     username: String,
//     password: String,
//   });

//   const blogSchema = new mongoose.Schema({
//     title: String,
//     description: String,
//     publishedby: String
//   });
  
// // MONGODB MODEL
// const User = mongoose.model('User', userSchema);
// const Blog = mongoose.model('Blog', blogSchema);
// //connect mongodb
// mongoose.connect('mongodb+srv://radhikasinghrajawat2:Radhika2003@cluster0.qdafjto.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

// const authenticateJwt = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (authHeader) {
//       const token = authHeader.split(' ')[1];
//       jwt.verify(token, SECRET, (err, user) => {
//         if (err) {
//           return res.sendStatus(403);
//         }
//         req.user = user;
//         next();
//       });
//     } else {
//       res.sendStatus(401);
//     }
//   };

// app.post('/signup',async(req,res)=>{
//     const {username , password} = req.body;
//     const user = await User.findOne({username});
//     if(user){
//         res.status(403).json({message : "User already exist"});
//     }
//     else{
//         const newUser = new User({username,password});
//         await newUser.save();
//         const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '1h' });
//         res.json({ message: 'User created successfully', token });
        
//     }
// });

// app.post('/login', async (req,res)=>{
//     const {username, password} = req.body;
//     const user = await User.findOne({username, password});
//     if(user){
//         // const payload = {username};
//         let token = jwt.sign({userId : user._id} , SECRET,{expiresIn: '1h'});
//         res.json({message : "Logged in successfully", token});
//     }
//     else{
//         res.status(403).json({message : "Invalid username or password"})
//     }
// });
   
// app.post('/user/blog', authenticateJwt, async (req, res) => {
//     const blog = new Blog(req.body);
//     await blog.save();
//     res.json({ message: 'Blog created successfully', blogId: blog.id });
//   });
// app.listen(3000, () => {
//     console.log("Server running on port 3000");
//   });


const express = require("express")
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const app = express();
const cors = require('cors')

app.use(bodyParser.json());
app.use(cors());

const PORT = 3000;
// let notes=[];


const mongoose = require('mongoose')

const SECRET = "pratik";

//Define mongoose Schema
const noteSchema = new mongoose.Schema({
    title : {type: String, required : true},
    content : {type: String, required : true},
    username : {type: String, required : true}
});

const userSchema = new mongoose.Schema({
    username : {type : String , required : true},
    password : {type : String , required : true}
})

//Define mongoose model
const User = mongoose.model('User',userSchema);
const Notes = mongoose.model('Notes',noteSchema);

//Connect to mongoDb
mongoose.connect('mongodb+srv://radhikasinghrajawat2:Radhika2003@cluster0.qdafjto.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

//Register User
app.post('/user/signup', async (req,res)=>{
    const {username , password} = req.body;
    const user = await User.findOne({username});
    if(user){
        res.status(403).json({message : "User already exist."});
    }
    else{
        const newUser = new User({username, password});
        await newUser.save();
        res.json({message:"User created successfully"})
    }
})

//Login User
app.post('/user/login', async (req,res)=>{
    const {username, password} = req.body;
    const user = await User.findOne({username, password});
    if(user){
        // const payload = {username};
        let token = jwt.sign({userId : user._id} , SECRET,{expiresIn: '1h'});
        res.json({message : "Logged in successfully", token});
    }
    else{
        res.status(403).json({message : "Invalid username or password"})
    }
});

//Middleware for Authentication
function authenticatejwt(req,res,next){
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token,SECRET,(err,decode)=>{
        if(err) return  res.send({
            message:"Token is not valid please login",
            status:2
        })
        if(decode){
            req.body.username= decode.userId;
            next()
        }else{
            res.send({
                message:"Token is not valid please login",
                status:2
            })
        }
    })  
};

//Create Notes
app.post('/notes/create', authenticatejwt , async (req,res)=>{
    try {
        let note = new Notes(req.body);
        await note.save();
        res.status(200).json({
            note : note,
            message : "Notes Created successfully"})
    } catch (error) {
        res.json({message : error.message});
        
    }
})

//Get Notes
app.get('/notes',authenticatejwt,async(req,res)=>{

    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, SECRET , async (err,decode)=>{
        try {
            let data = await Notes.find({username:decode.userId});
            res.status(200).json({
                data : data,
                message : "Success"
            })
        } catch (error) {
            res.json({message : error.message})
        }
    })
});

//Update Notes
app.put('/notes/:id',authenticatejwt,async (req,res)=>{
    let notes = await Notes.findByIdAndUpdate(req.params.id , req.body,{new:true});
    // const updatedNotes = notes;
    if(notes){
        res.json({
            message : "Notes updated successfully",
            notes : notes
        })
    }
    else{
        res.json({message : error.message})
    }
});

//Delete Notes
app.delete('/notes/:id' , authenticatejwt , async (req,res)=>{
    try {
        await Notes.findByIdAndDelete(req.params.id);
        res.json({message : "Notes Deleted"});
    } catch (error) {
        res.json({message : error.message})
    }
    
})


app.listen(PORT,(req,res)=>{
    console.log("App running on PORT ${PORT}");
})