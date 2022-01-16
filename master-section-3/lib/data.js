// jshint esnext: true

// Dependencies
const fs = require('fs'),
      path = require('path');

// Data container
const lib = {};

// Set Base directory of data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// CREATE new file from data
lib.create = (dir, file, data, callback) => {
    // Open file for writing
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fd) => {
        if (!err && fd) {
            // Parse data to string
            const dataParsed = JSON.stringify(data);
            // Write file and close it
            fs.writeFile(fd, dataParsed, (err) => {
                if (!err) {
                    fs.close(fd, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    });
                } else {
                    callback('Error writing new file');
                }
            });
        } else {
            callback('Could not create new file, it may already exist');
        }
    });
};

// READ data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8', (err, data) => {
        callback(err, data);
    });
};

// UPDATE data from a file
lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fd) => {
        if (!err && fd) {
            // Parse data
            const dataParsed = JSON.stringify(data);
            // Truncate file: Removing content's file without deleting the file
            fs.ftruncate(fd, (err) => {
                if (!err) {
                    // Update file and close it
                    fs.writeFile(fd, dataParsed, (err) => {
                        if (!err) {
                            fs.close(fs, (err) => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing the file');
                                }
                            });
                        } else {
                            callback('Error writing the existing file');
                        }
                    });                    
                } else {
                    callback('Error truncating the file');
                }
            });
        } else {
            callback('Error: the file could not be open, it may not exists');
        }
    });
};

// DELETE a file
lib.delete = (dir, file, callback) => {
    // Unlink the file from the FS
    fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err, fd) => {
        if (!err && fd) {
            // Parse
        } else {
            
        }
    });
};

// Export Data module
