const dotenv=require('dotenv')
dotenv.config();
const express=require('express')
const cors=require('cors')
const app=express()
const connectTODb=require('./db')
connectTODb()

app.use(cors());
app.use(express.json())

app.get('/', (req, res)=>{
    res.send("Hello World welcome to MNNIT")
})

module.exports=app;