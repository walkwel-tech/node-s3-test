require("dotenv").config();
const program = require('commander');
const { prompt } = require('inquirer');
const { list, upload, search, remove } = require('./s3-service');

program
  .command('list').action(() => {
    list()
 
  });

program
  .command('upload <filepath>').action((filepath) => {
    prompt({
      type: 'input',
      name: 'option',
      message: 'Do you want to specify a S3 folder?(y/N)'
    }).then(option => {
      if (option.option == "y") {
        prompt({
          type: 'input',
          name: 'bucketpath',
          message: 'Enter Bucket path'
        }).then(bucketpath => {
          upload(filepath, bucketpath.bucketpath);
        })
      }
      else {
        upload(filepath, bucketpath = null);
      }
    });
  });

program
  .command('search <regex>').action((string) => {
    search(string, 1);
  })

program
  .command('delete <regex>').action((string) => {
    remove(string);
  });

program.parse(process.argv);