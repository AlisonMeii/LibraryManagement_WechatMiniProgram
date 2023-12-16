// pages/record/record.js
var util = require('../../unit');
const app=getApp();
const db=wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.domain,
    tabs: ['当前预约', '历史预约'],
    current:0,
    seatIDNow:'',
    startTimeNow:'',
    now:[],
    date:'',
    time:'',
    timeEnd:'',
    reason:'',
    // 历史预约数据
    history:[],
  },
  tabSelect:function(e){
    var current = e.currentTarget.dataset.id
    console.log(current, e)
    this.setData({
      current:current
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getTime()
      db.collection('record').where({
        openid : app.globalData._openid,
        studentID:'2019213716',
        state:'true'
      }).get().then(res=>{
        console.log(res)
        this.setData({
          now:res.data[0],
          seatIDNow:res.data[0].seatID,
          startTimeNow:res.data[0].oppTime[11]+res.data[0].oppTime[12]+res.data[0].oppTime[13]+res.data[0].oppTime[14]+res.data[0].oppTime[15]+res.data[0].oppTime[16]+res.data[0].oppTime[17]+res.data[0].oppTime[18],
        })
      })
      db.collection('record').where({
        openid : app.globalData._openid,
        studentID:'2019213716',
        state:'false'
      }).get().then(res=>{
        console.log(res)
        this.setData({
          history:res.data,
        })
      })
  },
  getTime: function () {
    let that = this;
    let currentTime = util.formatTime(new Date());
    console.log(currentTime)
    that.setData({
      date: currentTime[0]+ currentTime[1]+ currentTime[2]+ currentTime[3]+"-"+ currentTime[5]+ currentTime[6]+"-"+ currentTime[8]+ currentTime[9],
      time: currentTime[11]+ currentTime[12]+ currentTime[13]+ currentTime[14]+currentTime[15],
      timeEnd: currentTime[11]+ currentTime[12]+ currentTime[13]+ currentTime[14]+currentTime[15],
    })
  },
  bindDateChange(e) {
    let that = this;
    console.log(e.detail.value)
    that.setData({
      time: e.detail.value,
    })
  },
  bindDateChange2(e) {
    let that = this;
    that.setData({
      timeEnd: e.detail.value,
    })
  },
  getReason(e){
    console.log(e.detail.value);
    this.setData({
      reason:e.detail.value
    })
  },
  send(e){
    var that = this;
    var start = (parseInt(this.data.time[0]*10)+parseInt(this.data.time[1]))*60+(parseInt(this.data.time[3])*10 + parseInt(this.data.time[4]));
    var end = (parseInt(this.data.timeEnd[0]*10)+parseInt(this.data.timeEnd[1]))*60+(parseInt(this.data.timeEnd[3])*10 + parseInt(this.data.timeEnd[4]));
    console.log(end - start)
    if(end - start > 120){
      wx.showToast({
        title: '暂离时间要两个小时以内才行哦~',
        icon:'none',
        duration:2000
      })
    }
    else{
      if(this.data.reason == ''){
        wx.showToast({
          title: '要填写离开事由哦~',
          icon:'none',
          duration:2000
        })
      }
      else{
        wx.cloud.callFunction({
          name:'curd',
          data:{
              dbName:'leave',
              curd:'add',
              data:{
                studentID:app.globalData.ID,
                seatID:that.data.seatIDNow,
                timeStart:that.data.time,
                timeEnd:that.data.timeEnd,
                date:that.data.date,
                reason:that.data.reason
              }
          },
          success:res=>{
            wx.showToast({
              title: '提交成功',
              duration:2000
            })
          }
        })             
      }
    }
  },
})