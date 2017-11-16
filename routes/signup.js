var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var db = require('../bin/db.js');

const saltRounds = 10;

router.get('/', function(req, res, next) {
	if (req.session.user === undefined)
		res.render('signup', { profile: null, signUp: true });
	else
		res.redirect('../../../');
});

router.get('/ctfu', function(req, res, next){
	db.query('create table users (username varchar(20) NOT NULL, registration date NOT NULL, passwordHash varchar(60) NOT NULL, primary key(username))', function(err){
		if (err) throw err;
	});
});

router.get('/ctfp', function(req, res, next){
	db.query('create table projects (projectId int(11) NOT NULL auto_increment, projectName varchar(50) NOT NULL, primary key(projectId))', function(err){
		if (err) throw err;
	});
});

router.get('/cat', function(req, res, next){
	db.query('create table usersProjects (username varchar(20) references users (username), projectId int(11) references projects (projectId), primary key(username, projectId))', function(err){
		if (err) throw err;
	});
});

router.post('/', function(req, res, next){
	var login = req.body.username;
	var password = req.body.password;
	var repPassword = req.body.repPassword;
	if (login.length > 20)
		res.json({ username: 'long', password: false });
	else
	{
		db.query('select * from users where username = ?', [login], function(err, result){
			if (result.length !== 0)
				res.json({username: false, password: false});
			else if (password.length < 6)
				res.json({username: true, password: "short"});
			else if (password.length > 20)
				res.json({username: true, password: "long"});
			else if (password !== repPassword)
				res.json({username: true, password: "diff"});
			else
			{
				res.json({username: true, password: true});
				bcrypt.hash(password, saltRounds, function(err, hash) {
					db.query('insert into users (username, passwordHash, registration) values (?, ?, ?)', [login, hash, new Date().toISOString().slice(0, 19).replace('T', ' ')], function(err){
						if (err) throw err;
					});
				});
			}
		});
	}
});

module.exports = router;
