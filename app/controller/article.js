var express = require('express');
var router = express.Router();
var	auth = require('../middleware');
var async = require('async');
var markdown = require('markdown').markdown;
var Model = require('../model/article');
/**
 * 显示所有的文章列表
 * query传参数 pageNum 当前的页数 pageSize每页的条数
 */
router.get('/list',function(req,res){
	var keyword = req.query.keyword;//关键字
	var orderBy = req.query.orderBy;//排序字段
	var order = req.query.order ? parseInt(req.query.order) : -1;//排序顺序，默认降序
	var pageNum = req.query.pageNum ? parseInt(req.query.pageNum) : 1; //页码，默认第一页
	var pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 5;//每页条数，默认为5u
	var query = {},
		orderObj = {};

	if(keyword){
		var regex = new RegExp(keyword,'i');
		query['$or'] = [{name: regex}, {content: regex}];
	}

	if(orderBy){
		orderObj[orderBy] = order;
	}

	Model.find(query).count(function(err,count){
		Model
			.find(query)
			.sort(orderObj)
			.skip(pageSize * (pageNum - 1))
			.limit(pageSize)
			.populate('user')
			.exec(function(err,docs){
				docs.forEach(function(doc){
					doc.content = markdown.toHTML(doc.content);
				});
			});

		res.render('article/list',{
			title: '文章列表',
			pageNum: pageNum,
			orderBy: orderBy,
			order: order,
			pageSize: pageSize,
			totalPage: Math.ceil(count / pageSize),
			keyword: keyword
		});
	});

});

// 发表文章
router.get('/add',auth.checkLogin,function(req,res){
	res.render('article/add',{
		title: '发表文章',
		article: {}
	});
});
router.post('/add',auth.checkLogin,function(req,res){
	var article = req.body;
	var _id = article._id;

	console.log(_id);

	if(_id){
		// 修改
		Model.update(
			{_id: _id},
			{$set: {title: article.title,content: article.content}},
			function(err,doc){
				if(err){
					req.flash('err','修改文章失败');
					return res.back('back');
				}else{
					req.flash('success','修改文章成功');
					return res.redirect('/article/detail/_id');
				}
			});
	}else{
		// 增加
		article.user = req.session.user;
		// 空字符串不能转换为ObjectId，故删除，数据库会自动生成新的_id
		delete article._id;
		article.createAt = Date.now();
		Model.create(article,function(err,doc){
			if(err){
				req.flash('error','发表文章失败');
				return res.redirect('back');
			}else{
				req.flash('success','发表文章成功');
				res.redirect('/');
			}
		});
	}
});

// 获取文章详情
router.get('/detail/:id',function(req,res){
	async.parallel({
		pv: function(cb){
			Model.update({_id: req.params._id},
				{$inc: {pv: 1}},
				function(err,result){
					cb(err,result);
				});
		},
		doc: function(cb){
			Model.findById(req.params.id)
				.populate('comments.user')
				.exec(function(err,doc){
					cb(err,doc);
				});
		}
	},
	function(err,result){
		res.render('article/detail',{
			title: '文章详情',
			article: result.doc
		});
	});
});

// 删除文章
router.get('/delete/:id',function(req,res){
    var _id = req.params.id;
	Model.findById(_id,function(err,doc){
		if(doc){
			if(req.session.user._id = doc.user){
				Model.remove({_id: _id},function(err){
                    if(err){
                        req.flash('error',err);
                        return res.redirect('back');
                    }
                    req.flash('success','删除成功');
                    res.redirect('back');
                });
			}else{
				req.flash('error','只能删除自己的文章');
				return res.redirect('back');
			}
		}else{
			req.flash('error','删除失败');
			res.redirect('back');
		}
	});
});

// 编辑文章
router.get('/edit/:id',function(req,res){
	var _id = req.params._id;
	Model.findById(_id,function(err,doc){
		if(err){
			req.flash('error','获取文章失败');
			return res.redirect('back');
		}else{
			res.render('article/add',{
				title: '编辑文章',
				article: doc
			});
		}
	});
});


// 评论
router.post('/comment',function(req,res){
	var comment = req.body;
	comment.user = req.session.user._id;
	Model.update({_id: comment.articleId},
		{$push: {comments: comment}},
		function(err,newDoc){
			if(err){
				req.flash('error','评论失败');
				return res.redirect('back');
			}else{
				req.flash('success','评论成功');
				res.redirect('back');
			}
		}
	)
});


module.exports = router;



