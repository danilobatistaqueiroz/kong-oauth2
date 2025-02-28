var request    = require('request');
var url        = require('url');
var bodyParser = require('body-parser');
var express    = require("express");
var app        = express();

var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

require('dotenv').config()

app.set('view engine', 'jade');
app.use(bodyParser());


/* ******************** Prometheus ******************** */
// https://grafana.com/grafana/dashboards/11159-nodejs-application-dashboard/

//import { collectDefaultMetrics } from 'prom-client';
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });
/* ******************** Prometheus ******************** */


// Accept every SSL certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function load_env_variable(name) {
  var value = process.env[name];
  if (value) {
    console.log(name + " is " + value);
    return value;
  } else {
    console.error("You need to specify a value for the environment variable: " + name);
    process.exit(1);
  }
}

/*
  This is the secret provision key that the plugin has generated
  after being added to the API
*/
var PROVISION_KEY = load_env_variable("PROVISION_KEY");

/*
  This is the host for the service that OAuth2.0 applies to
*/
var SERVICE_HOST = load_env_variable("SERVICE_HOST")

/*
  URLs to Kong
*/
var KONG_ADMIN = load_env_variable("KONG_ADMIN");
var KONG_API = load_env_variable("KONG_API");

/*
  The path to the API, required later when making a request
  to authorize the OAuth 2.0 client application
*/
var API_PATH = load_env_variable("API_PATH");

/* 
  The scopes that we support, with their extended
  description for a nicer frontend user experience
*/
var SCOPE_DESCRIPTIONS = JSON.parse(load_env_variable("SCOPES"));

/* 
  The port the authorization server listens on. Defaults to 3000.
*/
var LISTEN_PORT = process.env["LISTEN_PORT"] || 3000

/*
  Retrieves the OAuth 2.0 client application name from
  a given client_id - used for a nicer fronted experience
*/
function get_application_name(client_id, callback) {
  request({
    method: "GET",
    url: KONG_ADMIN + "/oauth2/" + client_id
  }, function(error, response, body) {
    var application_name;
    if (client_id && !error) {
      console.log(body)
      var json_response = JSON.parse(body);
      //if (json_response.data.length == 1) {
        application_name = json_response.name;
      //}
    }
    callback(application_name);
  });
}

/*
  The POST request to Kong that will actually try to
  authorize the OAuth 2.0 client application after the
  user submits the form
*/
async function authorize(client_id, response_type, scope, callback) {
  console.log('authorize', client_id, response_type, scope, callback);
  console.log(KONG_API, API_PATH, SERVICE_HOST, PROVISION_KEY);
  console.log('post to /oauth2/authorize')
  request({
    method: "POST",
    url: KONG_API + API_PATH + "/oauth2/authorize",
    headers: {
      Host: SERVICE_HOST
    },
    form: { 
      client_id: client_id, 
      response_type: response_type, 
      scope: scope, 
      provision_key: PROVISION_KEY,
      authenticated_userid: "123" // Hard-coding this value (it should be the logged-in user ID)
      ,redirect_uri: 'https://eletron:3443/authorized'
    }
  }, function(error, response, body) {
    callback(JSON.parse(body).redirect_uri);
  });
}

/*
  The route that shows the authorization page
*/
app.get('/authorize', function(req, res) {
  console.log('get /authorize');
  var querystring = url.parse(req.url, true).query;
  get_application_name(querystring.client_id, function(application_name) {
    if (application_name) {
      res.render('authorization', { 
        client_id: querystring.client_id,
        response_type: querystring.response_type,
        scope: querystring.scope,
        application_name: application_name,
        SCOPE_DESCRIPTIONS: SCOPE_DESCRIPTIONS 
      });
    } else {
      res.status(403).send("Invalid client_id");
    }
  });
});

app.get('/authorized', function(req, res) {
  console.log('get /authorized');
  const query = url.parse(req.url,true).query;
  console.log(req.url)
  console.log(query.code);

  //res.send("Authorization successful!");

  request({
    method: "POST",
    url: KONG_API + API_PATH + "/oauth2/token",
    headers: {
      Host: SERVICE_HOST
    },
    form: { 
      grant_type: 'authorization_code', 
      client_id: 'eL6jViy2830HkzLu9i32tewQ7IqvhWrx', 
      client_secret: '2axXyIJw57bgxIjnBCvFFIRucZbs7ayD',
      //redirect_uri: 'https://eletron:3443/dashboard',
      code: query.code
    }
  }, function(error, response, body) {
    //console.log(JSON.parse(body));
    localStorage.setItem('refresh_token',JSON.parse(body).refresh_token);
    localStorage.setItem('access_token',JSON.parse(body).access_token);
    res.redirect('/dashboard')
  });
});

app.get('/mock', function(req,res) {
  console.log('mock route');
  console.log(localStorage.getItem('access_token'));
  res.send("MOCK!");
});

app.get('/about', function(req,res) {
  console.log('about route');
  console.log(localStorage.getItem('access_token'));
  res.send("about!!!!!!!");
});

app.get('/dashboard', function(req,res) {
  console.log('dashboard route');
  res.render('dashboard');
});

app.get('/users', async function(req,res) {
  console.log(' users route', localStorage.getItem('access_token'));
  const response = await fetch('https://eletron:8443/users',{ 
    method: 'get', 
    headers: new Headers({
        'Authorization': 'Bearer '+localStorage.getItem('access_token'), 
    })
  });
  const json = await response.json();
  res.body = json;
  res.send(json);
});

/*
  The route that handles the form submit, that will
  authorize the client application and redirect the user
*/
app.post('/authorize', function(req, res) {
  console.log('post /authorize', req.body.client_id, req.body.response_type, req.body.scope);
  authorize(req.body.client_id, req.body.response_type, req.body.scope, function(redirect_uri) {
    console.log("redirect_uri: " + redirect_uri)
    res.redirect(redirect_uri);
  });
});

/*
  Index page
*/

app.get("/", function(req, res) {
  res.render('index');
});

//app.listen(LISTEN_PORT);

const fs = require('fs')
const http = require('http')
const https = require('https')

const privateKey  = fs.readFileSync('./ssl/client.key', 'utf8')
const certificate = fs.readFileSync('./ssl/client.pem', 'utf8')
const credentials = {key: privateKey, cert: certificate}
const httpServer = http.createServer(app)
const httpsServer = https.createServer(credentials, app)
httpServer.listen(3000)
httpsServer.listen(3443)


console.log("Running at Port " + 3000 + " HTTPS " + 3443);