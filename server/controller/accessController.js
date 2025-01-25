const jwt = require('jsonwebtoken');
let user = require('../db/model/userModel');
const dotenv = require('dotenv');
dotenv.config();
const control_data = require('../Controller/contol-Data.json');

exports.accessControl = async function (access_types, req, res, next) {
  try {
    if (access_types === '*') {
      // Allow unrestricted access for all roles
      return next();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        message: 'Please login to continue',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(400).json({
        message: 'Invalid access token',
      });
    }

    jwt.verify(token, process.env.PRIVATE_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: err.message || 'Authentication failed',
        });
      }

      // Fetch user details from the database
      const user_data = await user.findOne({ _id: decoded.id });
      if (!user_data) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      // Extract user role
      const user_role = user_data.role || 'user';  // Default role is 'user' if not found
      console.log('Extracted user role:', user_role);

      // Verify if the role has permission to access the resource
      const allowedRoles = access_types.split(',').map((type) => control_data[type]);
      
      // Flatten the allowedRoles array if it's an array of arrays
      const flattenedAllowedRoles = [].concat(...allowedRoles); 

      if (!flattenedAllowedRoles.includes(user_role)) {
        return res.status(403).json({
          message: 'Not allowed to access the route',
        });
      }

      // Attach user and role to the request object for further use in the route
      req.user = {
        id: user_data._id,
        role: user_role,
      };
      req.user_data = user_data;

      next();  // Proceed to the next middleware/route handler
    });
  } catch (error) {
    console.error('Access control error:', error);
    res.status(500).json({
      message: error.message || 'Something went wrong',
    });
  }
};
