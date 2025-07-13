const Home = require("../models/home");
const fs = require("fs");


exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to airbnb",
    currentPage: "addHome",
    editing: false,
    isLoggedin: req.isLoggedin,
    user: req.session.user,
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === true;

  Home.findById(homeId).then((home) => {

    if (!home) {
      console.log("home is not found");
      return res.redirect("/host/host-home-list");
    }
    console.log(homeId, editing, home);
    res.render("host/edit-home", {
      home: home,
      pageTitle: "edit your home here",
      currentPage: "host-homes",
      editing: true,
      isLoggedin: req.isLoggedin,
      user: req.session.user,
    });
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedin: req.isLoggedin,
      user: req.session.user,
    });
  });
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, discription } = req.body;

  if(!req.file)
  {
    return res.status(422).send("no image provided");
  }
  
  const photo = req.file.path;

  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo :"/uploads/" + req.file.filename ,
    discription,
  });
  home.save().then(() => {
    console.log("home saved successfully");
  });

  res.redirect("/host/host-home-list");
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.log("Error while deleting", error);
    });
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, discription } = req.body;
  Home.findById(id)
    .then((home) => {
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.discription = discription;

      if(req.file)
      {
        fs.unlink(home.photo , (err) =>{
          if(err)
          {
            console.log("error while deleting file" , err);
          }
        });
        
        home.photo = req.file.path;
      }

      home
        .save()
        .then((result) => {
          console.log("home updated", result);
        })
        .catch((err) => {
          console.log("error while updating", err);
        });

      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.log("error while finding home", err);
    });
};

// const home = new Home(
//   houseName,
//   price,
//   location,
//   rating,
//   photo,
//   discription,
//   id
// );
