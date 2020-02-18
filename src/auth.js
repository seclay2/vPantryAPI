
var jwt = require('jsonwebtoken')


module.exports = (req, res, callback) => {
    var token = req.body.token || req.headers.token || req.headers['x-access-token']
    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
            if (err)
                return res.status(403).send({ error: 'Invalid token.' })
            else {
                req.decoded = decoded
				callback()
            }
        })
    } else {
        return res.status(403).send({ error: 'No token was received.' })
    }
}