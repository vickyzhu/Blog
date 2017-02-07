var mongoose = require('mongoose');
var objectId = mongoose.Schema.Types.ObjectId;

var userSchema = new mongoose.Schema({
	// 用户名
	username: {
		type: String,
		isRequired: true
	},
	// 密码
	password: {
		type: String,
		isRequired: true
	},
	// 邮箱
	email: {
		type: String,
		isRequired: true
	},
	// 头像
	avatar: {
		type: String
	}
});

module.exports = userSchema;