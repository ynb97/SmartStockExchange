/*********************************************************************/
/* server side app to get and post to the composer network REST API  */
/*********************************************************************/
const _ = require("underscore");
const express = require('express');
const app = express();
app.set("view engine", "ejs");
// var http = require('http-client');
// var cookieParser = require('cookie-parser');
// app.use(cookieParser());
let act = 0;
// var tokn;
// var Http = new http();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

var Client = require('node-rest-client').Client;
var client = new Client();
/*
  allow cross domain access
*/
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


function getCookie(cname, resp) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(resp.get('Cookie'));
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// declare
// var gapi;
// // var googleUser;
// var auth2;
// var clientId = '1088454258427-cvetgr7voh31f323krt8fha7rpbs1vd3.apps.googleusercontent.com';
// var scope = [
//   'https://www.googleapis.com/auth/plus.login'
// ].join(' ');


// // var googleInit() {
// //   if (gapi) {
//     gapi.load('auth2', () => {
//       this.auth2 = gapi.auth2.init({
//         client_id: this.clientId,
//         scope: this.scope
//       });
//       this.attachSignin(document.getElementById('googleLogin'));
//       this.init();
//     });
//   } else {
//     setTimeout(() => {
//       this.googleInit();
//     }, 500);
//   }
// }

// public attachSignin(element) {
  // this.auth2.attachClickHandler(element, {},
  //   (googleUser) => {
  //     let profile = googleUser.getBasicProfile();
  //     console.log('Token || ' + googleUser.getAuthResponse().id_token);
  //     console.log('ID: ' + profile.getId());
  //     // ...
  //   },
  //   function (error) {
  //     console.log(JSON.stringify(error, undefined, 2));
  //   });
// }

// init() {
//   this.auth2.isSignedIn.listen(this.signinChanged);
//   this.auth2.currentUser.listen(this.userChanged);
//   this.refreshValues();
// };

// signinChanged = (val) => {
//   console.log('google ### signinChanged', val);
// }
// /**
//  * Listener method for when the user changes.
//  *
//  * @param {GoogleUser} user the updated user.
//  */
// userChanged = (user) => {
//   console.log('google ### User now: ', user);
//   this.googleUser = user;
//   this.updateGoogleUser();
// };


app.get("/", function (req, res) {
  res.render("home");
});


app.get("/githublogin", function(req, res){
  res.redirect("http://localhost:3000/auth/github");
  act = getCookie('access_token', req);
  act = act.substr(2, 64);
  console.log("Login by github");
  console.log(req.cookies);
  console.log(req.cookies['access_token']);
});

app.get("/googlelogin", function(req, res){

    res.redirect("http://localhost:3000/auth/google");

  
act = getCookie('access_token',req);
act = act.substr(2,64);
  // console.log(act.substr(2,64));
  // console.log(req.cookies);
  console.log(req.cookies['access_token']);
});

app.get("/getatoken", function(req, res){
  res.redirect('/');
  console.log(act);
});

app.get("/company", function (req, res) {
  res.render("company");
});

app.post("/company",function(req, res){
  var args = {
    data: {
      "$class": "org.yky.stbc.Company",
      "issuedShareCount": req.body.issuedShareCount,
      "owner": "resource:org.yky.stbc.Trader#"+req.body.owner,
      "email": req.body.email,
      "name":req.body.name
    },
    headers: {
      "Content-Type": "application/json",
      "Accept":"application/json",
      "X-Access-Token": act
    }
  }
  client.post("http://localhost:3000/api/org.yky.stbc.Company", args, function(data, response) {
    res.json(data);
  });
});

app.get("/createshare", function (req, res) {
  res.render("createshare");
});

app.post("/createshare",function(req, res){
  
  console.log(req.body);
  var args = {
    data: {
      "$class": "org.yky.stbc.ShareIssue",
      "trader":req.body.trader,
      "detail": req.body.detail,
      "count": req.body.count,
      "price":req.body.price,
      "company": "resource:org.yky.stbc.Company#"+req.body.company,
    },
    headers: {
      "Content-Type": "application/json",
      "Accept":"application/json",
      "X-Access-Token": act
    }
  }
  console.log(args);
  
  client.post("http://localhost:3000/api/org.yky.stbc.ShareIssue", args, function(data, response) {
    res.json(data);
});
});


app.get("/placeorder", function (req, res) {
  res.render("placeorder");
});

app.post("/placeorder",function(req, res){
  var args = {
    data: {
      "$class": "org.yky.stbc.PlaceOrder",
      "OrderType": req.body.OrderType,
      "count": req.body.count,
      "price":req.body.price,
      "company": "resource:org.yky.stbc.Company#"+req.body.company,
    },
    headers: {
      "Content-Type": "application/json",
      "Accept":"application/json",
      "X-Access-Token": act
    }
  }
client.post("http://localhost:3000/api/org.yky.stbc.PlaceOrder", args, function(data, response) {
  res.json(data);
});
});


app.get("/modifyorder", function (req, res) {
  res.render("modifyorder");
});

app.post("/modifyorder",function(req, res){
  var args = {
    data: {
      "$class": "org.yky.stbc.ModifyOrder",
      "newPrice": req.body.newPrice,
      "company": "resource:org.yky.stbc.Order#"+req.body.Order,
    },
    headers: {
      "Content-Type": "application/json",
      "Accept":"application/json",
      "X-Access-Token": act
    }
  }
  client.post("http://localhost:3000/api/org.yky.stbc.ModifyOrder", args, function(data, response) {
    res.json(data);
});
});


app.get("/trader", function (req, res) {
  res.render("trader");
});

app.post("/trader",function(req, res){
  var args = {
    data: {
      "$class": "org.yky.stbc.Trader",
      "balance": req.body.balance,
      "email": req.body.email,
      "name": req.body.name,
    },
    headers: {
      "Content-Type": "application/json",
      "Accept":"application/json",
      "X-Access-Token": act
    }
  }
  client.post("http://localhost:3001/api/org.yky.stbc.Trader", args, function(data, response) {
    res.json(data);
  });
});

/*
get all the participant:trader from the rest server 
*/
app.get("/traderview", function (req, res) {
  
  client.get("http://localhost:3001/api/org.yky.stbc.Trader", function (data, response) {
    res.render("traderview", {data:data});
  });
});
/*
get all the participant:comapny from the rest server 
*/
app.get("/companyview", function (req, res) {
  
  client.get("http://localhost:3001/api/org.yky.stbc.Company", function (data, response) {
    res.render("companyview", {data:data});
  });
});
/*
get all the buy order from the rest server 
*/
app.get("/buyorderview", function (req, res) {
  
  client.get("http://localhost:3001/api/org.yky.stbc.Company", function (data, response) {
    res.render("buyorderview", {data:data});
  });
});


app.listen(8081, () => console.log('Example app listening on port 8081!'))