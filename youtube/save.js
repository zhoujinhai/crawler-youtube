var mysql = require('mysql');

var debug = require('debug')('youtube:save');
var async = require('async');

var pool = mysql.createPool({
	host : 'localhost',
	user : 'root',
	password : 'z2457098495924',
	database : 'youtube'
});

// pool.getConnection(function(err,connection){
// 	if(err){
// 		console.log(err);
// 	}
// 	connection.query('show tables',function(err,result){
//  		if(err){
//  			return console.log('show tables error:'+err.message);
//  		}
//  		return console.log(result);
// 	});
// 	connection.release();
// });

//保存订阅列表
exports.channelList = function(list,callback){
	debug('保存订阅列表',list.length);

	pool.getConnection(function(err,connection){
		if(err){
			return callback(err);
		}

		var findsql = 'select * from channel where id=?';
		var insertsql = 'insert into channel(channelName,url,id) values(?,?,?)';
		var updatesql = 'update channel set channelName=?,url=? where id=?';
		async.eachSeries(list,function(item,next){
			//查询订阅号是否存在
			connection.query(findsql,[item.id],function(err,result){
				if(err){
					return next(err);
				}
				if(result.length>=1){
					//订阅号已经存在，更新
					connection.query(updatesql,[item.channelName,item.url,item.id],next);
				}else{
					//将订阅号信息插入到数据表channel
					connection.query(insertsql,[item.channelName,item.url,item.id],next);
				}
			});
		},callback);
		connection.release();
	});
};

//保存订阅号下的视频分类列表
exports.categoryList = function(list,callback){
	debug('保存订阅号下的视频分类列表',list.length);

	pool.getConnection(function(err,connection){
		if(err){
			return callback(err);
		}
		var findsql = 'select * from category where channelId=? and categoryName=?';
		var updatesql = 'update category set url=? where channelId=? and categoryName=?';
		var insertsql = 'insert into category(channelId,categoryName,url) values(?,?,?)';
		async.eachSeries(list,function(item,next){
			//检查视频分类是否存在
			connection.query(findsql,[item.channelId,item.categoryName],function(err,result){
				if(err){
					return next(err);
				}
				if(result.length>=1){
					//如果存在则进行更新
					connection.query(updatesql,[item.url,item.channelId,item.categoryName],next);
				}else{
					//不存在则讲数据插入数据表category
					connection.query(insertsql,[item.channelId,item.categoryName,item.url],next);
				}
			});
		},callback);
		connection.release();
	});
};

//保存订阅号下某个视频分类的视频列表
exports.videoList = function(list,callback){
	debug('//保存订阅号下某个视频分类的视频列表',list.length);

	pool.getConnection(function(err,connection){
		if(err){
			return callback(err);
		}
		
		var findsql = 'select * from video where sequence=? and categoryName=?';
		var updatesql = 'update video set url=? where sequence=? and categoryName=?';
		var insertsql = 'insert into video(categoryName,url,sequence) values(?,?,?)';

		async.eachSeries(list,function(item,next){
			connection.query(findsql,[item.sequence,item.categoryName],function(err,result){
				if(err){
					return next(err);
				}
				if(result.length>=1){
					//如果存在则进行更新
					connection.query(updatesql,[item.url,item.sequence,item.categoryName],next);
				}else{
					//不存在则讲数据插入数据表video
					connection.query(insertsql,[item.categoryName,item.url,item.sequence],next);
				}
			});
		},callback);
		connection.release();
	});
};

//保存视频信息
exports.information = function(videoUrl,list,callback){
	debug('保存视频信息',videoUrl,list.length);

	pool.getConnection(function(err,connection){
		if(err){
			return callback(err);
		}

		var findsql = 'select * from information where videoName=? and url=?';
		var updatesql = 'update information set pubTime=?,intro=?,filmLen=? where videoName=? and url=?';
		var insertsql = 'insert into information(videoName,url,pubTime,intro,filmLen) values(?,?,?,?,?)'
		async.eachSeries(list,function(item,next){
			connection.query(findsql,[item.videoName,videoUrl],function(err,result){
				if(err){
					return next(err);
				}
				if(result.length>=1){
					//如果存在则进行更新
					connection.query(updatesql,[item.pubTime,item.intro,item.filmLen,item.videoName,videoUrl],next);
				}else{
					//不存在则讲数据插入数据表information
					connection.query(insertsql,[item.videoName,videoUrl,item.pubTime,item.intro,item.filmLen],next);
				}
			});
		},callback);
		connection.release();
	});
};

//保存视频信息
exports.videoDetail = function(videoUrl,list,callback){
	debug('保存视频信息',videoUrl);

	pool.getConnection(function(err,connection){
		if(err){
			return callback(err);
		}

		var findsql = 'select * from information where videoName=?';
		var updatesql = 'update information set pubTime=?,intro=?,url=?,filmLen=? where videoName=?';
		var insertsql = 'insert into information(videoName,url,pubTime,intro,filmLen) values(?,?,?,?,?)'
		
		connection.query(findsql,[list.videoName],function(err,result){
			if(err){
				return next(err);
			}
			if(result.length>=1){
				//如果存在则进行更新
				connection.query(updatesql,[list.pubTime,list.intro,videoUrl,list.filmLen,list.videoName],callback);
			}else{
				//不存在则讲数据插入数据表information
				connection.query(insertsql,[list.videoName,videoUrl,list.pubTime,list.intro,list.filmLen],callback);
			}
		});
		connection.release();
	});
};