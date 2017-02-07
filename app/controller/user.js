var express = require('express');
var utils = require('../utils');
var auth = require('../middleware');
var router = express.Router();
var Model = require('../model/user');

// 注册页面
router.get('/reg',auth.checkNotLogin,function(req,res){
	res.render('user/reg',{
		title: '注册'
	});
});

// 提交注册表单
router.post('/reg',auth.checkNotLogin,function(req,res){
	var user = req.body;
	if(user.password !== user.password){
		req.flash('error','两次密码不一致');
		return res.redirect('back');
	}

	user.password = utils.md5(user.password);
	user.avatar  = "https://secure.gravatar.com/avatar/" + utils.md5(user.email) + '?s=25';

	Model.create(user,function(err,doc){
        console.log("create");
		if(err){
			req.flash('error','注册失败');
			return res.redirect('back');
		}else{
			req.session.user = doc;
			req.flash('success','注册成功');
			return res.redirect('/');
		}
	});

});

// 登录页面
router.get('/login',auth.checkNotLogin,function(req,res){
	res.render('user/login',{
		title: '登录'
	});
});

// 提交登录表单
router.post('/login',auth.checkNotLogin,function(req,res){
	var user = req.body;

	user.password = utils.md5(user.password);

	Model.findOne(user,function(err,doc){
		if(err){
			req.flash('error','登录失败');
			return res.redirect('back');
		}else{
			if(doc){
				req.session.user = doc;
				req.flash('success','登录成功');
				return res.redirect('/');
			}else{
				// 用户不存在
				req.flash('error','登录失败');
				return res.redirect('/user/reg');
			}
		}
	})
});

router.get('/logout',auth.checkLogin,function(req,res){
	req.session.user = null;
	req.flash('success','退出成功');
	return res.redirect('/user/login');
});

module.exports = router;