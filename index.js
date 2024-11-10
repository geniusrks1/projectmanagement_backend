const mongoose = require("mongoose"); 1
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
app.use(cors());


const bodyParser = require("body-parser");
dotenv.config();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const taskrouter=require("./routes/task");

app.use("/api/v1", indexRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tasks",taskrouter);

app.get('/',(req,res)=>{
    res.status(200).json({
        message:"welcome to project managent apis",
         api1:"visit /api/v1/tasks",
         api2:"visit /api/v1/users"

        })
})

app.all('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: 'Route does not exist'
    });
});

                                          
app.listen(process.env.PORT, () => {
    console.log("Server is running on port ",process.env.PORT);
    mongoose.connect(process.env.MONGOOSE_URI_STRING,{});

    mongoose.connection.on("error connecting in db", (err) => {
        console.log(err);
    });
    console.log("db connected");
});



