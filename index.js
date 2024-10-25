const mongoose = require("mongoose"); 1
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const { incomingRequestLogger } = require("./middleware/index.js");
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const jobRouter = require("./routes/job");
const taskrouter=require("./routes/task");
const { mongo } = require("mongoose");
const urlencoded = require("body-parser/lib/types/urlencoded.js");
const { header } = require("express-validator");
app.use(incomingRequestLogger);
app.use("/api/v1", indexRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/task",taskrouter);

app.get('/',(req,res)=>{
    res.status(200).json({
        message:"welcome to project managent apis",
         api1:"visit /api/v1/task",
         api2:"visit /api/v1/user"

        })
})
app.listen(process.env.PORT, () => {
    console.log("Server is running on port 8000");
    mongoose.connect(process.env.MONGOOSE_URI_STRING, {

    });

    mongoose.connection.on("error connecting in db", (err) => {
        console.log(err);
    });
    console.log("db connected");
});



