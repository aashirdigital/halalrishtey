const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  msId: {
    type: String,
    required: [true, "msId is required"],
  },
  username: {
    type: String,
    required: [true, "name is required"],
  },
  images: {
    type: Array,
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  emailOtp: {
    type: String,
  },
  mobileOtp: {
    type: String,
  },
  mobile: {
    type: String,
    unique: true,
    default: null,
  },
  mobileVerified: {
    type: String,
    default: "No",
  },
  idVerified: {
    type: String,
    default: "No",
  },
  gender: {
    type: String,
    required: [true, "gender is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  isActive: {
    type: String,
    default: "No",
  },
  isDeleted: {
    type: String,
    default: "No",
  },
  isVerified: {
    type: String,
    default: "No",
  },
  age: {
    type: String,
    default: null,
  },
  maritalStatus: {
    type: String,
    default: null,
  },
  height: {
    type: String,
    default: null,
  },
  weight: {
    type: String,
    default: null,
  },
  bodyType: {
    type: String,
    default: null,
  },
  // basic detials
  profileCreatedFor: {
    type: String,
    required: [true, "profileCreatedFor is required"],
  },
  disability: {
    type: String,
    default: "No",
  },
  // Religious bg
  religion: {
    type: String,
    default: "Islam - Muslim",
  },
  language: {
    type: String,
    default: null,
  },
  community: {
    type: String,
    default: null,
  },
  maslak: {
    type: String,
    default: null,
  },
  // Family
  fatherName: {
    type: String,
    default: null,
  },
  fatherStatus: {
    type: String,
    default: null,
  },
  motherStatus: {
    type: String,
    default: null,
  },
  brothers: {
    type: String,
    default: null,
  },
  brothersMarried: {
    type: String,
    default: null,
  },
  sisters: {
    type: String,
    default: null,
  },
  sistersMarried: {
    type: String,
    default: null,
  },
  familyType: {
    type: String,
    default: null,
  },
  nativePlace: {
    type: String,
    default: null,
  },
  // more religious details

  namaaz: {
    type: String,
    default: null,
  },
  zakat: {
    type: String,
    default: null,
  },
  fasting: {
    type: String,
    default: null,
  },
  // education
  qualification: {
    type: String,
    default: null,
  },
  collegeName: {
    type: String,
    default: null,
  },
  workingWith: {
    type: String,
    default: null,
  },
  employedAs: {
    type: String,
    default: null,
  },
  salary: {
    type: String,
    default: null,
  },
  companyName: {
    type: String,
    default: null,
  },
  // lifestyle
  diet: {
    type: String,
    default: null,
  },
  //location
  country: {
    type: String,
    default: null,
  },
  state: {
    type: String,
    default: null,
  },
  city: {
    type: String,
    default: null,
  },
  // about yourself
  about: {
    type: String,
    default: null,
  },
  // partner preference
  partnerAgeFrom: {
    type: String,
    default: null,
  },
  partnerAgeTo: {
    type: String,
    default: null,
  },
  partnerReligion: {
    type: String,
    default: "Muslim - Islam",
  },
  partnerLanguage: {
    type: String,
    default: null,
  },
  partnerMaritalStatus: {
    type: String,
    default: null,
  },
  partnerCountry: {
    type: String,
    default: null,
  },
  partnerState: {
    type: String,
    default: null,
  },
  partnerCity: {
    type: String,
    default: null,
  },
  partnerEducation: {
    type: String,
    default: null,
  },
  partnerWorkingWith: {
    type: String,
    default: "Doesn't Matter",
  },
  partnerEmployedAs: {
    type: String,
    default: "Doesn't Matter",
  },
  partnerSalary: {
    type: String,
    default: "Doesn't Matter",
  },
  partnerProfileCreatedFor: {
    type: String,
    default: "Doesn't Matter",
  },
  partnerDiet: {
    type: String,
    default: "Doesn't Matter",
  },

  // premium
  contacts: {
    type: String,
    default: 0,
  },
  contactData: {
    type: Array,
  },
  likesCount: {
    type: String,
    default: 0,
  },
  likesData: {
    type: Array,
  },
  newsLetter: {
    type: String,
  },
  // Likes
  received: {
    type: Array,
  },
  accepted: {
    type: Array,
  },
  sent: {
    type: Array,
  },
  deleted: {
    type: Array,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  photoPrivacy: {
    type: String,
    default: "Visible to all Members",
  },
  idProof: {
    type: String,
    default: null,
  },
});

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
