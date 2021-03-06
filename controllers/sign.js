/**
 * 注册登录处理模块
 * User: raytin
 * Date: 13-3-27
 * Time: 上午10:45
 */
var proxy = require('../proxy'),
    userProxy = proxy.User,
    models = require('../models'),
    config = require('../config').config,
    util = require('../util');

// 注册
exports.reg = function(req, res){
    // 用户已登录
    if(res.locals.current_user){
        res.redirect('/');
        return;
    }
    res.render('sign/reg', {
        title: '用户注册',
        error: false,
        layout: null
    });
};

// 处理用户注册信息
exports.doReg = function(req, res, next){
    //console.log(req.body);
    var error = [],
        userName = req.body['username'],
        passWord = req.body['password'],
        confirmPassWord = req.body['confirmPassword'];

    if(userName === ''){
        error.push('用户名不能为空');
    };
    if(passWord === ''){
        error.push('密码不能为空');
    };
    if(passWord != confirmPassWord){
        error.push('两次输入密码不一样');
    };

    if(error.length){
        console.log(error);
        return res.render('sign/reg',
            {
                title: '用户注册',
                error: error,
                layout: null
            }
        );
    }
    // 注册信息验证通过
    else{
        userProxy.getUserInfoByName(userName, 'name', function(err, user){
            if(err){
                return next(err);
            };
            // 用户名已存在
            if(user){
                res.render('sign/reg', {
                    title: '用户注册',
                    error: [userName +'已被注册，换一个呗~'],
                    layout: null
                })
            }
            // 注册成功，保存用户信息
            else{
                var userModel = new models.User();
                userModel.name = userName;
                userModel.pass = util.encrypt(passWord);
                userModel.reg_time = new Date().format('yyyy/MM/dd hh:mm:ss');
                userModel.gold = 10;

                // 向用户推送消息
                var msgBody = {
                    msgType: 'newuser',
                    time: new Date().format('MM月dd日 hh:mm'),
                    name: userName,
                    readed: false
                };
                util.pushMessage(userModel, msgBody, function(){
                    req.session.user = userName;
                    res.redirect('/');
                });
            }
        });
    };
};

// 登出
exports.logout = function(req, res){
    if(res.locals.current_user){
        req.session.user = null;

        // 更新最后登出时间
        userProxy.updateUserInfoByName(res.locals.current_user, {lastLogin_time: new Date().format('yyyy/MM/dd hh:mm:ss')}, function(err){
            if(err) return next(err);
            return res.redirect('/');
        });
    }
};

// 登录
exports.login = function(req, res){
    // 用户已登录
    if(res.locals.current_user){
        res.redirect('/');
        return;
    }
    res.render('sign/login', {
        title: '用户登录',
        error: false,
        layout: null
    });
};

// 处理用户登录
exports.doLogin = function(req, res, next){
    var error = [],
        userName = req.body['username'],
        passWord = req.body['password'];

    if(userName === ''){
        error.push('用户名不能为空');
    };
    if(passWord === ''){
        error.push('密码不能为空');
    };

    if(error.length){
        console.log(error);
        return res.render('sign/login',
            {
                title: '用户登录',
                error: error,
                layout: null
            }
        );
    }
    // 登录验证通过
    else{
        userProxy.getUserInfoByName(userName, 'pass', function(err, user){
            if(err){
                return next(err)
            }
            if(user){
                // 开始校验账户密码
                if(util.encrypt(passWord) === user.pass){
                    // 登录成功
                    req.session.user = userName;
                    return res.redirect('/');
                }else{
                    // 密码错误
                    res.render('sign/login',
                        {
                            title: '用户登录',
                            error: ['账户【'+ userName +'】密码错误'],
                            layout: null
                        }
                    );
                }
            }
            else{
                // 不存在此账户
                return res.render('sign/login',
                    {
                        title: '用户登录',
                        error: ['【'+ userName +'】账户不存在'],
                        layout: null
                    }
                );
            }
        });
    }
};

// 检查当前用户状态
exports.checkCurrentUser = function(req, res, next){
    if(req.session.user){
        res.locals.current_user = req.session.user;
    }else{
        res.locals.current_user = null;
    }
    return next();
};
