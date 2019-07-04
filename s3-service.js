const AWS = require('aws-sdk');
const fs = require("fs");
const Bucket = process.env.AWS_S3_BUCKET_NAME
const S3 = new AWS.S3()

const listAllObjects = async () => {
  try {
    const params = {
      Bucket,
    };
    let promise = new Promise((resolve, reject) => {
      const objectPromise = S3.listObjects(params).promise()
      objectPromise.then((obj) => resolve(obj)).catch((err) => reject(err))
    })
    return promise;
  }
  catch (error) {
    throw error;
  }
}

const list = () => {
  try {
    listAllObjects().then(
      (objects) => {
        if (objects.length) {
          objects.Contents.forEach((key) => {
            console.log(`${key.Key} found`)
          })
        }
        else {
          console.log("No files found")
        }
      })
  }
  catch (error) {
    throw error;
  }
}

const upload = (filePath, bucketpath = null) => {
  try {
    const file = fs.readFileSync(filePath);
    const filename = filePath.split('/').reverse()[0];
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filename,
      Body: JSON.stringify(file, null, 2)
    };
    if (bucketpath) {
      params.Key = `${bucketpath}/${filename}`;
    }
    const filePromise = S3.upload(params).promise();
    filePromise.then(
      (result) => {
        console.log(`${filename} (${result.Location}) uploaded successfully.`)
      })
  }
  catch (error) {
    throw error;
  }
}
const serchObject = async (string) => {
  try {
    const objects = await listAllObjects();
    let key = "";
    let match = ""
    let searchArray = []
    objects.Contents.map((Key) => {
      key = Key.Key.split('/').reverse()[0];
      match = key.includes(string);
      if (match) {
        searchArray.push(Key)
      }
      return key;
    })
    return searchArray;
  }
  catch (error) {
    throw error;
  }
}

const search = async (string) => {
  try {
    const searchArray = await serchObject(string);
    if (searchArray.length) {
      searchArray.forEach((key) => console.log(`${key.Key} found`))
    }
    else {
      console.log("No files found")
    }
  }
  catch (error) {
    throw error;
  }
}

const remove = async (string) => {
  try {
    const searchArray = await serchObject(string);
    if (searchArray.length) {
      const Objects = searchArray.map(data => ({
        Key: data.Key || data,
      }))
      const deleteObjectPromise = S3.deleteObjects({
        Bucket,
        Delete: {
          Objects,
          Quiet: false
        }
      }).promise();
      deleteObjectPromise.then(
        (objects) => {
          objects.Deleted.forEach((obj) => console.log(`${obj.Key} deleted`))
        })
    }
    else {
      console.log("No files found")
    }
  }
  catch (error) {
    console.log(error)
  }
}
module.exports = {
  list,
  upload,
  search,
  remove
}