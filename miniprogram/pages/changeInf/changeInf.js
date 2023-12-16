// pages/changeInf/changeInf.js
const app=getApp();
const db=wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:'',
    nickName:'',
    school:'',
    call:'',
    ID:'',
    password:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db.collection('users').where({
      studentID:app.globalData.ID
    }).get().then(res => {
      console.log("res   "+res)
      this.setData({
        avatarUrl: res.data[0].avatarUrl,
        nickName: res.data[0].nickName,
        school:res.data[0].school,
        call:res.data[0].call,
        ID:app.globalData.ID,
        password:res.data[0].password
      })
      
    })
  },
  changeHead(e){
    var  _this = this;
     wx.chooseImage({
       count: 1, // 默认9     
       sizeType: ['original', 'compressed'],
      // 指定是原图还是压缩图，默认两个都有     
       sourceType: ['album', 'camera'],
      // 指定来源是相册还是相机，默认两个都有   
       success: function (res) {   
         console.log(res.tempFilePaths)
         _this.setData({
          avatarUrl: res.tempFilePaths
        })
      }
    })
  },
  getID(e){
    console.log(e.detail.value);
    this.setData({
      nickName:e.detail.value,
    })
  },
  getSchool(e){
    console.log(e.detail.value);
    this.setData({
     school:e.detail.value,
    })
  },
  getCall(e){
    console.log(e.detail.value);
    this.setData({
     call:e.detail.value,
    })
  },
  getStudentID(e){
    console.log(e.detail.value);
    this.setData({
     ID:e.detail.value,
    })
  },
  getPassword(e){
    console.log(e.detail.value);
    this.setData({
     password:e.detail.value,
    })
  },
  save(e){
    wx.cloud.callFunction({
      name:'curd',
      data:{
        dbName:'users',
        curd:'update',
        where:{
          studentID:app.globalData.ID,
        },
        data:{
          avatarUrl: this.data.avatarUrl,
          nickName: this.data.nickName,
          call:this.data.call,
          school:this.data.school,
        }
    },
    success:res=>{ 
      wx.showToast({
        title: '更改成功',
      })
    }
    })
  },

})