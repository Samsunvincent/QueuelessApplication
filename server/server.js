const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const mongoConnect = require('../server/db/connect');
mongoConnect();
const path = require('path')


const userRouter = require('../server/Router/userRouter');
const authRouter = require('../server/Router/authRouter');
const adminRouter = require('../server/Router/adminRouter');
const managerRouter = require('../server/Router/managerRouter');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(userRouter)
app.use(authRouter)
app.use(adminRouter);
app.use(managerRouter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.listen(process.env.PORT, () => {
    console.log(`server connection is established at port ${process.env.PORT}`);
})
