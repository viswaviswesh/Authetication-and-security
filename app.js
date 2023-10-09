//jshint esversion:6
import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";

const app = express();
const port = 3000;

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        unique : true,
    },
    password : {
        type : String,
        required : true,
    }, 
});

userSchema.plugin(encrypt, { secret: process.env.SECRET ,encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

app.get("/",(req,res) => {
    res.render("home");
});

app.get("/register",(req,res) => {
    res.render("register");
});

app.get("/login",(req,res) => {
    res.render("login");
});

app.post("/register",async(req,res) =>{
    const {username,password} = req.body;

    try {
        const foundUser = await (User.findOne({email : username }))

        if(foundUser){
           return res.render("register",{message : "Email already exist!"})
        }
        const user = new User({
            email : username,
            password : password,
        });
        await user.save();
        return res.render("secrets");

    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
});

app.post("/login",(req,res) =>{
    const {username,password} = req.body;

    User.findOne({email : username})
    .then(function(found){
        if(!found){      
            res.render("login",{message : "Email id not registered"});
            // alert("There's no User");  
        }else{
            if(found.password === password){
                res.render("secrets");
            }else{
                res.render("login",{message : "incorrect password!"})
            }
           
        }
    })
    .catch(function (error){
        console.log(error);
    });
});
app.listen(port,(req,res) =>{
    console.log(`Listening on Port ${port}`);
});