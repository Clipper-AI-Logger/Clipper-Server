const express = require("express");
const cors = require("cors");
const db = require("./src/config/database.js");
const s3Manager = require("./src/util/s3-manager.js");

require("dotenv").config();

const app = express();
const port = process.env.PORT | 8000;

app.use(cors());
app.use(express.json({limit: '2048mb'}));
app.use(express.urlencoded({limit: '2048mb', extended: true}));

app.use("/premium", require("./src/routes/premium-route.js"));
app.use("/ai", require("./src/routes/ai-route.js"));
app.use("/edit", require("./src/routes/edit-route.js"));

async function startServer() {
    try {
        await s3Manager.initialize();
        app.listen(port, () => {
            console.log("**----------------------------------**");
            console.log("====      Server is On...!!!      ====");
            console.log(`====  Current Folder: ${s3Manager.getNextFolderNumber()}  ====`);
            console.log("**----------------------------------**");
        });
    } catch (error) {
        console.error('서버 시작 실패:', error);
    }
}

startServer();