/**
 * model - user.
 * User: raytin
 * Date: 13-3-27
 * Time: 下午2:08
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    name: {type: String, index: true},
    nickName: {type: String},
    pass: {type: String},
    email: {type: String},
    sign: {type: String},
    head: {type: String},
    reg_time: {type: String},
    lastLogin_time: {type: String, default: '0'}, // 最后登录时间

    topic_count: {type: Number, default: 0}, // 微博数
    reply_count: {type: Number, default: 0}, // 评论数
    collecting: [String], // 收藏
    followed: [String], // 关注
    fans: [String], // 粉丝
    gold: {type: Number, default: 0}, // 金币
    lastGetGold: {type: String}, // 最后取得金币时间
    message: [{}], // 消息
    newMessage: {type: Number, default: 0} // 新的消息
});

mongoose.model('User', userSchema);
