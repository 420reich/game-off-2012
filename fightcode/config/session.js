var express = require('express'),
    sequelize = require('./database'),
    C3Store = require('c3store')(express);

module.exports = {secret: '78c6c98f-17fe-46e9-9ada-25f3464d7a6d',
                  maxAge : new Date(Date.now() + 60000 * 20),
                  expires : new Date(Date.now() + 60000 * 20),
                  store: new C3Store(sequelize)};
