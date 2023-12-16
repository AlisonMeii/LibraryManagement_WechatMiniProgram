// pages/setup/setup.js
const db = wx.cloud.database()
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    checkData: [{name:" ", status:false}],
    display:'',
    isRuleTrue:false,
    showModal: false, //false关闭模态框  true开启模态框
    ID:"",
    Password:"",
    judge:0,
    nickName:'',
    avatarUrl:'',
    _openId:'',
    userInfo:'',
    information:'',
  },
  globalData:{
    appid:'	wxcd2159005f41e3d1',
    secret:'b6c4652128f647648ddf913d08d04197'
  },
  onLoad: function (options) {
    this.login();
  },
  // 获得输入的ID
  getID(e){
    console.log(e.detail.value);
    this.setData({
      ID:e.detail.value
    })
    console.log(this.data.ID);
  },
  // 获取输入的密码
  getPassword(e){
    console.log(e.detail.value);
    this.setData({
      Password:e.detail.value
    })
  },
  showRule: function () {
    this.setData({
     isRuleTrue: true,
      display: "block"
    })
    },
    hideRule:function(){
      this.setData({
        isRuleTrue: false,
      })
    },
    okk:function(){
      this.setData({
        isRuleTrue: false,
      })
    },
    checkboxChange:function(e){
      console.log(e.detail.value)
      this.data.judge++;
    },

    signIn: function (e) {
      this.get();
     
      
    },
    get: function(){
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res.userInfo)
          this.setData({
            nickName:res.userInfo.nickName, //获取昵称
            avatarUrl:res.userInfo.avatarUrl //获取头像
          })
          console.log(this.data.nickName,this.data.ID)
          wx.cloud.callFunction({  //调用云函数，更新用户信息
            name:'curd',
            data:{
                dbName:'users',
                curd:'update',
                where:{
                  studentID:this.data.ID,
                  password:this.data.Password
                },
                data:{
                  avatarUrl: this.data.avatarUrl,
                  nickName: this.data.nickName,
                  openid:this.data._openId,
                }
            },
            success:res=>{ 
              db.collection('users').where({
                studentID: this.data.ID,
                password:this.data. Password
              }).get().then(res=>{
                console.log(res.data)
                this.setData({
                  information:res.data
                })
                 if(res.data.length == 1){
                  app.globalData.ID=res.data[0].studentID
                  console.log("iiiiii"+app.globalData.ID)
                  if(this.data.judge%2==0){
                    wx.showToast({
                      title: '请阅读《邮图有约用户须知》',
                      icon: 'none',
                      duration: 2000
                      })
                  }
                  else{
                      wx.navigateTo({
                        url: '../firstPage/firstPage'
                    })
                  }
                }
                else{
                  wx.showToast({
                    title: '账号或密码错误',
                    icon: 'none',
                    duration:2000
                  })
                }   
              }) 
            }
          })
        }
      })
    },
    login(){
      
      var that = this;
      var openid='';

      wx.login({
        success: function (res) {
          if (res.code) {
            var d = that.globalData;//这里存储了appid、secret、token串  
            var l = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + d.appid + '&secret=' + d.secret + '&js_code=' + res.code + '&grant_type=authorization_code';
            wx.request({
              url: l,
              data: {},
              method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT  
              // header: {}, // 设置请求的 header  
              success: function (res) {
                console.log(res)

                var obj = {};
                obj.openid = res.data.openid;
                obj.expires_in = Date.now() + res.data.expires_in;
              //存储openid
                openid = res.data.openid;
                that.setData({
                  _openId:openid
                })
                app.globalData._openId = that.data._openId;
              }
             
            });
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        }
      });
      
    },

 
})
