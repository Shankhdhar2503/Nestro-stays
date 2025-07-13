const Home = require("../models/home");
const { Result } = require("postcss");
const User = require("../models/user");

exports.getIndex = (req, res, next) => {
  console.log("Session value :" , req.session);
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedin:req.isLoggedin,
      user : req.session.user
    });
  });
};

exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedin:req.isLoggedin,
      user : req.session.user,
    });
  });
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  // console.log("At home details page" , homeId);
  Home.findById(homeId).then((home) => {
    if (!home) {
      console.log("home not found");
      res.redirect("/homes");
    } else {
      console.log("home details found", home);
      res.render("store/home-details", {
        home: home,
        pageTitle: "Home Details",
        currentPage: "Home",
        isLoggedin:req.isLoggedin,
        user : req.session.user,
      });
    }
  });
  // res.render("store/home-details",{
  //   pageTitle:"home details",
  //   currentPage:"Home",
  // })
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedin:req.isLoggedin,
    user : req.session.user,
  });
};

exports.getFavouriteList =async (req, res, next) => {
 const userId = req.session.user._id;
 const user = await User.findById(userId).populate('favourites');
   res.render("store/favourite-list", {
     favouriteHomes: user.favourites,
     pageTitle:   "My Favourites",
     currentPage: "favourites",
     isLoggedin:  req.isLoggedin,
     user : req.session.user,
});
}


exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body._id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if(!user.favourites.include(homeId))
  {
    user.favourites.push(homeId);
    await user.save();
  }

  res.redirect("/favourites"); 
  
}


 

exports.postRemoveFromFavourite =async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if(user.favourites.include(homeId))
  {
    user.favourites = user.favourites.filter(fav => fav != homeId);
    await user.save();
  }


      res.redirect("/favourites");
};
