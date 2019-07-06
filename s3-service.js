const fs = require("fs");
const AWS = require('aws-sdk');

const { prompt } = require('inquirer');
const S3 = new AWS.S3();
const BUCKET = process.env.AWS_S3_BUCKET_NAME;
const MAXKEYS = process.env.MAX_KEYS;
let params = {
  Bucket: BUCKET,
  MaxKeys: MAXKEYS
};


const listAllObjects = async (params) => {
  try {
    return new Promise((resolve, reject) => {
      const objectPromise = S3.listObjects(params).promise()
      objectPromise.then((obj) => resolve(obj)).catch((err) => reject(err))
    })
  }
  catch (error) {
    throw error;
  }
}

const loadAllFilesWithPagination = (params) => {
  try {
    return new Promise((resolve, reject) => {
      const objectPromise = S3.listObjects(params).promise()
      objectPromise.then((obj) => resolve(obj)).catch((err) => reject(err))
    })
  }
  catch (error) {
    throw error;
  }
}
let allObjectsData = [];
let page = 0;
const openPrompt = (Marker) => {
  prompt({
    type: 'input',
    name: 'option',
    message: 'Enter N for next P for previous Q for quit'
  }).then(async (option) => {
    switch (option.option) {
      case 'Q':
      case 'q':
        return;

      case 'n':
      case 'N':
        page++;
        await list(Marker);
        return;

      case 'p':
      case 'P':
        if (page === 0) {
          console.log("No contnet to list enter N");
          openPrompt()
        }
        else { listPrevious() }
        break;

      default:
        break;
    }
  })
}

const listPrevious = async () => {
  page--;
  let content = allObjectsData[page];
  if (content.length) {
    allObjectsData[page].forEach((obj) => {
      console.log(`${obj.Key} found`);
    })
  }
  openPrompt()
}
const list = async (marker = null) => {
  try {
    if (marker) {
      params.Marker = marker
    }
    const objects = await loadAllFilesWithPagination(params);
    if (objects.Contents.length) {
      allObjectsData.push(objects.Contents)
      Marker = objects.Contents[objects.Contents.length - 1].Key;
      objects.Contents.forEach((obj) => {
        console.log(`${obj.Key} found`);
      })
      openPrompt(Marker)
    }
    else {
      console.log('No objects found ');
    }
    return objects;

  }
  catch (error) {
    throw error;
  }
}

const serchObject = async (string) => {
  try {
    const params = {
      Bucket: BUCKET,
    };
    const objects = await listAllObjects(params);
    let key = "";
    let searchArray = []
    objects.Contents.map((Key) => {
      key = Key.Key.split('/').reverse()[0];
      regex = RegExp(string, "i");
      if (regex.test(key)) {
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


const upload = (filePath, bucketpath = null) => {
  try {
    const file = fs.readFileSync(filePath);
    const filename = filePath.split('/').reverse()[0];
    const params = {
      Bucket: BUCKET,
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

const search = async (string, page = 1) => {
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
        Key: data.Key,
      }))
      const deleteObjectPromise = S3.deleteObjects({
        Bucket: BUCKET,
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