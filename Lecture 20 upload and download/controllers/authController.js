const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    isLoggedin:false,
    errors : [],
    oldInput : {email: ""},
    user : {}
  });
};

exports.postLogin = async (req , res , next) =>{
  const{email , password} = req.body;
   console.log("Login attempt:", email, password); // log input
  const user =await User.findOne({email});
   console.log("User found:", user); // check if user found
  if(!user)
  {
    return res.status(422).render("auth/login" , {
        pageTitle : "Login",
        currentPage:"login",
        isLoggedin : false,
        errors : ["user does  not exist"],
        oldInput : {email} ,
        user : {}
      })
  }
  
  const isMatch = await bcrypt.compare(password , user.password);
  if(!isMatch)
  {
    return res.status(422).render("auth/login",{
      pageTitle : "Login",
      currentPage : "login",
      isLoggedin : false,
      errors : ["invalid password"],
      oldInput : {email},
      user : {}
    });
  }
  

  req.session.isLoggedin = true,
  req.session.user = user;
  await req.session.save();
  // res.cookie("isLoggedin" , true);
  // req.isLoggedin = true;
  console.log("User logged in:", user.email); // check session login
  res.redirect("/");

}

exports.postLogout =(req , res , next) =>{
  // res.cookie("isLoggedin" , false);
  req.session.destroy(()=>{
    res.redirect("/login");
  })
}

exports.getSignup = (req , res , next) =>{
  res.render("auth/signup",{
    pageTitle : "Signup",
    currentPage : "signup",
    isLoggedin : false,
    errors : [],
    oldInput:{firstName:"" , lastName:"",email:"" , userType:""},
    user : {}
  })
}

exports.postSignup =[
  
  check("firstName")
  .trim()
  .isLength({min:2})
  .withMessage("first name should be 2 character long")
  .matches(/^[A-Za-z\s]+$/)       // + means minimum 8 character
  .withMessage("first name should contain only alphabet"),
  
  check("lastName")
  .matches(/^[A-Za-z\s]*$/)       // * means 0 or more character
  .withMessage("last name should contain only alphabet"),

  check("email")
  .isEmail()
  .withMessage("Please enter a valid email")
  .normalizeEmail(),

  check("password")
  .isLength({min : 8})
  .withMessage("passsword should be 8 charater long")
  .matches(/[A-Z]/)
  .withMessage("password should contain atleast one upercase letter")
  .matches(/[a-z]/)
  .withMessage("password should contain atleast one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("password should contain atleast one numeric value")
  .matches(/[!@&]/)
  .withMessage("password should contain atleast one special character")
  .trim(),

  check("confirmPassword")
  .trim()
  .custom((value , {req})=>{ 
     if(value !== req.body.password)
     {
      throw new Error("password do not match");
     }
     return true;
  }),

  check("userType")
  .notEmpty()
  .withMessage("Please select a user type")
  .isIn(['guest' , 'host'])
  .withMessage("invalid user type"),

  check("terms")
  .notEmpty()
  .withMessage("Please accept the terms and condition")
  .custom((value , {req})=>{
     if(value !== "on")
     {
      throw new Error("Please accept the terms and conditions");
     }
     return true;
  }),
  
  (req , res , next)=>{
    const {firstName , lastName , email , password , confirmPassword, userType} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
      return res.status(422).render("auth/signup" , {
        pageTitle : "Signup",
        currentPage:"signup",
        isLoggedin : false,
        errors : errors.array().map(err => err.msg),
        oldInput : {firstName , lastName , email , password , userType},
        user : {} 
      })
    }

    bcrypt.hash(password , 12)
    .then(hashedPassword =>{
      const user = new User({firstName , lastName , email , password : hashedPassword , userType})
      return user.save();
    })
    .then(()=>{
      res.redirect("/login");
    }).catch(err=>{
       return res.status(422).render("auth/signup" , {
        pageTitle : "Signup",
        currentPage:"signup",
        isLoggedin : false,
        errors : [err.message],
        oldInput : {firstName , lastName , email ,userType} ,
        user : {}
      })
    })

    // const user = new User({firstName , lastName , email , password , userType});
    // user.save().then(()=>{
    //   res.redirect("/login");
    // }).catch(err =>{
    //   return res.status(422).render("auth/signup" , {
    //     pageTitle : "Signup",
    //     currentPage:"signup",
    //     isLoggedin : false,
    //     errors : [err.message],
    //     oldInput : {firstName , lastName , email , password , userType} 
    //   })
    // });

}]