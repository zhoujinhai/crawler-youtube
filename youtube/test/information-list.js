var request =require('superagent');
require('superagent-proxy')(request);

var cheerio = require('cheerio');
var debug = require('debug')('youtube:test:information');

var proxy = 'http://127.0.0.1:61481';//设置代理IP地址

//请求头信息
var header = {
	'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding':'gzip, deflate, sdch, br',
    'Accept-Language':'zh-CN,zh;q=0.8,en;0.6',
    'Cookie':'WKcs6.resume=; _ga=GA1.2.1653214693.1476773935; _gid=GA1.2.943573022.1500212436; YSC=_X6aKoK1jMc; s_gl=1d69aac621b2f9c0a25dade722d6e24bcwIAAABVUw==; VISITOR_INFO1_LIVE=T3BczuPUIQo; PREF=hl=zh-CN&cvdm=grid&gl=US&f1=50000000&al=zh-CN&f6=1&f5=30; SID=7gR6XOImfW5PbJLOrScScD4DXf8cHCkWCkxSUFy9CbhnaFaPLBCVCElv97n_mjWgkPC_ow.; HSID=A0_bKgPkAZLJUfnTj; SSID=ASjQTON7p_q4UNgit; APISID=ZIVPX9a3vUKRa28E/A0dykxLiVJ4xDIUS_; SAPISID=t6dcqHC9pjGsE7Bi/ATm5wgRC27rqUQr5B; CONSENT=YES+CN.zh-CN+20160904-14-0; LOGIN_INFO=APUNbegwRQIhAPnMZ-qYHOSAKq0s9ltEQIUvnWNj9CHQ8J5s2JtZK15TAiBLzfS4HEUh-mWGo2Qo6XOruItGRdpPZ2v3cXLqYY7xtA:QUZKNV9BajdRR2VZQ2QyRlVDdXh3VDdKZ1AzMlFqRmg3aTBfR2pxWXFHWXlXYm1BaVVnQWk4UzZfWmZGSGcxRkNuTDBFYTk2a2tKLUEtNmtNaWZKM3hTMWNTZkgyOVlvTF9DNENwTG5XTlJudEVHQzVIeGxMbTFTdkl6YS02QlBmMmM0NVgteWI3QVNIa3c5c2ZkV1NSa3AzbWhwOHBtbzVrVTVSbTBqaWpIZ0dWNTd4UjJRSllr',
    'Upgrade-insecure-requests':'1',
    'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.59 Safari/537.36',
    'X-Chrome-Uma-Enabled':'1',
    'X-Client-Data':'CJa2yQEIorbJAQjBtskBCKmdygE=',
    'Connection': 'keep-alive'
};

//获取视频详细信息
function information (url , callback){
	debug('读取视频详细信息',url);

	request
		.get(url)//需要获取的网址
		.set('header',header)
		.proxy(proxy)
		.end(onresponse);

	function onresponse(err,res){
		
		if(err){
			return callback(err);
		}else{
			console.log('status:'+res.status);//打印状态码
			//console.log(res.text);
			var $ = cheerio.load(res.text);
			var information = {};
			information.url = 'https://www.youtube.com'+$('#playlist-autoscroll-list .currently-playing a').attr('href');
			information.videoName = $('#watch-headline-title').text().trim();
			information.pubTime = $('#watch-uploader-info').text().trim();
			information.intro = $('#watch-description-text').text().trim();
			
			var filmLen = $('#watch-description-extras .watch-extras-section li').text().trim();
			var s = filmLen.match(/(\d+\:\d+\:\d+)/);
			if(Array.isArray(s)){
				information.filmLen = s[1];
			}
			
			callback(null,information);
		}
	}
}

information('https://www.youtube.com/watch?v=sjhbO8lIc2s&index=1&list=PLHPTxTxtC0iaN9kA37m6MRrxFkgby2CDR',function(err,information){
	if(err){
		return console.log(err);
	}
	return console.log(information);
})