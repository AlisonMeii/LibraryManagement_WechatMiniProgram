// pages/mine/mine.js
const app=getApp();
const db=wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected:2,
    avatarUrl:'',
    nickName:'',
    studentID:'',
    major:'',
    realName:'',
     // 全部使用完成座位信息
     allRecord:[],
     allTime:'',
    // 全部座位信息
    allRecordNow:[],
    date:'',
    time:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    db.collection('users').where({
      studentID:app.globalData.ID
    }).get().then(res=>{
      console.log(res)
      this.setData({
        nickName:res.data[0].nickName,
        studentID:res.data[0].studentID,
        avatarUrl:res.data[0].avatarUrl,
        major:res.data[0].major,
        realName:res.data[0].realName
      })
    }),
    db.collection('record').where({
      studentID:app.globalData.ID,
      state:'false'
    }).get().then(res=>{
      console.log(res.data)
      this.setData({
        allRecord:res.data
      })
      this.countUseTime()
    }),
    db.collection('record').where({
      studentID:app.globalData.ID
    }).get().then(res=>{
      console.log(res.data)
      this.setData({
        allRecordNow:res.data
      })
      this.judgeTime()
    })
  },
  toOtherPage(e){
    wx.navigateTo({
      url: '../shezhi/shezhi',
    })
  },
  countUseTime(){
    var allTime = 0;
    var i = 0;
    for(i = 0; i < this.data.allRecord.length;i++){
      var start = (parseInt(this.data.allRecord[0].arriveTime[0]*10)+parseInt(this.data.allRecord[0].arriveTime[1]))*60+(parseInt(this.data.allRecord[0].arriveTime[3])*10 + parseInt(this.data.allRecord[0].arriveTime[4]));
      var end = (parseInt(this.data.allRecord[0].endTime[0]*10)+parseInt(this.data.allRecord[0].endTime[1]))*60+(parseInt(this.data.allRecord[0].endTime[3])*10 + parseInt(this.data.allRecord[0].endTime[4]));
      allTime = allTime + (end - start);
    }
    this.setData({
      allTime: allTime/60
    })
  },
  judgeTime(){
    console.log(this.data.allRecordNow)
    var i = this.data.allRecordNow.length - 1;
    for(i; i >=0;i--){
      if(this.data.allRecordNow[i].state != 'overTime' && this.data.allRecordNow[i].arriveTime !='' ){
        console.log(this.data.allRecordNow[i].arriveTime)
        this.setData({
         date: this.data.allRecordNow[i].date,
         time:this.data.allRecordNow[i].arriveTime
        })
        break;
      }
    }
  },
  switchTab(e){
    console.log(e.currentTarget.dataset.index)
    this.setData({
      selected:e.currentTarget.dataset.index
    })
    if(e.currentTarget.dataset.index == 0){
      wx.navigateTo({
        url: '../firstPage/firstPage'
      })
    }
    if(e.currentTarget.dataset.index == 1){
      wx.navigateTo({
        url: '../add/add'
      })
    }
    if(e.currentTarget.dataset.index == 2){
      wx.navigateTo({
        url: '../mine/mine'
      })
    }
  },
  changeToRecord(e){
    wx.navigateTo({
      url: '../record/record',
    })
  },
  changeInfo(){
    wx.navigateTo({
      url: '../changeInf/changeInf',
    })
  },
})