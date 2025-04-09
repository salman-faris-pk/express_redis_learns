import {body, validationResult} from "express-validator"

const emailValidator= body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail();

const passwordValidator = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long');

export const validateRegisterInputs = [
    body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),

    emailValidator,
    passwordValidator,

    (req,res, next)=> {
        const errors= validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }
          next();
    }

];

export const validateLoginInput = [
    emailValidator,
    
    body('password')
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage('Password is required'),
      

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ];