const express = require('express');
const router = express.Router();
const managerController = require('../controller/managerController');
const accessControl = require('../controller/accessController').accessControl;

function setAccessControl(access_types){
    return(req,res,next)=>{
        accessControl(access_types,req,res,next)
    }
}

router.post('/changePassword/:id',managerController.changePassword);

module.exports = router;