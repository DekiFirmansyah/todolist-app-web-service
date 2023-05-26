const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// get config vars
dotenv.config();