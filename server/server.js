var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser')
var session = require('express-session')

/////////////////////////////////////////////////////////////////////
//                          DB CONNECTION                          //
/////////////////////////////////////////////////////////////////////

// var connectionString = "postgres://gwlpywdbzjuuyv:yWhO_BIPji1cc513rEtpwt7cY7@ec2-54-225-157-157.compute-1.amazonaws.com:5432/d41ri138f8kobu"

var db = new pg.Client({
	user: "ibusbvgapjgxtf",
    password: "XkZIsiu_TNk_FJLixBnLcds8pJ",
    database: "d4f0hu2il1j695",
    port: 5432,
    host: "ec2-184-73-253-4.compute-1.amazonaws.com",
    ssl: true
});
function connectDatabase(callback){
	db.connect(function(err){
		if(err){
			console.log("PG CONNECTION ERROR:", err);
		} else {
			console.log("CONNECTED TO WEDDING-DB POSTGRES DB");
			callback();
		}
	})
}

var users = 'CREATE TABLE IF NOT EXISTS users (' +
			'id SERIAL NOT NULL PRIMARY KEY,'    +
			'email VARCHAR(255) NOT NULL,'       +
			'hash VARCHAR(255) NOT NULL'         +
			');';

var guests = 'CREATE TABLE IF NOT EXISTS guests (' +
			 'id SERIAL NOT NULL PRIMARY KEY,'     +
			 'name VARCHAR(125) NOT NULL,'		   +
			 'address VARCHAR(255),'			   +
			 'email VARCHAR(255),'                 +
			 'phone VARCHAR(255),'                 +
			 'guests INTEGER,'					   +
			 'confirmation VARCHAR(10) NOT NULL'   +
			 ');';

// var maira = "INSERT INTO users (email, hash) VALUES ('mairaprado1@hotmail.com', 'chocolate2679');";
// var chris = "INSERT INTO users (email, hash) VALUES ('christian.brandalise@gmail.com', 'planes22');";
// var juca  = "INSERT INTO users (email, hash) VALUES ('jucamb@gmail.com', '15102010');";
connectDatabase(function(){
	db.query(users, function(err, results){
		if(err) console.log("users table creation ERROR:", err)
		console.log("created users table.");
	});

	db.query(guests, function(err, results){
		if(err) console.log("guests table creation ERROR:", err)
		console.log("created guests table.");
	});
});

/////////////////////////////////////////////////////////////////////
//                          MIDDLEWARE                             //
/////////////////////////////////////////////////////////////////////

app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: '18012013',
  resave: false,
  saveUninitialized: true
}))

/////////////////////////////////////////////////////////////////////
//                          ROUTES                                 //
/////////////////////////////////////////////////////////////////////

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/login.html')
})

app.get('/main', function(req, res){
	if(req.session.email){
		res.sendFile(__dirname + '/views/index.html')	
	} else {
		res.redirect('/');
	}
})

app.post('/api/auth', function(req, res){
	console.log(req.body.email, req.body.hash)
	db.query("SELECT * FROM users WHERE email = $1 AND hash = $2", [req.body.email, req.body.hash], function(err, result){
		if(err){ console.log("ERROR", err) }
		else {
			if(result.rows && result.rows.length > 0){
				req.session.email = result.rows[0].email;
				console.log('req.session.email:', req.session.email)
				res.redirect('/main');
			} else {
				res.redirect('/');
			}
		}
	})
})

app.get('/api/auth/logout', function(req, res){
	console.log(req.session.email)
	if(req.session.email){
		req.session.destroy(function(err){
			if(err) { console.log("SESSION ERROR:", err) }
			else { console.log("Session destroyed") }
		})
		res.redirect('/')
	} else {
		res.send("nothing to see here!")
	}
})

app.get('/api/guests', function(req, res){
	if(req.session.email){
		db.query("SELECT * FROM guests", function(err, result){
			if(result && result.rows.length > 0){
				res.status(200).json(result.rows)
			} else {
				res.status(404).json({
					message: "ERROR - Nothing found"
				})
			}
		})		
	} else {
		res.status(401).json({
			message: 'not authorized!'
		})
	}
})

app.post('/api/guests', function(req, res){
	if(req.session.email){
		db.query("INSERT INTO guests (name, address, email, phone, guests, confirmation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", 
		[req.body.name, req.body.address, req.body.email, req.body.phone, req.body.guests, req.body.confirmation], function(err, result){
			res.status(201).json(result.rows[0])
		})
	} else {
		res.status(401).json({
			message: 'not authorized!'
		})
	}
})

app.listen(process.env.PORT || 3000, function(){
	console.log("Server listening on PORT: 3000");
})