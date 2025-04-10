import express from "express"
import { addToPinned, createNote,getAllNotes,getAllPinnedNotes,getSingleNote } from "../controllers/noteController.js"
import verifyAuth from "../middleware/auth.js"

const router=express.Router();

router.post('/create', verifyAuth, createNote);
router.get('/',verifyAuth,getAllNotes)
router.get('/pinned', verifyAuth,getAllPinnedNotes);
router.get('/:id', verifyAuth, getSingleNote);
router.patch('/:id/pin', verifyAuth,addToPinned);



export default router;
