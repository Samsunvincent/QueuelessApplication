const accessControl = require('../controller/accessController').accessControl;
const express = require('express');;
const router = express.Router();
const userController = require('../controller/userController');


function setAccessControl(access_types){
    return(req,res,next)=>{
        accessControl(access_types,req,res,next)
    }
}

router.post('/registerUser',userController.registerUser);


module.exports = router;