const express = require("express");
const cors = require("cors");
const db = require("./src/config/database.js");
const S3Manager = require("./src/util/s3-manager.js");

require("dotenv").config();

let currentFolderNumber = 0;
let isGettingFolderNumber = false;

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({limit: '2048mb'}));
app.use(express.urlencoded({limit: '2048mb', extended: true}));

app.use("/edit", require("./src/routes/edit-route.js"));
app.use("/premium", require("./src/routes/premium-route.js"));
app.use("/getResult", require("./src/routes/getResult-route.js"));

async function startServer() {
    try {
        const s3Manager = new S3Manager();
        const response = await s3Manager.s3.listObjectsV2({
            Bucket: s3Manager.bucketName,
            Prefix: 'uploadVideos/',
            Delimiter: '/'
        }).promise();

        const files = response.Contents || [];
        const fileNumbers = files
            .map(file => {
                const match = file.Key.match(/uploadVideos\/(\d+)\.zip/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(num => !isNaN(num));

        currentFolderNumber = fileNumbers.length > 0 ? Math.max(...fileNumbers) : 0;
        
        app.listen(port, () => {
            console.log("**----------------------------------**");
            console.log("====      Server is On...!!!      ====");
            console.log("**----------------------------------**");
        });
    } catch (error) {
        console.error('서버 시작 실패:', error);
    }
}

S3Manager.setGlobalState({
    getCurrentFolderNumber: () => currentFolderNumber,
    setCurrentFolderNumber: (num) => { currentFolderNumber = num; },
    isGettingFolderNumber: () => isGettingFolderNumber,
    setIsGettingFolderNumber: (state) => { isGettingFolderNumber = state; }
});

startServer();