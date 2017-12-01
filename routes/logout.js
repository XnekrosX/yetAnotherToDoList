const express = require('express')
	, router = express.Router();

router.get('/', function(req, res, next) {
	req.session.destroy();
	res.redirect('/');
});

module.exports = router;