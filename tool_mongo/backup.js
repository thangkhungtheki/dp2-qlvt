const { exec } = require('child_process');
require('dotenv').config(); // Đảm bảo bạn đã cài đặt mô-đun dotenv

function backupMongo(uri, callback) {
    const databaseUrl = uri;
    const backupFilePath = '/backup/'; // Thay đổi tên tệp và đường dẫn nếu cần thiết

    if (!databaseUrl) {
        const error = new Error('DATABASE_URL is not defined in the environment variables.');
        return callback(error);
    }

    const cmd = `mongodump --uri "${databaseUrl}" --archive=${backupFilePath} --gzip`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            return callback(error);
        } else {
            console.log(`Backup successful. Exported to: ${backupFilePath}`);
            // convertToJS(backupFilePath, callback);
        }
    });
}
// backupMongo((e, result)=> {
//     if (e) {
//         console.error(`Error: ${e.message}`);
//     } else {
//         console.log(`Backup and conversion successful. Exported to: ${result}`);
//         // Add logic to integrate the .js file into your application here
//     }
// })
// url = "mongodb://127.0.0.1:27017/qlvt"
function restoremongo(url) {
    const databaseUrl = url;
    const backupFilePath = '/backup/archive.gz'; // Thay đổi tên tệp và đường dẫn nếu cần thiết

    if (!databaseUrl) {
        console.error('DATABASE_URL is not defined in the environment variables.');
        process.exit(1);
    }

    const cmd = `mongorestore --uri "${databaseUrl}" --gzip --archive=${backupFilePath}`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
        } else {
            console.log(`Restore successful from: ${backupFilePath}`);
        }
    });
}


module.exports = {
    restoremongo,
    backupMongo,
}