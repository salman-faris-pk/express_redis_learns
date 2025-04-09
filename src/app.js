import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import { errorHandler,notFound } from "./middleware/error.js"
import ratelimit from "./middleware/ratelimit.js"
import userRoutes from "./routes/users.js"

const app = express();


app.use(morgan("dev"));
app.use(cookieParser()); 
app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(cors())

app.get("/health", (req, res) => {
    res.sendStatus(200); 
});

app.use('/api/users',userRoutes);
// app.use('/api/notes', require('./routes/notes'));

app.use(ratelimit)
app.use(notFound);
app.use(errorHandler);


export default app;
