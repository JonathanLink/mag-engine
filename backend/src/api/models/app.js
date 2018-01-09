const mongoose = require('mongoose')

const schema = mongoose.Schema({
    id: String,
    name: String,
    appName: String,
    color: String,
    bricks: [String],
    state: { type: String, enum: ['uninstalled', 'installing', 'starting', 'running', 'stopping' ,'stopped', 'deleting'], default: 'uninstalled' },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
})

module.exports = mongoose.model('App', schema)