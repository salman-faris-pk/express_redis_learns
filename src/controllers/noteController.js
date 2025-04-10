import Note from "../models/Note.js"
import { redis } from "../config/redis.js"
import { invalidateNotesCache } from "../utils/helper.js"



const createNote=async(req,res) => {
    try {
        const { title, content } = req.body;
        const note=new Note({
          title,
          content,
          user:req.user._id,
        });

        await note.save();

        await invalidateNotesCache(req.user._id);

        return  res.status(201).send(note);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
};

const getSingleNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    
    const cachedNote = await redis.hGet(`note:${noteId}`, 'data');

    console.log("cached",JSON.parse(cachedNote));
    
    
    if (cachedNote) {
      return res.send(JSON.parse(cachedNote));
    }
    
    const note = await Note.findOne({ 
      _id: noteId, 
      user: req.user._id 
    });
    
    if (!note) {
      return res.status(404).send({ error: 'Note not found' });
    }
    
    await redis.hSet(`note:${noteId}`, 'data', JSON.stringify(note));
    await redis.expire(`note:${noteId}`, 3600);
    
    res.send(note);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};


const getAllNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const cacheKey = `notes:page:${page}:limit:${limit}:user:${req.user._id}`;
    
    const cachedNotes = await redis.hGet(cacheKey, 'data');
         
    if (cachedNotes) {
      return res.send(JSON.parse(cachedNotes));
    }
    
    const notes = await Note.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Note.countDocuments({ user: req.user._id });
    
    const response = {
      data: notes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
    
    await redis.hSet(cacheKey, 'data', JSON.stringify(response));
    await redis.expire(cacheKey, 900);
    
    res.send(response);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};


export {
  createNote,
  getSingleNote,
  getAllNotes,
}