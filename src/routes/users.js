import express from "express"
const router=express.Router();
import {login,logout,refreshToken,register,getUser, getAllUsers} from "../controllers/userController.js"
import verifyAuth from "../middleware/auth.js"
import {validateLoginInput,validateRegisterInputs} from "../middleware/validators.js"

router.post('/register',validateRegisterInputs,register);
router.post('/login',validateLoginInput,login);
router.post('/refresh',refreshToken);
router.post('/logout',verifyAuth,logout)

router.get('/:id',verifyAuth,getUser)
router.get('/', verifyAuth, getAllUsers);


export default router
