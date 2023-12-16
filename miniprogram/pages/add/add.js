// pages/add/add.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})