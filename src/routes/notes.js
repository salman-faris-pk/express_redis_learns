import express from "express"
import { createNote,getAllNotes,getSingleNote } from "../controllers/noteController.js"
import verifyAuth from "../middleware/auth.js"

const router=express.Router();

router.post('/create', verifyAuth, createNote);
router.get('/:id', verifyAuth, getSingleNote);
router.get('/',verifyAuth,getAllNotes)



export default router;
