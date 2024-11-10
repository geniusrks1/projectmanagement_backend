const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const { User } = require("../schema/user.schema");
const dotenv = require("dotenv");
const protectedMiddleware = require("../middleware/auth");

dotenv.config();
// register an user

router.post("/register", async(req,res)=>{
    try {
        const { email, name, password, confirmPassword } = req.body;
    
        const existingUser = await User.findOne({email});

        if (existingUser) {
          return res.status(400).json({
            status: 'error',
            message: 'Email already exists',
          });
        }
    
        const user = await User.create({ email, name, password, confirmPassword });
    
        res.status(200).json({
          status: 'success',
          data: user,
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          message: error.message || 'An error occurred while registering the user.',
        });
      }

})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and Password are required!',
      });
    }


    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Email not registered. Please register first.',
      });
    }


    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: 'error',
        message: 'Incorrect password. Please try again.',
      });
    }

    
    const token = jsonwebtoken.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

   
    res.status(200).json({
      message: 'success',
      data: {
        info: { email: user.email, name: user.name, _id: user._id },
        token,
      },
    });
  } 
  catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred during login.',
    });
  }
});



router.get("/",protectedMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { info: { name: user.name, email: user.email, _id: user._id } },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred. Please try again.',
    });
  }
}
)





router.patch("/", protectedMiddleware, async (req, res) => {
  try {
    const { name, newPassword, oldPassword } = req.body;
    let hashPassword;

    // Check if newPassword is provided
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'You must provide your old password to update your password.',
        });
      } else {
        const user = await User.findById(req.user._id).select('+password');

        // Verify if oldPassword matches
        if (!(await bcrypt.compare(oldPassword, user.password))) {
          return res.status(400).json({
            status: 'error',
            message: 'Old password is incorrect',
          });
        }

        // Hash the new password
        hashPassword = await bcrypt.hash(newPassword, 12);
      }
    }

    // Use Object.fromEntries to filter out undefined values
    const updatedObj = Object.fromEntries(
      Object.entries({ name, password: hashPassword }).filter(([_, v]) => v != null)
    );

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedObj, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred. Please try again.',
    });
  }
});


module.exports = router;




