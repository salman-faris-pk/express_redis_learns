import mongoose from "mongoose"

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

noteSchema.index({ user: 1 });
noteSchema.index({ title: 'text', content: 'text' });

const Note = mongoose.model("Note", noteSchema);

export default Note;
