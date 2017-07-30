var async = require('async');
var config = require('./config');
var read = require('./read');
// var save = require('./save');

var debug = require('debug')('youtube:index');

var channelList;
var categoryList = {};//存储获取的分类列表
var newCgList = [];//用于存储整理后的分类列表
var videoList = {};
var newVdList = [];
var informationList = {};
async.series([
		//从YouTube主页获取部分订阅号
		function(done){
			read.channelList(config.URL.url,function(err,list){
				channelList = list;
				done(err);
			});
		},

		// //保存订阅号
		// function(done){
		// 	save.channelList(channelList,done);
		// },

		// //从所得的订阅号中获取视频分类列表
		// function(done){
		// 	async.eachSeries(channelList,function(item,next){
		// 		read.categoryList(item.url,function(err,list){
		// 			categoryList[item.id]=list;
		// 			next(err);
		// 		});
		// 		//console.log(categoryList);
		// 	},done);
		// },
		
		// //保存订阅号下视频分类列表
		// function(done){
		// 	async.eachSeries(Object.keys(categoryList),function(channelId,next){
		// 		save.categoryList(categoryList[channelId],next);	
		// 	},done);				
		// }

		//从config文件中读取订阅号，获取视频分类列表
		function(done){
			async.eachSeries(config.channel,function(item,next){
				read.categoryList(item.url,function(err,list){
					var s = item.url.match(/channel\/([a-zA-Z0-9_-]+)/);
				    item.id = s[1];
					categoryList[item.id]=list;
					next(err);
				});
				//console.log(categoryList);
			},done);
		},
		// //保存订阅号下视频分类列表
		// function(done){
		// 	async.eachSeries(Object.keys(categoryList),function(channelId,next){
		// 		save.categoryList(categoryList[channelId],next);	
		// 	},done);				
		// },
		//重新整理分类列表
		function(done){
			debug('重新整理分类列表');

			Object.keys(categoryList).forEach(function(channelId){
				categoryList[channelId].forEach(function(item){
					newCgList.push(item);
				});
			});
			done();
		},
		//获取所有分类下视频列表
		function(done){
			async.eachSeries(newCgList,function(item,next){
				read.videoList(item.url,function(err,list){
					videoList[item.categoryName] = list;
					next(err);
				});
			},done);
		},
		// //保存视频列表
		// function(done){
		// 	async.each(Object.keys(videoList),function(categoryName,next){
		// 		save.videoList(videoList[categoryName],next);
		// 	},done);
		// },
		//重新整理视频列表
		function(done){
			debug('重新整理视频列表并去重');

			Object.keys(videoList).forEach(function(categoryName){
				videoList[categoryName].forEach(function(item){
					newVdList.push(item);
				});
			});
			console.log(newVdList);
			newVdList = read.unique(newVdList);
			console.log(newVdList);
			done();
		},
		//获取视频信息
		function(done){
			async.eachSeries(newVdList,function(item,next){
				read.information(item.url,function(err,list){
					informationList[item.url] = list;
					next(err);
					//边读取边保存视频信息
					//console.log(informationList);
				    // save.videoDetail(item.url,list,next);
				});
			},done);
		}
		// //读取完再保存视频信息
		// function(done){
		// 	async.each(Object.keys(informationList),function(url,next){
		// 		save.information(url,informationList[url],next);
		// 	},done);
		// }

	],function(err){
	if(err){
		console.log(err);
	}
	console.log('finish');
	process.exit(0);
});
