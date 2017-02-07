var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var articleSchema = new mongoose.Schema({
	// 标题
	title: {
		type: String,
		isRequired: true
	},
	// 内容
	content: {
		type: String,
		isRequired: true
	},
	// 创建时间
	createAt: {
		type: Date,
		dafault: Date.now()
	},
	// 浏览量
	pv: {
		type: Number,
		default: 0
	},
	// 评论
	comments: [{
		user: {
			type: ObjectId, 
			ref: 'User'
		},
		content: {
			type: String
		},
		createAt: {
			type: Date,
			default: Date.now()
		}
	}],
	// 作者
	user: {
		type: ObjectId,
		ref: 'User'
	}
});

module.exports = articleSchema;