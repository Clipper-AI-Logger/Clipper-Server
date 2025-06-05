const express = require("express");
const cors = require("cors");
const db = require("./src/config/database.js");

require("dotenv").config();

const app = express();
const port = process.env.PORT | 8000;

const editRouter = require("./src/routes/edit-route.js");
const premiumRouter = require("./src/routes/premium-route.js");
const aiRouter = require("./src/routes/ai-route.js");
const getResultRouter = require("./src/routes/getResult-route.js");

app.use(cors());
app.use(express.json({limit: '2000mb'}));
app.use(express.urlencoded({ extended: false }));

app.use("/edit", editRouter);
app.use("/premium", premiumRouter);
app.use("/ai", aiRouter);
app.use("/result", getResultRouter);

app.listen(port, (err) => {
    if (err) return console.log(err);
    console.log("**----------------------------------**");
    console.log("====      Server is On...!!!      ====");
    console.log("**----------------------------------**");
})