/*同方健康体成分云平台
 Express web路由，Websocket对接仪器
 * */


//启动仪器服务器
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 3000, clientTracking: true});
console.log('ws server is running at port 3000......');
const crypto = require('crypto'); //sha1用的加密模块

//启动网页服务器
const express = require('express');
const app = express();
const http = require('http').Server(app);
http.listen(3001, function () {
    console.log('web server is running on port:3001......');
});
const bodyParser = require('body-parser');   //解析POST请求体用到
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());
app.use(express.static('public'));  //静态文件，如CSS、图片等放到/public文件夹里

const cookieParser = require('cookie-parser');
const session = require('express-session');
app.use(cookieParser());
app.use(session({
    secret: 'unitLogin',
    cookie: {
        maxAge: 6000000000,//value值为数字，之前设置成了字符串，坑死~
    },
    resave: false,
    saveUninitialized: true,
}));

//标准时间格式
const sd = require('silly-datetime');

//连接数据库
const {Pool} = require('pg');
const pool = new Pool({
    user: 'dbuser',
    host: 'localhost',
    database: 'bcadb',
    password: 'cstf158',
    port: 5432,
    max: 200,   //最大client数
    idleTimeoutMillis: 300000,  //client最多空闲时间，超出就被断开
    connectionTimeoutMillis: 2000  //新建连接时的超时

});
pool.on('error', (err, client) => {
    console.error('Unexpected error on idel client', err);
    process.exit(-1);
});

//初始化仪器状态
{
    let dbres = pool.query("UPDATE device_tbl SET localip=$1,device_state=$2 WHERE id>0", ['unknown', 'unknown'])
        .then(dbres => {
            console.log("Initialze all device state to unknown-----------");
        })
        .catch(e => console.error(e.stack));
}

//--------------------------------------------公共函数和全局变量-----------------------------------//
//判断是否JSON
function isJson(message) {
    let index1 = message.indexOf("{");
    let index2 = message.indexOf("}");
    let index3 = message.indexOf(":");
    if (index1 != -1 && index2 != -1 && index3 != -1) {
        try {
            JSON.parse(message);
            return true;   //parse 不报错，就是
        } catch (e) {
            return false
        }
    } else {
        return false;
    }
}

//SHA1散列函数
function SHA(str) {
    let shasum = crypto.createHash('sha1');
    shasum.update(str, 'utf8');
    let resultStr = shasum.digest('hex');
    console.log("SHA1 result of data is:", resultStr);
    return resultStr;
}

//保存上传数据入数据库的函数
function saveDB(dataUpload) {
    let dataObj = JSON.parse(dataUpload);
    let TestID = dataObj.testID;
    let UUID = dataObj.UUID;
    let UID = dataObj.memberId;
    let Name = dataObj.name;
    let Sex = dataObj.sex;
    let BirthYear = dataObj.birthYear;
    let Height = dataObj.height;
    let DeviceID = dataObj.deviceID;
    let DeviceType = dataObj.deviceType;
    console.log("When saveDB,DeviceType=" + DeviceType);
    let TestDate = dataObj.testDate;
    let Fat = dataObj.Fat;
    let Bone = dataObj.Bone;
    let Protein = dataObj.Protein;
    let Water = dataObj.Water;
    let ICW = dataObj.ICW;
    let ECW = dataObj.ECW;
    let Muscle = dataObj.Muscle;
    let LBM = dataObj.LBM;
    let Weight = dataObj.Weight;
    let Standard_weight = dataObj.Standard_weight;
    let Weight_control = dataObj.Weight_control;
    let Fat_control = dataObj.Fat_control;
    let Muscle_control = dataObj.Muscle_control;
    let PBF = dataObj.PBF;
    let SMM = dataObj.SMM;
    let BMI = dataObj.BMI;
    let WHR = dataObj.WHR;
    let BMR = dataObj.BMR;
    let Edema = dataObj.Edema;
    let VFI = dataObj.VFI;
    let BodyAge = dataObj.BodyAge;
    let Score = dataObj.Score;
    let BodyType = dataObj.BodyType;
    let LiverRisk = dataObj.LiverRisk;
    let TR_fat = dataObj.TR_fat;
    let LA_fat = dataObj.LA_fat;
    let RA_fat = dataObj.RA_fat;
    let LL_fat = dataObj.LL_fat;
    let RL_fat = dataObj.RL_fat;
    let TR_water = dataObj.TR_water;
    let LA_water = dataObj.LA_water;
    let RA_water = dataObj.RA_water;
    let LL_water = dataObj.LL_water;
    let RL_water = dataObj.RL_water;
    let TR_muscle = dataObj.TR_muscle;
    let LA_muscle = dataObj.LA_muscle;
    let RA_muscle = dataObj.RA_muscle;
    let LL_muscle = dataObj.LL_muscle;
    let RL_muscle = dataObj.RL_muscle;
    //console.log("uploadData:",dataObj);
    //存入基本数据库(共49项测试结果)
    let saveResultStr = "INSERT INTO test_result_tbl (testid,uuid,uid,name,sex,birthyear,height,deviceid,devicetype,testdate,fat,bone,protein,water,icw,ecw,muscle,lbm,weight,standard_weight,weight_control,fat_control,muscle_control,pbf,smm,bmi,whr,bmr,edema,vfi,body_age,score,body_type,liver_risk,tr_fat,la_fat,ra_fat,ll_fat,rl_fat,tr_water,la_water,ra_water,ll_water,rl_water,tr_muscle,la_muscle,ra_muscle,ll_muscle,rl_muscle) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49) RETURNING *";
    let saveResult = [TestID, UUID, UID, Name, Sex, BirthYear, Height, DeviceID, DeviceType, TestDate, Fat, Bone, Protein, Water, ICW, ECW, Muscle, LBM, Weight, Standard_weight, Weight_control, Fat_control, Muscle_control, PBF, SMM, BMI, WHR, BMR, Edema, VFI, BodyAge, Score, BodyType, LiverRisk, TR_fat, LA_fat, RA_fat, LL_fat, RL_fat, TR_water, LA_water, RA_water, LL_water, RL_water, TR_muscle, LA_muscle, RA_muscle, LL_muscle, RL_muscle];
    let dbresBasic = pool.query(saveResultStr, saveResult)
        .then(dbresBasic => {
            console.log("基本库插入成功。TestID:", dbresBasic.rows[0].testid);
        })
        .catch(e => console.error(e.stack));

    //存入当前结果数据库(每个测试者只保留最新结果,供统计使用)
    //判断数据库是否有此人，如无，插入数据
    let dbresCurrent = pool.query("SELECT uuid,uid FROM current_result_tbl WHERE uuid=$1 AND uid=$2", [UUID, UID])
        .then(dbresCurrent => {
            if (dbresCurrent.rows.length == 0) {
                console.log("无此人，插入当前库");
                let saveResultStr2 = "INSERT INTO current_result_tbl (testid,uuid,uid,name,sex,birthyear,height,deviceid,devicetype,testdate,fat,bone,protein,water,icw,ecw,muscle,lbm,weight,standard_weight,weight_control,fat_control,muscle_control,pbf,smm,bmi,whr,bmr,edema,vfi,body_age,score,body_type,liver_risk,tr_fat,la_fat,ra_fat,ll_fat,rl_fat,tr_water,la_water,ra_water,ll_water,rl_water,tr_muscle,la_muscle,ra_muscle,ll_muscle,rl_muscle) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49) RETURNING *";
                let saveResult2 = [TestID, UUID, UID, Name, Sex, BirthYear, Height, DeviceID, DeviceType, TestDate, Fat, Bone, Protein, Water, ICW, ECW, Muscle, LBM, Weight, Standard_weight, Weight_control, Fat_control, Muscle_control, PBF, SMM, BMI, WHR, BMR, Edema, VFI, BodyAge, Score, BodyType, LiverRisk, TR_fat, LA_fat, RA_fat, LL_fat, RL_fat, TR_water, LA_water, RA_water, LL_water, RL_water, TR_muscle, LA_muscle, RA_muscle, LL_muscle, RL_muscle];
                let dbresInsertCurrent = pool.query(saveResultStr2, saveResult2)
                    .then(dbresInsertCurrent => {
                        console.log("当前库插入成功。TestID:", dbresInsertCurrent.rows[0].testid);
                    })
                    .catch(e => console.error(e.stack));
            } else {
                console.log("已有此人数据,更新当前库");  //不更新个人信息，只更新成绩
                let updateResultStr = "UPDATE current_result_tbl SET testid=$1,testdate=$2,fat=$3,bone=$4,protein=$5,water=$6,icw=$7,ecw=$8,muscle=$9,lbm=$10,weight=$11, standard_weight=$12,weight_control=$13,fat_control=$14,muscle_control=$15,pbf=$16,smm=$17,bmi=$18,whr=$19,bmr=$20,edema=$21,vfi=$22,body_age=$23,score=$24,body_type=$25,liver_risk=$26,tr_fat=$27,la_fat=$28,ra_fat=$29,ll_fat=$30,rl_fat=$31,tr_water=$32,la_water=$33,ra_water=$34,ll_water=$35,rl_water=$36,tr_muscle=$37,la_muscle=$38,ra_muscle=$39,ll_muscle=$40,rl_muscle=$41,devicetype=$42 WHERE uuid=$43 AND uid=$44 RETURNING *";
                let updateResult = [TestID, TestDate, Fat, Bone, Protein, Water, ICW, ECW, Muscle, LBM, Weight, Standard_weight, Weight_control, Fat_control, Muscle_control, PBF, SMM, BMI, WHR, BMR, Edema, VFI, BodyAge, Score, BodyType, LiverRisk, TR_fat, LA_fat, RA_fat, LL_fat, RL_fat, TR_water, LA_water, RA_water, LL_water, RL_water, TR_muscle, LA_muscle, RA_muscle, LL_muscle, RL_muscle, DeviceType, UUID, UID];
                let dbresUpdateCurrent = pool.query(updateResultStr, updateResult)
                    .then(dbresUpdateCurrent => {
                        console.log("当前库更新成功。TestID:", dbresUpdateCurrent.rows[0].testid);
                    })
                    .catch(e => console.error(e.stack));
            }
        })
        .catch(e => console.error(e.stack));

}//end of function saveDB

//保存HTTP上传数据入触摸屏数据库（无人员姓名、无单位编号）的函数,避免重复ID破坏基本数据库
function saveDB_http(dataUpload) {
    let dataObj = JSON.parse(dataUpload);
    let TestID = dataObj.testID;
    let UUID = dataObj.UUID;
    let UID = dataObj.memberId;
    let Name = dataObj.name;
    let Sex = dataObj.sex;
    let BirthYear = dataObj.birthYear;
    let Height = dataObj.height;
    let DeviceID = dataObj.deviceID;
    let DeviceType = dataObj.deviceType;
    let TestDate = dataObj.testDate;
    let Fat = dataObj.Fat;
    let Bone = dataObj.Bone;
    let Protein = dataObj.Protein;
    let Water = dataObj.Water;
    let ICW = dataObj.ICW;
    let ECW = dataObj.ECW;
    let Muscle = dataObj.Muscle;
    let LBM = dataObj.LBM;
    let Weight = dataObj.Weight;
    let Standard_weight = dataObj.Standard_weight;
    let Weight_control = dataObj.Weight_control;
    let Fat_control = dataObj.Fat_control;
    let Muscle_control = dataObj.Muscle_control;
    let PBF = dataObj.PBF;
    let SMM = dataObj.SMM;
    let BMI = dataObj.BMI;
    let WHR = dataObj.WHR;
    let BMR = dataObj.BMR;
    let Edema = dataObj.Edema;
    let VFI = dataObj.VFI;
    let BodyAge = dataObj.BodyAge;
    let Score = dataObj.Score;
    let BodyType = dataObj.BodyType;
    let LiverRisk = dataObj.LiverRisk;
    let TR_fat = dataObj.TR_fat;
    let LA_fat = dataObj.LA_fat;
    let RA_fat = dataObj.RA_fat;
    let LL_fat = dataObj.LL_fat;
    let RL_fat = dataObj.RL_fat;
    let TR_water = dataObj.TR_water;
    let LA_water = dataObj.LA_water;
    let RA_water = dataObj.RA_water;
    let LL_water = dataObj.LL_water;
    let RL_water = dataObj.RL_water;
    let TR_muscle = dataObj.TR_muscle;
    let LA_muscle = dataObj.LA_muscle;
    let RA_muscle = dataObj.RA_muscle;
    let LL_muscle = dataObj.LL_muscle;
    let RL_muscle = dataObj.RL_muscle;
    //console.log("uploadData:",dataObj);
    //存入触摸屏数据库(共49项测试结果)
    let saveResultStr = "INSERT INTO touch_result_tbl (testid,uuid,uid,name,sex,birthyear,height,deviceid,devicetype,testdate,fat,bone,protein,water,icw,ecw,muscle,lbm,weight,standard_weight,weight_control,fat_control,muscle_control,pbf,smm,bmi,whr,bmr,edema,vfi,body_age,score,body_type,liver_risk,tr_fat,la_fat,ra_fat,ll_fat,rl_fat,tr_water,la_water,ra_water,ll_water,rl_water,tr_muscle,la_muscle,ra_muscle,ll_muscle,rl_muscle) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49) RETURNING *";
    let saveResult = [TestID, UUID, UID, Name, Sex, BirthYear, Height, DeviceID, DeviceType, TestDate, Fat, Bone, Protein, Water, ICW, ECW, Muscle, LBM, Weight, Standard_weight, Weight_control, Fat_control, Muscle_control, PBF, SMM, BMI, WHR, BMR, Edema, VFI, BodyAge, Score, BodyType, LiverRisk, TR_fat, LA_fat, RA_fat, LL_fat, RL_fat, TR_water, LA_water, RA_water, LL_water, RL_water, TR_muscle, LA_muscle, RA_muscle, LL_muscle, RL_muscle];
    let dbresBasic = pool.query(saveResultStr, saveResult)
        .then(dbresBasic => {
            console.log("触屏库插入成功。TestID:", dbresBasic.rows[0].testid);
        })
        .catch(e => console.error(e.stack));
    //触摸屏测试数据不提供查询功能
}//end of function saveDB_http

//时间格式化方法
Date.prototype.format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

////每分钟检查一次所有设备在线状态,标志为false。
const refreshState = setInterval(function mark() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive == false) {
            return ws.terminate();  //关闭无效连接
        }
        ws.isAlive = false;
    });
    console.log("Check all ws connection....mark client.isAlive to false ");
}, 60000);


//--------------------------------JSON API---------------------------------------//
//注册本单位测试人员信息
app.post('/api/personInfo/', function (req, res) {
    console.log('register unit req.body=', req.body);
    let tUUID, tUID, tName, tSex, tBirthYear, tHeight, tPhone;
    //提取上传的人员信息
    try {
        tUUID = req.body.uuid;
        tUID = req.body.uid;
        tName = req.body.name;
        tPhone = req.body.phone;
        tSex = req.body.sex;
        tHeight = req.body.height;
        tBirthYear = req.body.birthYear;
        tNote = req.body.note;

        let dbres = pool.query("SELECT * FROM unit_tbl WHERE uuid=$1", [tUUID])
            .then(dbres => {
                if (dbres.rows.length == 0) {
                    console.log("无此单位，不予注册");
                    res.send("FAIL");
                } else {
                    //判断数据库是否有此人，如无，写入人员库
                    let dbres2 = pool.query("SELECT * FROM person_tbl WHERE uuid=$1 AND uid=$2", [tUUID, tUID])
                        .then(dbres2 => {
                            if (dbres2.rows.length == 0) {
                                console.log(tUID, " 无此人信息，插入");
                                let addPersonStr = "INSERT INTO person_tbl (uuid,uid,name,sex,birthyear,height,phone,note)VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *";
                                let addPersonResult = [tUUID, tUID, tName, tSex, tBirthYear, tHeight, tPhone, tNote];
                                let dbres3 = pool.query(addPersonStr, addPersonResult)
                                    .then(dbres3 => {
                                        console.log("人员信息已插入:", dbres3.rows);
                                        res.send("OK");
                                    })
                                    .catch(e => {
                                        res.send("FAIL");
                                        console.error(e.stack)
                                    });
                            } else {
                                console.log(tUID, " 有此人信息，更新");
                                let updatePersonStr = "UPDATE person_tbl SET name=$1,sex=$2,birthyear=$3,height=$4,phone=$5,note=$6 WHERE uid=$7 AND uuid=$8 RETURNING *";
                                let updatePersonResult = [tName, tSex, tBirthYear, tHeight, tPhone, tNote, tUID, tUUID];
                                let dbres4 = pool.query(updatePersonStr, updatePersonResult)
                                    .then(dbres4 => {
                                        console.log("人员信息已更新:", dbres4.rows);
                                        res.send("OK");
                                    })
                                    .catch(e => {
                                        res.send("FAIL");
                                        console.error(e.stack)
                                    });
                            }
                        })
                        .catch(e => console.error(e.stack));
                }
            })
            .catch(e => console.error(e.stack));

    } catch (e) {
        console.log("提交的注册人员信息有误！--register person info is valid!");
    }

});


//开始测试
app.post('/api/test/:deviceID', function (req, res) {
    //仪器编号来源于扫二维码取得
    let deviceID = req.params.deviceID;
    //人员信息来源于POST表单
    console.log('test req.body=', req.body);
    let tUID, tUUID;
    try {
        tUID = req.body.uid;
        tUUID = req.body.uuid;
        console.log("开始测试,deviceID=", deviceID, "UUID=", tUUID, "UID=", tUID);
        //判断数据库是否有此人
        let dbres = pool.query("SELECT * FROM person_tbl WHERE uuid=$1 AND uid=$2", [tUUID, tUID])
            .then(dbres => {
                if (dbres.rows.length == 0) {
                    console.log("无此人信息，请注册");
                    res.send("FAIL");
                } else {
                    console.log(tUID, "有此人，开始测试,下发信息");
                    //构造JSON对象
                    let personInfo = {
                        "message": "userInfo",
                        "memberName": dbres.rows[0].name,
                        "memberId": dbres.rows[0].uid,
                        "memberSex": dbres.rows[0].sex,
                        "height": dbres.rows[0].height,
                        "birthYear": dbres.rows[0].birthyear,
                        "deviceID": deviceID,
                        "UUID": tUUID
                    };
                    res.send("OK");
                    // Broadcast to all.向客户端发送测试人员信息
                    wss.clients.forEach(function each(client) {
                        if (client.readyState === WebSocket.OPEN && client.id == deviceID) {
                            client.send(JSON.stringify(personInfo));    //转换成字符串发出
                            console.log("测试人员信息已发送！！！Test command sent to ", client.id);
                        }
                    });
                }//end of else
            })
            .catch(e => console.error(e.stack));

    } catch (e) {
        console.log("人员信息不全 -- tester information is not complete");
    }


});


//取消测试
app.post('/api/cancelTest/:deviceID', function (req, res) {
    let deviceID = req.params.deviceID;
    let cancelMessage = "{\"message\":\"cancel test\"," + "\"deviceID\":\"" + deviceID + "\"}";
    console.log(cancelMessage);
    // Broadcast to all.向连接的客户端发送取消信息
    wss.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN && client.id == deviceID) {
            client.send(cancelMessage);
            console.log("取消测试信息已发送！！！Cancel command sent to ", client.id);
        }
    });
    res.send("Test Canceled");

});

//查询本单位当前库全部数据
app.get('/api/result/:uuid/', function (req, res) {
    let uuid = req.params.uuid;
    let uid = req.params.uid;
    console.log("查询全部结果......单位编号：", uuid);
    //在当前成绩库中查询当前人员最新记录
    let dbres = pool.query("SELECT * FROM test_result_tbl WHERE uuid=$1", [uuid])
        .then(dbres => {
            if (dbres.rows.length == 0) {
                console.log(uuid, "-", uid, ":无此单位数据");
                res.send("FAIL");
            } else {
                console.log(uuid, "-", uid, ":当前单位结果查询成功");
                //console.log(dbres.rows[0]);
                res.json(dbres.rows);
            }
        })
        .catch(e => console.error(e.stack));
});

//查询最近结果
app.get('/api/result/:uuid/:uid/', function (req, res) {
    let uuid = req.params.uuid;
    let uid = req.params.uid;
    console.log("查询结果......单位编号：", uuid, " 人员编号：", uid);
    //在当前成绩库中查询当前人员最新记录
    let dbres = pool.query("SELECT * FROM current_result_tbl WHERE uuid=$1 AND uid=$2", [uuid, uid])
        .then(dbres => {
            if (dbres.rows.length == 0) {
                console.log(uuid, "-", uid, ":无此人数据");
                res.send("FAIL");
            } else {
                console.log(uuid, "-", uid, ":当前结果查询成功");
                console.log(dbres.rows[0]);
                res.send(dbres.rows[0]);
            }
        })
        .catch(e => console.error(e.stack));
});
//2018-06-04
app.get('/api/testResult/:uuid/:testid/', function (req, res) {
    let uuid = req.params.uuid;
    let testid = req.params.testid;
    console.log("查询结果......单位编号：", uuid, " 测试编号：", testid);
    //在当前成绩库中查询当前人员最新记录
    let dbres = pool.query("SELECT * FROM test_result_tbl WHERE uuid=$1 AND testid=$2", [uuid, testid])
        .then(dbres => {
            if (dbres.rows.length == 0) {
                console.log(uuid, "-", testid, ":无此人数据");
                res.send("FAIL");
            } else {
                console.log(uuid, "-", testid, ":当前结果查询成功");
                //console.log(dbres.rows[0]);
                res.send(dbres.rows[0]);
            }
        })
        .catch(e => console.error(e.stack));
});

//查询历史记录
app.get('/api/history/:uuid/:uid', function (req, res) {
    let uuid = req.params.uuid;
    let uid = req.params.uid;
    //在基本数据库中查询当前人员所有测试记录,按测试时间倒序，限50条
    let dbres = pool.query("SELECT * FROM test_result_tbl WHERE uuid=$1 AND uid=$2 order by ID desc LIMIT 50", [uuid, uid])
        .then(dbres => {
            if (dbres.rows.length == 0) {
                console.log(uuid, "-", uid, ":无此人历史数据");
                res.send("FAIL");
            } else {
                console.log(uuid, "-", uid, ":历史数据查询成功");
                res.json(dbres.rows);
            }
        })
        .catch(e => console.error(e.stack));
});

//单位查询历史记录
app.get('/api/history/:uuid/', function (req, res) {
    let uuid = req.params.uuid;
    //在基本数据库中查询本单位人员历史记录,按测试时间倒序
    let dbres = pool.query("SELECT * FROM test_result_tbl WHERE uuid=$1 order by ID desc", [uuid])
        .then(dbres => {
            if (dbres.rows.length == 0) {
                console.log(uuid, "-", "无此单位历史数据");
                res.send("FAIL");
            } else {
                console.log(uuid, "-", "历史数据查询成功");
                res.json(dbres.rows);
            }
        })
        .catch(e => console.error(e.stack));
});


//单位查询HTTP数据历史记录
app.get('/api/historyHttp/:uuid/', function (req, res) {
    let uuid = req.params.uuid;
    //在基本数据库中查询本单位人员历史记录,按测试时间倒序
    let dbres = pool.query("SELECT * FROM touch_result_tbl WHERE uuid=$1 order by ID desc", [uuid])
        .then(dbres => {
            if (dbres.rows.length == 0) {
                console.log(uuid, "-", "无此单位历史数据");
                res.send("FAIL");
            } else {
                console.log(uuid, "-", "单位HTTP历史数据查询成功");
                res.json(dbres.rows);
            }
        })
        .catch(e => console.error(e.stack));
});

//设备状态查询-全部一览
app.get('/api/deviceState/', function (req, res) {
    console.log("check all devices state");

    //查询设备状态数据库
    let sql = '';
    if(req.session.username !== 'superroot'){
        sql = "SELECT * FROM device_tbl WHERE uuid='" + req.session.username + "' ORDER BY regtime DESC"
    }else {
        sql = 'SELECT * FROM device_tbl ORDER BY regtime DESC'
    }
    console.log(sql);
    let dbres = pool.query(sql)
        .then(dbres => {
            if (dbres.rows.length == 0) {
                console.log("no device online!");
                res.send("FAIL");
            } else {
                res.json(dbres.rows);
            }
        })
        .catch(e => console.error(e.stack));
});

//设备状态查询-单台设备
app.get('/api/deviceState/:deviceID', function (req, res) {
    let deviceID = req.params.deviceID;
    console.log("check devices state:", deviceID);

    //查询设备状态数据库
    let dbres = pool.query("SELECT * FROM device_tbl WHERE deviceid=$1", [deviceID])
        .then(dbres => {
            if (dbres.rows.length == 0) {
                console.log("无此设备");
            } else {
                res.json(dbres.rows[0]);
            }
        })
        .catch(e => console.error(e.stack));
});

//查询设备IP
app.get('/api/ip/:deviceID', function (req, res) {
    let deviceID = req.params.deviceID;
    let deviceIP = "unknown";
    console.log("请求查看仪器 Check localIp:" + deviceID + " IP地址");

    wss.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN && client.id == deviceID) {
            console.log("-->the device is online");
            //从数据库中查IP
            let dbres = pool.query("SELECT * FROM device_tbl WHERE deviceid=$1", [deviceID])
                .then(dbres => {
                    if (dbres.rows.length == 0) {
                        console.log("no device online!");
                    } else {
                        deviceIP = dbres.rows[0].localip;
                        console.log("The deviceIP is:", deviceIP);
                        res.send(deviceIP);
                    }
                })
                .catch(e => console.error(e.stack));

            //再次查询仪器状态以更新数据库
            let askState = {"message": "askDeviceState", "deviceID": ""};
            askState.deviceID = deviceID;
            client.send(JSON.stringify(askState));
            console.log("ask state for localIp!");
        }
    });


});

//查询单位信息
app.get('/api/unitInfo_registered/', function (req, res) {
    console.log("请求查看注册单位情况");
    //在数据库中查询当单位记录,按名字倒序
    let dbres = pool.query("SELECT * FROM unit_tbl order by unitname")
        .then(dbres => {
            if (dbres.rows.length == 0) {
                console.log("无单位数据");
                res.send("FAIL");
            } else {
                res.json(dbres.rows);
            }
        })
        .catch(e => console.error(e.stack));

});

//注册单位编码
app.post('/api/unitInfo/', function (req, res) {
    console.log(' req.body=', req.body);
    //提取上传的人员信息
    try {
        let tUUID = req.body.UUID;
        let tUnitName = req.body.UnitName;
        let tPassword = req.body.Password;
        let tTime = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');  //获取当前时间
        let dbres = pool.query("SELECT * FROM unit_tbl WHERE uuid=$1", [tUUID])
            .then(dbres => {
                if (dbres.rows.length == 0) {
                    console.log("无此单位，新注册");
                    let addUnitStr = "INSERT INTO unit_tbl (uuid,unitname,psw,regtime)VALUES($1,$2,$3,$4) RETURNING *";
                    let addUnitResult = [tUUID, tUnitName, tPassword, tTime];
                    let dbres2 = pool.query(addUnitStr, addUnitResult)
                        .then(dbres2 => {
                            console.log("插入单位信息成功");
                            res.send("OK");
                        })
                        .catch(dbres2 => {
                            console.log("插入单位信息失败");
                            res.send("FAIL");
                        })
                } else {
                    console.log("已有此单位编码，请更换编码");
                    res.send("USED");
                }
            })
            .catch(e => console.error(e.stack));
    } catch (e) {
        console.log("注册的单位信息有误！")
    }

});


//存储直接上报（HTTP POST）的测试数据
app.post('/api/httpResult/', function (req, res) {
    console.log('HTTP post data=', req.body);
    let messageObj = req.body;
    if (messageObj.message == 'DataUpload') {
        let dataUpload = "";
        dataUpload = JSON.stringify(messageObj);
        console.log("dataUpload=", dataUpload);
        saveDB_http(dataUpload);
    }

});


//查询单位统计结果.使用CurrentResult表（每个人只存储最新记录），按人头统计。
app.get('/api/unit/:uuid', function (req, res) {
    let unitID = req.params.uuid;
    let unitIDstr = unitID + "%";   //后匹配模式
    let unitInfo = {
        unitName: "",
        count: "0",         //人数
        averageScore: "0",
        good: "0",     //80分以上人数（次）
        mid: "0",      //70-80分人数
        low: "0",      //70分以下人数
        overWeight: "0",    //超重人数
        fatPercent: "0",    //肥胖率
        bodyType1: "0",
        bodyType2: "0",
        bodyType3: "0",
        bodyType4: "0",
        bodyType5: "0",
        bodyType6: "0",
        bodyType7: "0",
        bodyType8: "0",
        bodyType9: "0"
    };

    //查单位名称
    let dbres = pool.query("SELECT * FROM unit_tbl WHERE uuid=$1", [unitID])
        .then(dbres => {
            unitInfo.unitName = dbres.rows[0].unitname;

            //-------------------查统计结果 ----------------------------------------------------------
            let dbres2 = pool.query("SELECT * FROM current_result_tbl WHERE uuid LIKE $1", [unitIDstr])
                .then(dbres2 => {
                    let totalScore, good, mid, low, overWeight, bodyType1, bodyType2, bodyType3, bodyType4, bodyType5,
                        bodyType6, bodyType7, bodyType8, bodyType9;
                    totalScore = good = mid = low = overWeight = bodyType1 = bodyType2 = bodyType3 = bodyType4 = bodyType5 = bodyType6 = bodyType7 = bodyType8 = bodyType9 = 0;
                    //计算各项
                    unitInfo.count = dbres2.rows.length;        //总人数
                    for (let i = 0; i < dbres2.rows.length; i++) {
                        totalScore += dbres2.rows[i].score;
                        if (dbres2.rows[i].score >= 80) {
                            good++;
                        } else if (dbres2.rows[i].score < 80 && dbres2.rows[i].Score >= 70) {
                            mid++;
                        } else if (dbres2.rows[i].score < 70) {
                            low++;
                        }
                        if (dbres2.rows[i].bmi > 24.0) {
                            overWeight++;
                        }
                        if (dbres2.rows[i].body_type == "1") {
                            bodyType1++;
                        } else if (dbres2.rows[i].body_type == "2") {
                            bodyType2++;
                        } else if (dbres2.rows[i].body_type == "3") {
                            bodyType3++;
                        } else if (dbres2.rows[i].body_type == "4") {
                            bodyType4++;
                        } else if (dbres2.rows[i].body_type == "5") {
                            bodyType5++;
                        } else if (dbres2.rows[i].body_type == "6") {
                            bodyType6++;
                        } else if (dbres2.rows[i].body_type == "7") {
                            bodyType7++;
                        } else if (dbres2.rows[i].body_type == "8") {
                            bodyType8++;
                        } else if (dbres2.rows[i].body_type == "9") {
                            bodyType9++;
                        }
                    }//end of for
                    let averageScore = totalScore / dbres2.rows.length;
                    unitInfo.averageScore = averageScore.toFixed(1);            //平均分
                    unitInfo.good = good;                                       //良好人数
                    unitInfo.mid = mid;                                         //合格人数
                    unitInfo.low = low;                                         //较低人数
                    unitInfo.overWeight = overWeight;                           //超重人数
                    let fatPercent = bodyType7 / dbres2.rows.length;
                    unitInfo.fatPercent = fatPercent.toFixed(1);               //肥胖人比例
                    unitInfo.bodyType1 = bodyType1;                             //隐性肥胖人数
                    unitInfo.bodyType2 = bodyType2;                             //肌肉不足人数
                    unitInfo.bodyType3 = bodyType3;                             //消瘦型人数
                    unitInfo.bodyType4 = bodyType4;                             //脂肪过多型人数
                    unitInfo.bodyType5 = bodyType5;                             //健康匀称型人数
                    unitInfo.bodyType6 = bodyType6;                             //低脂肪型人数
                    unitInfo.bodyType7 = bodyType7;                             //肥胖型人数
                    unitInfo.bodyType8 = bodyType8;                             //超重肌肉型人数
                    unitInfo.bodyType9 = bodyType9;                             //运动员型人数

                    res.json(unitInfo);
                })//end of dbres2 then
                .catch(e => console.error(e.stack));
        })//end of dbres then
        .catch(e => console.error(e.stack));
});

//登陆
// let unit_id = '';//设置单位编码;

app.post('/api/login/', function (req, res) {
    let login_id = req.body.login_id;
    let login_pwd = req.body.login_pwd;
    console.log(login_id, login_pwd);
    /*
    * 发送内容查询匹配，验证用户是否存在
    * 跳转页面
    * */
    let dbres = pool.query('SELECT psw FROM unit_tbl WHERE uuid=$1', [login_id])
        .then(dbres => {
            if (dbres.rows.length === 0) {
                console.log('该用户不存在');
                res.send('该用户不存在');
            } else {
                console.log(dbres.rows[0].psw);
                if (login_pwd !== dbres.rows[0].psw) {
                    console.log('密码错误');
                    res.send('密码错误，请重新输入');
                } else {
                    console.log('登陆成功');
                    req.session.username = login_id;
                    //页面跳转
                    if(login_id !== 'superroot'){
                        res.redirect('/unitInfo/');
                    }else {
                        res.redirect('/monitorAll/');
                    }
                }
            }
        })
        .catch(e => console.error(e.stack));
});

app.get('/api/logout/', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            res.send('FAIL');
        } else {
            res.send('OK');
        }
    })
});

//人员列表初始化
app.get('/api/personQuery/', function (req, res) {
    console.log(req.session.id, req.sessionID, req.session, req.session.username);
    let dbres2 = pool.query("SELECT * FROM person_tbl WHERE uuid=$1 order by id desc", [req.session.username])
        .then(dbres2 => {
            res.json(dbres2.rows);
        })
        .catch(err => console.error(err));
});

//人员查询
app.get('/api/personSearch/', function (req, res) {
    pool.query("SELECT * FROM person_tbl WHERE uuid=$1 AND uid LIKE '%" + req.query.person_uid + "%' AND name LIKE '" + req.query.person_name + "%'", [req.session.username])
        .then(dbres => {
            res.json(dbres.rows);
        })
        .catch(err => console.error(err));
});

//测试结果初始化
app.get('/api/resultQuery/', function (req, res) {
    let dbres2 = pool.query("SELECT * FROM test_result_tbl WHERE uuid=$1 order by testdate desc", [req.session.username])
        .then(dbres2 => {
            res.json(dbres2.rows);
        })
        .catch(err => console.error(err));
});

//测试结果查询
app.get('/api/resultSearch/', function (req, res) {
    console.log(req.query.search_uid);
    pool.query("SELECT * FROM test_result_tbl WHERE uuid=$1 AND uid LIKE '%" + req.query.search_uid + "%' AND name LIKE '" + req.query.search_name + "%'", [req.session.username])
        .then(dbres => {
            res.json(dbres.rows);
        })
        .catch(err => console.error(err));
});

//删除人员
app.get('/api/deletePerson/', function (req, res) {
    let del_id = req.query;
    let arr = [];
    for (let key in del_id) {
        arr.push(key);
    }
    let index_str = `(${arr.join(',')})`;
    console.log(index_str);
    pool.query('DELETE FROM person_tbl WHERE id in ' + index_str)
        .then(dbres => {
            res.send('OK');
        })
        .catch(err => {
            console.error(err);
            res.send('FAIL');
        });
});

//删除设备
app.get('/api/deleteDevice/', function (req, res) {
    let del_id = req.query;
    let arr = [];
    for (let key in del_id) {
        arr.push(key);
    }
    let index_str = `(${arr.join(',')})`;
    console.log(index_str);
    pool.query('DELETE FROM device_tbl WHERE id in ' + index_str)
        .then(dbres => {
            res.send('OK');
        })
        .catch(err => {
            console.error(err);
            res.send('FAIL');
        });
});

//建议提交
app.post('/api/adviceSubmit/', function (req, res) {
    console.log(req.body.sport_advice, req.body.nutrition_advice, req.body.cure_advice);
    let insertSql = "update unit_tbl set sport_advice=$1,nutrition_advice=$2,cure_advice=$3 where uuid=$4";
    let insertVal = [req.body.sport_advice, req.body.nutrition_advice, req.body.cure_advice, req.session.username];
    pool.query(insertSql, insertVal)
        .then(dbres2 => {
            console.log("建议保存成功");
            res.send("OK");
        })
        .catch(dbres2 => {
            console.log("建议保存失败");
            res.send("FAIL");
        });
});

//建议查询
app.get('/api/searchAdvice/', function (req, res) {
    pool.query('SELECT sport_advice,nutrition_advice,cure_advice FROM unit_tbl WHERE uuid = $1', [req.session.username])
        .then(dbres => {
            if (dbres.rows.length > 0) {
                res.json(dbres.rows[0]);
            } else {
                res.send('FAIL');
            }
        })
        .catch(err => console.error(err));
});

//添加设备
app.post('/api/registerDevice', function (req, res) {
    let addtime = (new Date()).format("yyyy-MM-dd hh:mm:ss");
    console.log(new Date().format("yyyy-MM-dd hh:mm:ss"), addtime);
    //查询是否存在该设备：
    /*
    * 返回状态码：'1': 设备已存在，'2': 设备编码有误， '3': 设备添加成功， '4': 插入数据库失败
    * */
    let dbres = pool.query('SELECT uuid,deviceid FROM device_tbl WHERE deviceid=$1', [req.body.device_id])
        .then(dbres => {
            if (dbres.rows.length > 0) {
                console.log(dbres.rows[0].uuid);
                if (dbres.rows[0].uuid === req.session.username) {
                    console.log('已存在该设备');
                    res.send('1');
                } else {
                    console.log('设备编码已被占用');
                    res.send('2');
                }
            } else {
                pool.query('INSERT INTO device_tbl(uuid,addtime,deviceid) VALUES ($1,$2,$3)', [req.session.username, addtime, req.body.device_id])
                    .then(dbres2 => {
                        console.log("设备添加成功");
                        res.send("3");
                    })
                    .catch(dbres2 => {
                        console.log("设备添加失败");
                        res.send("4");
                    });
            }
        })
        .catch(err => console.error(err));
});

//数据统计
app.get('/api/countAnalysis/:e_id', function (req, res) {
    let e_id = req.params.e_id;
    console.log('tongji ' + req.session.username);
    pool.query(`SELECT bmi,body_type,score FROM current_result_tbl WHERE uuid=$1`, [req.session.username])
        .then(dbres => {
            //console.log(dbres.rows.length);
            let data = [];
            let len = dbres.rows.length;
            if (e_id === 'body_analysis') {
                let b_type_1 = b_type_2 = b_type_3 = b_type_4 = b_type_5 = b_type_6 = b_type_7 = b_type_8 = b_type_9 = 0;
                for (let i = 0; i < len; i++) {
                    switch (dbres.rows[i].body_type) {
                        case 1:
                            b_type_1++;
                            break;
                        case 2:
                            b_type_2++;
                            break;
                        case 3:
                            b_type_3++;
                            break;
                        case 4:
                            b_type_4++;
                            break;
                        case 5:
                            b_type_5++;
                            break;
                        case 6:
                            b_type_6++;
                            break;
                        case 7:
                            b_type_7++;
                            break;
                        case 8:
                            b_type_8++;
                            break;
                        case 9:
                            b_type_9++;
                            break;
                    }
                }
                //console.log(b_type_1, b_type_2, b_type_3, b_type_4, b_type_5, b_type_6, b_type_7, b_type_8, b_type_9);
                data = [
                    {value: b_type_1, name: '隐形肥胖型'},
                    {value: b_type_2, name: '脂肪过多型'},
                    {value: b_type_3, name: '肥胖型'},
                    {value: b_type_4, name: '肌肉不足型'},
                    {value: b_type_5, name: '健康匀称型'},
                    {value: b_type_6, name: '超重肌肉型'},
                    {value: b_type_7, name: '消瘦型'},
                    {value: b_type_8, name: '低脂肪型'},
                    {value: b_type_9, name: '运动型'},
                ];
            }
            else if (e_id === 'score_analysis') {
                let s_less_60 = s_between_60_70 = s_between_70_80 = s_more_80 = 0;
                for (let i = 0; i < len; i++) {
                    if (dbres.rows[i].score < 60) {
                        s_less_60++;
                    } else if (dbres.rows[i].score >= 60 && dbres.rows[i].score < 70) {
                        s_between_60_70++;
                    } else if (dbres.rows[i].score >= 70 && dbres.rows[i].score < 80) {
                        s_between_70_80++;
                    } else {
                        s_more_80++;
                    }
                }
                data = [
                    {value: s_less_60, name: '少于60分'},
                    {value: s_between_70_80, name: '60~70分'},
                    {value: s_between_70_80, name: '70~80分'},
                    {value: s_more_80, name: '高于80分'},
                ]
            }
            else if (e_id === 'weight_analysis') {
                let w_light = w_normal = w_super_fat = w_fat_1 = w_fat_2 = w_fat_3 = 0;
                for (let i = 0; i < len; i++) {
                    if (dbres.rows[i].bmi < 18.5) {
                        w_light++;
                    } else if (dbres.rows[i].bmi >= 18.5 && dbres.rows[i].bmi <= 24) {
                        w_normal++;
                    } else if (dbres.rows[i].bmi > 24 && dbres.rows[i].bmi <= 30) {
                        w_super_fat++;
                    } else if (dbres.rows[i].bmi > 30 && dbres.rows[i].bmi <= 35) {
                        w_fat_1++;
                    } else if (dbres.rows[i].bmi > 35 && dbres.rows[i].bmi <= 40) {
                        w_fat_2++;
                    } else if (dbres.rows[i].bmi > 40) {
                        w_fat_3++;
                    }
                }
                data = [
                    {value: w_light, name: '体重较轻', itemStyle: {color: 'orange'}},
                    {value: w_normal, name: '正常', itemStyle: {color: 'green'}},
                    {value: w_super_fat, name: '超重', itemStyle: {color: 'purple'}},
                    {value: w_fat_1, name: '肥胖I级', itemStyle: {color: 'rgb(51, 51, 51)'}},
                    {value: w_fat_2, name: '肥胖II级', itemStyle: {color: 'blue'}},
                    {value: w_fat_3, name: '肥胖III级', itemStyle: {color: 'red'}},
                ]
            }
            res.json(data);
        })
        .catch(err => console.error(err));
});

//人员修改
app.post('/api/updatePerson/', function (req, res) {
    let id = req.body.id,
        uuid = req.body.uuid,
        uid = req.body.uid,
        name = req.body.name,
        sex = req.body.sex,
        height = req.body.height,
        birthyear = req.body.birthyear,
        phone = req.body.phone,
        note = req.body.note;
    console.log(id, uuid, uid, name, sex, height, birthyear, phone, note);
    pool.query('UPDATE person_tbl SET uuid=$1,uid=$2,name=$3,sex=$4,height=$5,birthyear=$6,phone=$7,note=$8 where id=$9', [uuid, uid, name, sex, height, birthyear, phone, note, id])
        .then(dbres => {
            res.send('OK');
        })
        .catch(err => console.error(err));
});

//单位修改密码验证
app.post('/api/passQuery/', function (req, res) {
    let password = req.body.password;
    pool.query('SELECT psw FROM unit_tbl WHERE uuid=$1', [req.session.username])
        .then(dbres => {
            if (dbres.rows.length > 0) {
                if (dbres.rows[0].psw === password) {
                    res.send('OK');
                } else {
                    res.send('FAIL');
                }
            }
        })
        .catch(err => console.error(err))
});

//单位信息修改
app.post('/api/updateUnit/', function (req, res) {
    let admin_name = req.body.admin_name,
        admin_phone = req.body.admin_phone,
        psw = req.body.psw;
    console.log(admin_name, admin_phone, psw);
    pool.query('UPDATE unit_tbl SET admin_name = $1,admin_phone = $2,psw = $3 WHERE uuid = $4', [admin_name, admin_phone, psw, req.session.username])
        .then(dbres => {
            res.send('OK');
        })
        .catch(err => console.error(err));
});

//修改单位信息初始信息
app.get('/api/unitQuery/', function (req, res) {
    pool.query('SELECT * FROM unit_tbl WHERE uuid=$1', [req.session.username])
        .then(dbres => {
            res.json(dbres.rows[0]);
        })
        .catch(err => console.error(err));
});

//获取坐标
app.get('/api/getCoordinate/', (req, res) => {
    let devicetype = req.query.devicetype;
    console.log(devicetype);
    pool.query('SELECT * FROM coordinate_tbl WHERE devicetype = $1',[devicetype])
        .then(dbres => {
            console.log(dbres.rows[0]);
            res.json(dbres.rows[0]);
        })
});

//修改坐标
/*app.post('/api/updateCoordinate/',function (req, res) {
    console.log(req.body);
    res.send('OK');
    let update_sql = 'UPDATE coordinate_tbl SET name_x=$1,name_y=$2,sex_x=$3,sex_y=$4,age_x=$5,age_y=$6,height_x=$7,height_y=$8,testdate_x=$9,testdate_y=$10,score_x=$11,score_y=$12,body_age_x=$13,body_age_y=$14,fat_x=$15,fat_y=$16,pbf_x=$17,pbf_y=$18,fat_range_x=$19,fat_range_y=$20,bone_x=$21,bone_y=$22,bone_scale_x=$23,bone_scale_y=$24,bone_range_x=$25,bone_range_y=$26,protein_x=$27,protein_y=$28,protein_scale_x=$29,protein_scale_y=$30,protein_range_x=$31,protein_range_y=$32,water_x=$33,water_y=$34,water_scale_x=$35,water_scale_y=$36,water_range_x=$37,water_range_y=$38,icw_x=$39,icw_y=$40,ecw_x=$41,ecw_y=$42,water_copy_x=$43,water_copy_y=$44,muscle_x=$45,muscle_y=$46,lbm_x=$47,lbm_y=$48,weight_x=$49,weight_y=$50,weightline_x=$51,weightline_y=$52,line_weight_x=$53,line_weight_y=$54,weight_range_x=$55,weight_range_y=$56,muscleline_x=$57,muscleline_y=$58,line_muscle_x=$59,line_muscle_y=$60,muscle_range_x=$61,muscle_range_y=$62,pbfline_x=$63,pbfline_y=$64,line_pbf_x=$65,line_pbf_y=$66,pbf_range_x=$67,pbf_range_y=$68,boneline_x=$69,boneline_y=$70,line_bone_x=$71,line_bone_y=$72,bone_range_copy_x=$73,bone_range_copy_y=$74,waterline_x=$75,waterline_y=$76,line_water_x=$77,line_water_y=$78,water_range_copy_x=$79,water_range_copy_y=$80,smmline_x=$81,smmline_y=$82,line_smm_x=$83,line_smm_y=$84,smm_range_x=$85,smm_range_y=$86,bmiline_x=$87,bmiline_y=$88,line_bmi_x=$89,line_bmi_y=$90,bmi_range_x=$91,bmi_range_y=$92,whrline_x=$93,whrline_y=$94,line_whr_x=$95,line_whr_y=$96,whr_range_x=$97,whr_range_y=$98,tr_fat_x=$99,tr_fat_y=$100,vfiline_x=$101,vfiline_y=$102,line_vfi_x=$103,line_vfi_y=$104,water_scale_copy_x=$105,water_scale_copy_y=$106,icw_copy_x=$107,icw_copy_y=$108,ecw_copy_x=$109,ecw_copy_y=$110,edema_range_x=$111,edema_range_y=$112,edematrue_x=$113,edematrue_y=$114,ra_water_x=$115,ra_water_y=$116,la_water_x=$117,la_water_y=$118,rl_water_x=$119,rl_water_y=$120,ll_water_x=$121,ll_water_y=$122,tr_water_x=$123,tr_water_y=$124,ra_fat_x=$125,ra_fat_y=$126,la_fat_x=$127,la_fat_y=$128,rl_fat_x=$129,rl_fat_y=$130,ll_fat_x=$131,ll_fat_y=$132,tr_fat_copy_x=$133,tr_fat_copy_y=$134,ra_muscle_x=$135,ra_muscle_y=$136,la_muscle_x=$137,la_muscle_y=$138,rl_muscle_x=$139,rl_muscle_y=$140,ll_muscle_x=$141,ll_muscle_y=$142,tr_muscle_x=$143,tr_muscle_y=$144,body_type_x=$145,body_type_y=$146,standard_weight_x=$147,standard_weight_y=$148,weight_control_x=$149,weight_control_y=$150,fat_control_x=$151,fat_control_y=$152,muscle_control_x=$153,muscle_control_y=$154,bmi_x=$155,bmi_y=$156,pbftrue_x=$157,pbftrue_y=$158,pbftrue_copy_x=$159,pbftrue_copy_y=$160,whrtrue_x=$161,whrtrue_y=$162,proteintrue_x=$163,proteintrue_y=$164,bonetrue_x=$165,bonetrue_y=$166,bmr_x=$167,bmr_y=$168,daily_energy_x=$169,daily_energy_y=$170,unit_bmr_x=$171,unit_bmr_y=$172,proteinline_x=$173,proteinline_y=$174,line_protein_x=$175,line_protein_y=$176,protein_range_copy_x=$177,protein_range_copy_y=$178,fatline_x=$179,fatline_y=$180,line_fat_x=$181,line_fat_y=$182,fat_range_copy_x=$183,fat_range_copy_y=$184,vfi_range_x=$185,vfi_range_y=$186,tr_fatline_x=$187,tr_fatline_y=$188,tr_fat_range_x=$189,tr_fat_range_y=$190,smm_x=$191,smm_y=$192,smmtrue_x=$193,smmtrue_y=$194,up_muscle_x=$195,up_muscle_y=$196,down_muscle_x=$197,down_muscle_y=$198,balance_x=$199,balance_y=$200,line_tr_fat_x=$201,line_tr_fat_y=$202,fatline_copy_x=$203,fatline_copy_y=$204,line_fat_copy_x=$205,line_fat_copy_y=$206,water_persent_range_x=$207,water_persent_range_y=$208,waterline_copy_x=$209,waterline_copy_y=$210,line_water_copy_x=$211,line_water_copy_y=$212,edema_x=$213,edema_y=$214 WHERE devicetype=$215';
    let update_data = [req.body.name_x,req.body.name_y,req.body.sex_x,req.body.sex_y,req.body.age_x,req.body.age_y,req.body.height_x,req.body.height_y,req.body.testdate_x,req.body.testdate_y,req.body.score_x,req.body.score_y,req.body.body_age_x,req.body.body_age_y,req.body.fat_x,req.body.fat_y,req.body.pbf_x,req.body.pbf_y,req.body.fat_range_x,req.body.fat_range_y,req.body.bone_x,req.body.bone_y,req.body.bone_scale_x,req.body.bone_scale_y,req.body.bone_range_x,req.body.bone_range_y,req.body.protein_x,req.body.protein_y,req.body.protein_scale_x,req.body.protein_scale_y,req.body.protein_range_x,req.body.protein_range_y,req.body.water_x,req.body.water_y,req.body.water_scale_x,req.body.water_scale_y,req.body.water_range_x,req.body.water_range_y,req.body.icw_x,req.body.icw_y,req.body.ecw_x,req.body.ecw_y,req.body.water_copy_x,req.body.water_copy_y,req.body.muscle_x,req.body.muscle_y,req.body.lbm_x,req.body.lbm_y,req.body.weight_x,req.body.weight_y,req.body.weightline_x,req.body.weightline_y,req.body.line_weight_x,req.body.weightline_y-2,req.body.weight_range_x,req.body.weight_range_y,req.body.muscleline_x,req.body.muscleline_y,req.body.line_muscle_x,req.body.muscleline_y-2,req.body.muscle_range_x,req.body.muscle_range_y,req.body.pbfline_x,req.body.pbfline_y,req.body.line_pbf_x,req.body.pbfline_y-2,req.body.pbf_range_x,req.body.pbf_range_y,req.body.boneline_x,req.body.boneline_y,req.body.line_bone_x,req.body.boneline_y-2,req.body.bone_range_copy_x,req.body.bone_range_copy_y,req.body.waterline_x,req.body.waterline_y,req.body.line_water_x,req.body.waterline_y-2,req.body.water_range_copy_x,req.body.water_range_copy_y,req.body.smmline_x,req.body.smmline_y,req.body.line_smm_x,req.body.smmline_y-2,req.body.smm_range_x,req.body.smm_range_y,req.body.bmiline_x,req.body.bmiline_y,req.body.line_bmi_x,req.body.bmiline_y-2,req.body.bmi_range_x,req.body.bmi_range_y,req.body.whrline_x,req.body.whrline_y,req.body.line_whr_x,req.body.whrline_y-2,req.body.whr_range_x,req.body.whr_range_y,req.body.tr_fat_x,req.body.tr_fat_y,req.body.vfiline_x,req.body.vfiline_y,req.body.line_vfi_x,req.body.vfiline_y-2,req.body.water_scale_copy_x,req.body.water_scale_copy_y,req.body.icw_copy_x,req.body.icw_copy_y,req.body.ecw_copy_x,req.body.ecw_copy_y,req.body.edema_range_x,req.body.edema_range_y,req.body.edematrue_x,req.body.edematrue_y,req.body.ra_water_x,req.body.ra_water_y,req.body.la_water_x,req.body.la_water_y,req.body.rl_water_x,req.body.rl_water_y,req.body.ll_water_x,req.body.ll_water_y,req.body.tr_water_x,req.body.tr_water_y,req.body.ra_fat_x,req.body.ra_fat_y,req.body.la_fat_x,req.body.la_fat_y,req.body.rl_fat_x,req.body.rl_fat_y,req.body.ll_fat_x,req.body.ll_fat_y,req.body.tr_fat_copy_x,req.body.tr_fat_copy_y,req.body.ra_muscle_x,req.body.ra_muscle_y,req.body.la_muscle_x,req.body.la_muscle_y,req.body.rl_muscle_x,req.body.rl_muscle_y,req.body.ll_muscle_x,req.body.ll_muscle_y,req.body.tr_muscle_x,req.body.tr_muscle_y,req.body.body_type_x,req.body.body_type_y,req.body.standard_weight_x,req.body.standard_weight_y,req.body.weight_control_x,req.body.weight_control_y,req.body.fat_control_x,req.body.fat_control_y,req.body.muscle_control_x,req.body.muscle_control_y,req.body.bmi_x,req.body.bmi_y,req.body.pbftrue_x,req.body.pbftrue_y,req.body.pbftrue_copy_x,req.body.pbftrue_copy_y,req.body.whrtrue_x,req.body.whrtrue_y,req.body.proteintrue_x,req.body.proteintrue_y,req.body.bonetrue_x,req.body.bonetrue_y,req.body.bmr_x,req.body.bmr_y,req.body.daily_energy_x,req.body.daily_energy_y,req.body.unit_bmr_x,req.body.unit_bmr_y,req.body.proteinline_x,req.body.proteinline_y,req.body.line_protein_x,req.body.proteinline_y-2,req.body.protein_range_copy_x,req.body.protein_range_copy_y,req.body.fatline_x,req.body.fatline_y,req.body.line_fat_x,req.body.fatline_y-2,req.body.fat_range_copy_x,req.body.fat_range_copy_y,req.body.vfi_range_x,req.body.vfi_range_y,req.body.tr_fatline_x,req.body.tr_fatline_y,req.body.tr_fat_range_x,req.body.tr_fat_range_y,req.body.smm_x,req.body.smm_y,req.body.smmtrue_x,req.body.smmtrue_y,req.body.up_muscle_x,req.body.up_muscle_y,req.body.down_muscle_x,req.body.down_muscle_y,req.body.balance_x,req.body.balance_y,req.body.line_tr_fat_x,req.body.tr_fatline_y-2,req.body.fatline_copy_x,req.body.fatline_copy_y,req.body.line_fat_copy_x,req.body.fatline_copy_y-2,req.body.water_persent_range_x,req.body.water_persent_range_y,req.body.waterline_copy_x,req.body.waterline_copy_y,req.body.line_water_copy_x,req.body.waterline_copy_y-2,req.body.edema_x,req.body.edema_y,req.body.devicetype];
    pool.query(update_sql,update_data).then(dbres => {
        res.send('OK');
    }).catch(err => {
        console.error(err);
        res.send('FAIL');
    })
});*/



//----------------------------------------------网页路由----------------------------------------//

//说明
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');  //给出输入人员的界面
});
app.get('/note', function (req, res) {
    res.sendFile(__dirname + '/note.html');  //使用说明和责任
});

//测试
app.get('/test/:deviceID', function (req, res) {
    let deviceID = req.params.deviceID;
    res.sendFile(__dirname + '/test.html');  //给出输入人员的界面
});

//注册后跳转测试
app.get('/test/:deviceID/:uuid/:uid', function (req, res) {
    let deviceID = req.params.deviceID;
    let uuid = req.params.uuid;
    let uid = req.params.uid;
    res.sendFile(__dirname + '/testInfo.html');  //给出输入人员的界面
});

//带有仪器编号的成绩查询
app.get('/result/:uuid/:uid/:deviceID', function (req, res) {
    console.log("get result page with deviceID");
    res.sendFile(__dirname + '/result.html');
});
//不带仪器编号的查询
app.get('/result/:uuid/:uid/', function (req, res) {
    console.log("get result page");
    res.sendFile(__dirname + '/result.html');
});

//根据测试编号查询：2018-06-04
app.get('/testResult/:uuid/:testid/', function (req, res) {
    res.sendFile(__dirname + '/result.html');
});

//历史成绩
app.get('/history/:uuid/:uid', function (req, res) {
    console.log("get history page");
    res.sendFile(__dirname + '/history.html');
});

//通用查询
app.get('/search/', function (req, res) {
    res.sendFile(__dirname + '/search.html');
});

//人员注册
app.get('/registerPerson/', function (req, res) {
    console.log("registering person");
    res.sendFile(__dirname + '/registerPerson.html');
});

//人员注册带测试跳转
app.get('/registerPerson/:deviceID', function (req, res) {
    console.log("registering person goto test");
    res.sendFile(__dirname + '/registerPersonTest.html');
});

//注册单位
app.get('/registerUnit/', function (req, res) {
    res.sendFile(__dirname + '/registerUnit.html');
});

//已注册的单位信息
app.get('/myUnit/', function (req, res) {
    res.sendFile(__dirname + '/myUnit.html');
});

//设备监控页面
app.get('/monitor/:deviceID', function (req, res) {
    let deviceID = req.params.deviceID;
    let askState = {"message": "askDeviceState", "deviceID": ""};
    askState.deviceID = deviceID;
    console.log("ask device state:", deviceID);

    // Broadcast to all.向所有连接的客户端发送状态查询信息
    wss.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN && client.id == deviceID) {
            console.log("Monitor client.id=", client.id);
            client.send(JSON.stringify(askState));
        }
    });
    res.sendFile(__dirname + '/monitor.html');
});
//所有在线设备状态
app.get('/monitorAll/', function (req, res) {
    res.sendFile(__dirname + '/monitorAll.html');
});

//饮食建议
app.get('/diet/:dailyEnergy', function (req, res) {
    res.sendFile(__dirname + '/diet.html');
});
//膳食平衡餐盘图
app.get('/food/', function (req, res) {
    res.sendFile(__dirname + '/food.html');
});


//登陆 add at 2018/05/18
app.get('/login/', function (req, res) {
    res.sendFile(`${__dirname}/login.html`);
});

//人员列表 add at 2018/05/22
app.get('/unitInfo/', function (req, res) {
    if (!req.session.username) {
        res.sendFile(`${__dirname}/notLogin.html`);
        return;
    }
    res.sendFile(`${__dirname}/unitInfo.html`);
});

//建议 add at 2018/05/23
app.get('/advice/', function (req, res) {
    if (!req.session.username) {
        res.sendFile(`${__dirname}/notLogin.html`);
        return;
    }
    res.sendFile(`${__dirname}/advice.html`);
});

//添加设备 add at 2018/05/23
/*app.get('/registerDevice/', function (req, res) {
    res.sendFile(`${__dirname}/registerDevice.html`);
});*/

//统计分析 add at 2018/05/25
app.get('/countAnalysis/', function (req, res) {
    if (!req.session.username) {
        res.sendFile(`${__dirname}/notLogin.html`);
        return;
    }
    res.sendFile(`${__dirname}/countAnalysis.html`);
});

//单位信息修改 add at 2018/05/30
app.get('/updateUnit/', function (req, res) {
    res.sendFile(`${__dirname}/updateUnit.html`);
});

//忘记密码
app.get('/forgetPsw/', function (req, res) {
    res.sendFile(`${__dirname}/forgetPsw.html`);
});

//测试报告
app.get('/report/:source/:uuid/:uid/', function (req, res) {
    res.sendFile(`${__dirname}/report.html`);
});

//坐标设置页
/*app.get('/coordinate/',function (req, res) {
    res.sendFile(`${__dirname}/coordinate.html`);
});*/

//偏移量设置
app.get('/offset/:source/:uuid/:uid',function (req, res) {
    res.sendFile(`${__dirname}/offset.html`);
});
//------------------------------------------仪器端信息处理----------------------------------------------//
wss.on('connection', function connection(ws) {
    console.log('new device connection');
    var deviceID;     //local viable in this connection
    var dataUpload = "";
    var dataBuffer;
    var verifyFlag = 0;
    var counter = 0;
    var stateFlag = "OFF";  //Initial conneting state

    ws.on('message', function incoming(message) {

        if (message == 'ping') {  //最基本的ping/pong心跳机制，因掩码问题采用字符串发送,也构成基本事件循环
            ws.isAlive = true;
            ws.send('pong');
            console.log("Receive ping from deviceID:" + deviceID + " -stateFlag=" + stateFlag);
        }

        /*
        //循环测试
        if (message == 'cancelSuccess') {
          console.log("再次测量-----------------------------------");
          let mockTesterObj = {        //模拟用的测试人员
                "message":"userInfo",
                "deviceID":"16ART1B0007",
                "memberId":"13902345678",
                "memberName":"张三",
                "memberSex":"1",
                "birthYear":"1987",
                "height":"178.5"
           };
          ws.send(JSON.stringify(mockTesterObj));    //再次发送人员信息
        }
        * */

        //对收到的信息进行JSON解析---------------------------------
        if (isJson(message)) {  //JSON
            try {
                var messageObj = JSON.parse(message);
            } catch (e) {
                console.log("JSON parse error!");
            }

            //设备注册(必须在stateFlag是OFF的情况下，便于断网重连）
            if (messageObj['message'] == 'register' && stateFlag == 'OFF') {
                try {
                    ws.send('{\"message\":\"register success\"}');
                }
                catch (e) {
                    console.log("sending register success error:", e)
                }
                ;
                deviceID = messageObj['deviceID'];                           //仪器编号确定
                ws.id = deviceID;                                            //为websocket会话编号
                console.log("After registering, ws.id=================", ws.id);
                stateFlag = "ON";
                let localIp = "unknown";
                let holder = "unknown";
                let regtime = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');  //获取当前时间
                let deviceState = "已登录 registered";
                console.log("device registered =", deviceID);
                //存入设备状态数据库
                //判断数据库是否有此设备，如无，插入，否则更新。
                let dbres = pool.query("SELECT * FROM device_tbl WHERE deviceid=$1", [deviceID])
                    .then(dbres => {
                        if (dbres.rows.length == 0) {
                            console.log(deviceID, " 无此设备信息，插入");
                            let addDeviceStr = "INSERT INTO device_tbl (deviceid, localip, holder, regtime, device_state)VALUES($1,$2,$3,$4,$5) RETURNING *";
                            let addDeviceResult = [deviceID, localIp, holder, regtime, deviceState];
                            let dbres2 = pool.query(addDeviceStr, addDeviceResult)
                                .then(dbres2 => {
                                    console.log("设备注册信息已插入:", dbres2.rows[0].deviceid);
                                })
                                .catch(e => {
                                    console.error(e.stack)
                                });
                        } else {
                            console.log(deviceID, " 有此设备信息，更新注册时间");
                            let updateDeviceStr = "UPDATE device_tbl SET regtime=$1 WHERE deviceid=$2 RETURNING *";
                            let updateDeviceResult = [regtime, deviceID];
                            let dbres3 = pool.query(updateDeviceStr, updateDeviceResult)
                                .then(dbres3 => {
                                    console.log("设备注册信息已更新:", dbres3.rows[0].deviceid);
                                })
                                .catch(e => {
                                    console.error(e.stack)
                                });
                        }
                    })
                    .catch(e => {
                        console.error(e.stack)
                    });

                //设备注册后首次查询仪器状态
                let askState = {"message": "askDeviceState", "deviceID": ""};
                askState.deviceID = deviceID;
                ws.send(JSON.stringify(askState));
            }

            //接受设备状态
            if (messageObj['message'] == 'deviceState') {
                //deviceStateObj = JSON.stringify(messageObj);
                deviceStateObj = messageObj;
                console.log("上报的设备状态 Receving Device State::::::::::::::", deviceStateObj);
                let deviceID = deviceStateObj.deviceID;
                let localIp = deviceStateObj.localIp;
                let holder = deviceStateObj.UnitName;
                let deviceState = deviceStateObj.deviceState;
                console.log("deviceID=", deviceID, " localIp=", localIp, " holder=", holder, " deviceState=", deviceState);

                //更新设备状态数据库
                let updateDeviceStr = "UPDATE device_tbl SET localip=$1, holder=$2, device_state=$3 WHERE deviceid=$4 RETURNING *";
                let updateDeviceResult = [localIp, holder, deviceState, deviceID];
                let dbres4 = pool.query(updateDeviceStr, updateDeviceResult)
                    .then(dbres4 => {
                        console.log("设备状态信息已更新--------------------------:", dbres4.rows[0]);
                    })
                    .catch(e => {
                        console.error(e.stack)
                    });

            }

            //接受上报数据，先校验
            if (messageObj['message'] == 'DataUpload') {
                console.log('received: %s', message);
                dataUpload = JSON.stringify(messageObj);
                dataBuffer = new Buffer(message);          //直接将收到的文本转化为二进制
                console.log("收到上报数据，来自:", messageObj.deviceID);
            }

            //校验通过
            if (messageObj['message'] == "verify") {
                let sha1 = messageObj.sha1;
                console.log("report sha1=", sha1);
                let encrpt = SHA(dataBuffer);  //对二进制进行加密
                console.log("encrpt=", encrpt);
                if (sha1 == encrpt) {
                    try {
                        ws.send('{\"message\":\"upload ok\"}');
                    }
                    catch (e) {
                        console.log("sending upload ok error:", e)
                    }
                    ;
                    verifyFlag = 1;
                    //解析测试数据并入库
                    if (dataUpload != "") {
                        saveDB(dataUpload);
                    }
                } else {
                    console.log("校验不符");
                }//end of sha1==encrpt
            }//end of message verify

        }//end of is JSON

    }); //end of ws on message

    ws.on('error', function errorHandler() {
        console.log("ws error!");
        stateFlag = "Error";
        ws.terminate();  //强行中断，触发断线重连
        //初始化仪器状态
        let dbres = pool.query("UPDATE device_tbl SET localip=$1,device_state=$2 WHERE deviceid=$3", ['error', 'error', deviceID])
            .then(dbres => {
                console.log("Update device state to error:", deviceID);
            })
            .catch(e => console.error(e.stack));

    });

    ws.on('close', function connection() {
        console.log("This ws closed: ", deviceID);
        ws.isAlive = false;
        stateFlag = "OFF";
        let dbres = pool.query("UPDATE device_tbl SET localip=$1,device_state=$2 WHERE deviceid=$3", ['offline', 'offline', deviceID])
            .then(dbres => {
                console.log("Update device state to off:", deviceID);
            })
            .catch(e => console.error(e.stack));
        console.log("On ws close event, the stateFlag is:" + stateFlag);
    });

});//end of on device connection


wss.on('error', function connection(ws) {
    console.log("Server error-------------------!");
});
