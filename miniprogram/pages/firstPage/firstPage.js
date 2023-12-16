// pages/firstPage/firstPage.js
var util = require('../../unit');
const app=getApp();
const db=wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected:0,
    avatarUrl:'',
    nickName:'',
    _openId:'',
    haveSeat:'',
    seatID:'',
    seatArea:'',
    oppTime:'',
    major:'',
    swiperList:'',
    swiperList:[],
    quickSeat:'', //快速查看座位
    // 全部使用座位信息
    allRecord:[],
    allTime:'',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log("app.globalData._openId11 "+app.globalData._openId,app.globalData.ID)
    db.collection('users').where({
      studentID:app.globalData.ID
    }).get().then(res => {
      console.log("res   "+res)
      this.setData({
        _openid: app.globalData.opneid,
        avatarUrl: res.data[0].avatarUrl,
        nickName: res.data[0].nickName,
        major:res.data[0].major,
        haveSeat:res.data[0].haveSeat,
      }),
      setInterval(function () {
        that.setData({
          time: util.formatTime(new Date())
        });
      }, 1000);
  
    }),
    db.collection('swipper').get().then((res)=>{
      this.setData({
        swiperList:res
      })
      console.log("data"+this.data.swiperList.data)
    })
    db.collection('record').where({
      studentID:app.globalData.ID,
      state:'false'
    }).get().then(res=>{
      console.log(res.data)
      this.setData({
        allRecord:res.data
      })
      this.countUseTime()
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
  getSeat(e){
    wx.navigateTo({
      url: '../getSeat/getSeat',
    })
  },
  getSeatQuick(e){
    var i = 0;
    var min=0;
    var position=0;
    var that =this;
    this. getTime();
    db.collection('lab').get().then(res=>{
      console.log(res.data)
      min=res.data[0].areaDensity;
      for(i=0;i<res.data.length;i++){
        if(res.data[i].areaDensity < min){
          min = res.data[i].areaDensity;
          position = i;
        }
      }
      this.setData({
        areaName:res.data[min].name
      })
      console.log('position='+position,"min="+min,res.data[position].name)
      db.collection('seat').where({
        seatState:'false', 
        areaName:res.data[position].name
      }).get().then(res=>{
       if(res.length != 0){
        console.log(res)
        that.setData({
          seatID:res.data[0].seatID
        })
        wx.showModal({
          confirmColor:'#6699CC',
          title:'空闲座位',
          content:res.data[0].seatID,
          success (r) {
            if (r.confirm && that.data.haveSeat == false) {
              that.change()
              wx.cloud.callFunction({
                name:'curd',
                data:{
                    dbName:'record',
                    curd:'add',
                    data:{
                      studentID:app.globalData.ID,
                      openid:app.globalData._openid,
                      seatID:that.data.seatID,
                      seatArea:that.data.areaName,
                      oppTime:that.data.oppTime,
                      state:'true',
                      arriveTime:'',
                    }
                },
                success:res=>{
                  wx.showToast({
                    title: '座位预约成功，请在15分钟内到达座位',
                    icon:'none',
                    duration:3000
                  })
                }
              })             
            } 
            else if(r.confirm){
              wx.showToast({
                title: '您当前已有正在预约的座位，无法再选择座位',
                icon:'none',
                duration:3000
              })
            }
          }
        })
       }
        else{
          wx.showToast({
            title: '当前没有空闲座位',
            icon:'none',
            duration:2000,
          })
        }
      })    
    })
  },
  change:function(){
    this.setData({
      haveSeat:true
    })
       wx.cloud.callFunction({
        name:'curd',
        data:{
           dbName:'users',
            curd:'update',
            data:{
              haveSeat:true
            }
        },
    })
    wx.cloud.callFunction({
      name:'curd',
      data:{
         dbName:'seat',
          curd:'update',
          where:{
            seatID:this.data.seatID
         },
          data:{
            seatState:true
          }
      },
  })
  },
  getTime: function () {
    let that = this;
    let currentTime = util.formatTime(new Date());
    that.setData({
      oppTime: currentTime
    })
  },
})