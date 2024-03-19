import mongoose, { connect } from "mongoose"
import logger from "../../logger"
import createHttpError from "http-errors";
import { MongoClient, MongoClientOptions } from 'mongodb';
import { cli } from "winston/lib/winston/config";



//start DB connnection 
const uri = 'mongodb+srv://Test:test123@cluster0.ljwx1rl.mongodb.net/typescriptDB?retryWrites=true&w=majority';
mongoose.connect(uri).then(() => {
  console.log(`connnection successful`);
}).catch((err) => console.log(`no connection` + err));
//End db connection here...




