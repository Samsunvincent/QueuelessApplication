const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const mongoConnect = require('../server/db/connect');
mongoConnect();

const userRouter = require('../server/Router/userRouter');
const authRouter = require('../server/Router/authRouter');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(userRouter)
app.use(authRouter)


app.listen(process.env.PORT , () =>{
    console.log(`server connection is established at port ${process.env.PORT}`);
})
