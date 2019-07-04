# node-s3-test

A CLI tool to interact with S3 bucket. This requires NodeJs v8.x or later.

## Installation

```
git clone https://github.com/walkwel-tech/node-s3-test.git
cd node-s3-test
npm install
```

## Setup

Copy .env.sample to .env

```
cp .env.sample .env
```

Specify your AWS access key, secret and bucket name in .env file.

## Usage

List all objects

```
node index.js list
```

Upload an object

```
node index.js upload <LOCAL_FILE_PATH> <S3_FOLDER_PATH>
```

Search an object

```
node index.js search <SEARCH_STRING>
```

Delete an object

```
node index.js delete <SEARCH_STRING>
```
