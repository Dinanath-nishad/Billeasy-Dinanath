import mongoose, { connect } from "mongoose"


const uri = 'mongodb+srv://Test:test123@cluster0.ljwx1rl.mongodb.net/ChatApp?retryWrites=true&w=majority';
mongoose.connect(uri).then(() => {
  console.log(`connnection successful`);
}).catch((err) => console.log(`no connection` + err));





