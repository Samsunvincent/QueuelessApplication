const express = require('express');
const router = express.Router();

const adminController = require('../controller/adminController');
const accessControl = require('../controller/accessController').accessControl

function setAccessControl(access_types){
    return(req,res,next)=>{
        accessControl(access_types,req,res,next)
    }
}

router.post('/addManager',setAccessControl("1"),adminController.addManager)

module.exports = router