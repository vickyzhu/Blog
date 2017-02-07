var mongoose = require('mongoose');
module.exports = {
	md5: function(str){
		//先加载crypto模块，创建md5哈希算法，指定要加密的字符串，再进行摘要要按16进制输出
		return require('crypto').createHash('md5').update(str).digest('hex');
	},
	//全局函数
	Model: function(modelName){
		return mongoose.model(modelName);
	}
}