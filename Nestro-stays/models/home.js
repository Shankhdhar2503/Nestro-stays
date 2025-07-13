const mongoose = require("mongoose");

const homeSchema = mongoose.Schema({
  houseName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  photo: String,
  discription: String,
});

//to delete all existance in all navigation koi bhi kahi se bhi delete karega to hamara pre hook call hoga
// homeSchema.pre('findOneAndDelete' , async function(next){
//   const homeId = this.getQuery()._id;
//   await favourite.deleteMany({houseId:homeId});
//   next();
// })

module.exports = mongoose.model("Home", homeSchema);

//     save()
//     static find()
//      static findById(homeId)
//      static deleteById(homeId)

//apko kuch bhi krne ki jroorat ni hh ye saare fn mongoose aapke liye add krr dega
