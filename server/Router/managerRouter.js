const express = require('express');
const router = express.Router();
const managerController = require('../controller/managerController');
const accessControl = require('../controller/accessController').accessControl;
const upload = require('../utils/FileUpload');

function setAccessControl(access_types) {
    return (req, res, next) => {
        accessControl(access_types, req, res, next)
    }
}

router.post('/changePassword/:id', managerController.changePassword);
router.post('/addCategory', setAccessControl('1,3'), managerController.addCategory);
router.post('/addProduct', setAccessControl('1,3'), upload, managerController.addProduct);

module.exports = router;