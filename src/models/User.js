import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  }, { timestamps: true });
  

  userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 8);
    }
    next();
  });
  
  userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
  };

  const User=mongoose.model("User", userSchema);

  export default User;