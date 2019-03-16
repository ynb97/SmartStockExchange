/*********************************************************************/
/* server side app to get and post to the composer network REST API  */
/*********************************************************************/
const _ = require("underscore");
const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const CardImport = require('composer-cli').Card.Import;
const BusinessNetworkCardStore = require('composer-common').BusinessNetworkCardStore;
let Card = {};
var cdata;
var exec = require('child_process').exec, isid;

const AdminConnection = require('composer-admin').AdminConnection;
// const fs = require('fs');
const IdCard = require('composer-common').IdCard;
const LoopBackCardStore = require('./loopbackcardstore');
// const Util = require('./util');

// const AdminConnection = require('composer-admin').AdminConnection;
// const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
// const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
// const FileSystemCardStore = require('composer-common').FileSystemCardStore;
// const BusinessNetworkCardStore = require('composer-common').BusinessNetworkCardStore;
// const IdCard = require('composer-common').IdCard;

// this.bizNetworkConnection = new BusinessNetworkConnection();

// const fileSystemCardStore = new FileSystemCardStore();
// const businessNetworkConnection = new BusinessNetworkConnection();
// const adminConnection = new AdminConnection();
// const businessNetworkCardStore = new BusinessNetworkCardStore();


// const FormData = require('multi-part');
const FormData = require('form-data');
app.set("view engine", "ejs");

/*
to import auth.js file in app.js 
*/
passport = require('passport'),
auth = require('./auth');
auth(passport);
app.use(passport.initialize());

let act = 0;
let username ;
let fiile;

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


// Add a remote method for importing a card.
var importCard = ( name, accessToken) => {
  const userId = accessToken.userId;
  const cardStore = new LoopBackCardStore(Card, userId);

    return new Promise((resolve, reject) => {
      fs.readFile('myCard.card', (err, data) => {
        if (err) {
          console.log("Err..."+err);
          return reject(err);
        }
        console.log("Data..."+data);
        resolve(data);
      });
    }).then((cardData) => {
    return IdCard.fromArchive(cardData);
  }).then((card) => {
    if (!name) {
      const locationName = card.getBusinessNetworkName() || card.getConnectionProfile().name;
      name = card.getUserName() + '@' + locationName;
    }
    // Put the card into the card store.
    console.log("Name..."+name+"   Card..."+card);
    return cardStore.put(name, card);
  }).then((card) => {
    // Then we import the card into the card store using the admin connection.
    // This imports the credentials from the card into the LoopBack wallet.
    const adminConnection = new AdminConnection({ cardStore });
    return adminConnection.importCard(name, card);
  }).then(() => {
    return getDefaultCard(userId);
  }).then((defaultCard) => {
    if (!defaultCard) {
      return setDefaultCard(userId, name);
    }
  });
};


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


var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 12);
};

app.get("/", function (req, res) {
  res.render("home");
});



app.get("/githublogin", function(req, res){
  res.redirect("http://localhost:3000/auth/github");
  act = getCookie('access_token', req);
  act = act.substr(2, 64);
  // console.log("Login by github");
  // console.log(req.cookies);
  // console.log(req.cookies['access_token']);
});
















app.get("/googlelogin", function(req, res){

    res.redirect("http://localhost:3000/auth/google");

  
act = getCookie('access_token',req);
act = act.substr(2,64);

  var args = {
    data: {
      participant: "org.yky.stbc.Trader#"+username,
      userID: username,
      options: {}
    },
    headers: {
      "Content-Type": "application/json",
      "Accept":"application/octet-stream",
      "X-Access-Token": act,
      "responseType": "blob"
      }
  }
  // var cdata;
  
  client.post("http://localhost:3001/api/system/identities/issue", args, function(data, response) {

  cdata = data;

  // console.log(JSON.stringify(data))
    // const cardData=JSON.stringify(data);
  
   fs.writeFileSync(`myCard.card`, data);
// console.log(file);
    // let options = {
    //   file: 'myCard.card',
    //   card: username + '@stbc-network'
    // };

    // CardImport.handler(options);
    
   
    console.log(act);


  });
  // const mfile = fs.readFileSync('myCard.card', { type: 'application/octet-stream', lastModified: Date.now() });

//   const formData = new FormData();

//   formData.append('card', fs);


//   var args1 = {

//     cdata,
//     headers: {
//       "Content-Type": "multipart/form-data",
//       "Accept": "application/json",
//       "X-Access-Token": act
//     }
//   }
// // console.log(args1);
//   client.post("http://localhost:3000/api/wallet/import?name="+username,args1, function(data, response) {
// console.log(response);
//   });
// isid();
  

  
  
});

app.get("/setdef", function(){

  var cmmd = "curl -X POST --header 'Content-Type: multipart/form-data' --header 'Accept: application/json' --header 'X-Access-Token: " + act + "' {'type':'formData'} 'http://localhost:3000/api/wallet/import?name=" + username + "'";
  var cmmd2 = "curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'X-Access-Token: " + act + "' 'http://localhost:3000/api/wallet/" + username + "/setDefault'";
  console.log(cmmd);
  exec(cmmd,
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });

  exec(cmmd2,
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
});

app.get("/import", function(data,res){
  var formData = new FormData();

  var card = new Promise((resolve, reject) => {
    fs.readFile('myCard.card', (err, data) => {
      if (err) {
        // console.log("Err..." + err);
        return reject(err);
      }
      console.log("Data..." + data);
      resolve(data);
    })
    }).then(() =>{
      formData.append('card', data);
    });
  // console.log("card....."+card);
// var cardStore = new BusinessNetworkCardStore();
//   const adminConnection = new AdminConnection({ cardStore });
//   return adminConnection.importCard(username, card);

  // importCard(username, act);

  // let options = {
  //   file: 'myCard.card',
  //   card: username + '@stbc-network'
  // };

  // CardImport.handler(options);
//   file1 = fs.createReadStream('myCard.card');
//   // var filePath = path.join(__dirname, 'myCard.card');
//   // var file = fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
//   //   if (!err) {
//   //     console.log('received data: ' + data);
      
//   //   } else {
//   //     console.log(err);
//   //   }
//   // });
  
// //   formData.append(username, 'name');
console.log(formData);

  var args1 = {

    formData,
    headers: {
      "Content-Type": "multipart/form-data",
      "Accept": "application/json",
      "X-Access-Token": act
    }
  }

//   var args1 = {
//     formData: {
//       "card": './myCard.card'
//     },
//     hesdaaders: {
//       "Content-Type": "multipart/form-data",
//       "Accept": "application/json",
//       "X-Access-Token": act
//     }
//   }
console.log("act..."+act);
  client.post("http://localhost:3000/api/wallet/import?name="+username, args1, function (data, response) {
// console.log(response);
  });
});





















app.get("/getatoken", function(req, res){
  res.redirect('/');
  // console.log(act);
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
    // res.json(data);
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
  // console.log(args);
  
  client.post("http://localhost:3000/api/org.yky.stbc.ShareIssue", args, function(data, response) {
    // res.redirect("/");
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
  // res.json(data);
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
    // res.json(data);
});
});


app.get("/trader", function (req, res) {
  res.render("trader");
});

app.post("/trader",function(req, res){
  var newTrader = ID();
  var args = {
    data: {
      "$class": "org.yky.stbc.Trader",
      // "traderId": newTrader,
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
  client.post("http://localhost:3000/api/org.yky.stbc.Trader", args, function(data, response) {
    // res.json(data);
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
  
  client.get("http://localhost:3001/api/org.yky.stbc.PlaceOrder", function (data, response) {
    res.render("buyorderview", {data:data});
  });
});
/*
google authentication for normal account 
*/
app.get('/login/google', passport.authenticate('google', {
  scope: [ 'https://www.googleapis.com/auth/plus.login',
  'https://www.googleapis.com/auth/plus.profile.emails.read' ]
}));

app.get('/login/google/callback',
  passport.authenticate('google', {
      failureRedirect: '/'
  }),
  (req, res) => {
  username=req.user.emails[0]['value'];

  var args = {
    data: {
      "$class": "org.yky.stbc.Trader",
      "balance": 0,
      "email": req.user.emails[0]['value'],
      "name": req.user['displayName'],
    },
    headers: {
      "Content-Type": "application/json",
      "Accept":"application/json",
      "X-Access-Token": act
    }
  }
  client.post("http://localhost:3001/api/org.yky.stbc.Trader", args, function(data, response) {
    // res.json(data);
  });
  res.redirect("/");
  }
  
);


app.listen(8081, () => console.log('Example app listening on port 8081!'))