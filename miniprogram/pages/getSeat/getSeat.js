const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    list: [],
    load: true,
    canvasInfo: {}, //饼状图数据
    dataList: [{
      title: "空闲座位",
      value: 100,
    }, {
      title: "使用座位",
      value: 30,
    }, {
      title: "占座",
      value: 9,
    }],
    allfreeValue:'100',
    alluseingValue:'30',
    allhaveThingValue:'9',
    background:["rgb(215, 234, 255)","#336699","#99CCFF"],
    pieInfo: {},
    judge:'', //判断是否出现

    // 小组件
    // 日历
    hasEmptyGrid: false,
    cur_year: '',
    cur_month: '',
    todayIndex:'',
    display:'',
    isRuleTrue:false,
    showModal: false,
  },
  onLoad() {
    this.setNowDate(); //加载小组件日历
    this.messureCanvas() //画饼状图
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    let list = [{}];
    db.collection('lab').get().then(res=>{
      console.log(res.data)
      this.setData({
        list:res.data
      })

    })
  },
  onReady() {
    wx.hideLoading()
  },
  tabSelect(e) {
    console.log(e.currentTarget.dataset.id)
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
  },
  VerticalMain(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + list[i].id);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight;     
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (list[i].id - 1) * 50,
          TabCur: list[i].id
        })
        return false
      }
    }
  },

  // 饼状图
  messureCanvas() {
    let query = wx.createSelectorQuery().in(this);
    // 然后逐个取出navbar和header的节点信息
    // 选择器的语法与jQuery语法相同
    query.select('#pieCanvas').boundingClientRect();
    // 执行上面所指定的请求，结果会按照顺序存放于一个数组中，在callback的第一个参数中返回
    var that = this
    query.exec((res) => {
      // 分别取出navbar和header的高度 
      console.log(res)
      var canvasInfo = {}
      canvasInfo.width = res[0].width
      canvasInfo.height = res[0].height
      that.setData({
        canvasInfo: canvasInfo
      })
      console.log(canvasInfo)
      that.drawPie(-1)
    })
  },
  drawPie(index) {
    const ctxPie = wx.createCanvasContext("pieCanvas")
    var canvasInfo = this.data.canvasInfo
    var dataList = this.data.dataList
    var pieInfo = this.data.pieInfo
    var pieRadius = (canvasInfo.width - 90) / 4
    pieInfo.pieRadius = pieRadius
    var pieX = 30 + pieRadius
    pieInfo.centerX = pieX
    var pieY = 30 + pieRadius
    pieInfo.centerY = pieY
    var totalValue = 0
    for (var i = 0; i < dataList.length; i++) {
      totalValue = totalValue + dataList[i].value
    }
    var area = []
    for (var i = 0; i < dataList.length; i++) {
      var areaItem = {}
      ctxPie.beginPath()
      var start = 0
      for (var j = 0; j < i; j++) {
        start = start + dataList[j].value
      }
      if (i < dataList.length - 1) {
        if(index==i){
          ctxPie.arc(pieX, pieY, pieRadius+5, start / totalValue * 2 * Math.PI, (start + dataList[i].value) / totalValue * 2 * Math.PI)
        }else{
          ctxPie.arc(pieX, pieY, pieRadius, start / totalValue * 2 * Math.PI, (start + dataList[i].value) / totalValue * 2 * Math.PI)
        }
        areaItem.start = start / totalValue * 2 * Math.PI
        areaItem.end = (start + dataList[i].value) / totalValue * 2 * Math.PI
      } else {
        if(index == i){
          ctxPie.arc(pieX, pieY, pieRadius+5, start / totalValue * 2 * Math.PI, 2 * Math.PI)
        }else{
          ctxPie.arc(pieX, pieY, pieRadius, start / totalValue * 2 * Math.PI, 2 * Math.PI)
        }
        areaItem.start = start / totalValue * 2 * Math.PI
        areaItem.end = 2 * Math.PI
      }
      area.push(areaItem)
      ctxPie.lineTo(pieX, pieY);
      ctxPie.setFillStyle(this.data.background[i]);
      ctxPie.fill();
      ctxPie.closePath();
    }
    pieInfo.area = area
    this.data.pieInfo = pieInfo
    console.log(this.data.pieInfo)
    ctxPie.draw()
  },
  touchStart(e) {
    var pieInfo = this.data.pieInfo
    var x = e.touches[0].x
    var y = e.touches[0].y
    if ((Math.pow(x - pieInfo.centerX, 2) + Math.pow(y - pieInfo.centerY, 2)) > Math.pow(pieInfo.pieRadius, 2)) {
      console.log("在圆外，不执行")
      return
    }
    var pointPos = 0
    console.log("在圆内，继续执行")
    var angle = Math.atan((y - pieInfo.centerY) / (x - pieInfo.centerX)) / (Math.PI / 180)
    //判断角度值
    if (x > pieInfo.centerX) {
      if (angle > 0) {
        pointPos = angle / 180 * Math.PI
      } else {
        pointPos = angle / 180 * Math.PI + 2 * Math.PI
      }
    } else {
      if (angle > 0) {
        pointPos = angle / 180 * Math.PI + Math.PI
      } else {
        pointPos = angle / 180 * Math.PI + Math.PI
      }
    }
    var index = 0
    for(var i = 0;i<pieInfo.area.length;i++){
      if(pointPos>pieInfo.area[i].start&&pointPos<pieInfo.area[i].end){
        index = i
      }
    }
    this.setData({
      judge:index
    })
    console.log("在第"+index+"个区域")
    this.drawPie(index)
  },
  // 小组件——日历
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
 
  dateSelectAction: function (e) {
    var cur_day = e.currentTarget.dataset.idx;
    this.setData({
      todayIndex: cur_day
    })
    console.log(`点击的日期:${this.data.cur_year}年${this.data.cur_month}月${cur_day + 1}日`);
  },
 
  setNowDate: function () {
    const date = new Date();
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;
    const todayIndex = date.getDate() - 1;
    console.log(`日期：${todayIndex}`)
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    this.calculateEmptyGrids(cur_year, cur_month);
    this.calculateDays(cur_year, cur_month);
    this.setData({
      cur_year: cur_year,
      cur_month: cur_month,
      weeks_ch,
      todayIndex,
    })
  },
 
  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },
  getFirstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },
  calculateEmptyGrids(year, month) {
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    let empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        hasEmptyGrid: true,
        empytGrids
      });
    } else {
      this.setData({
        hasEmptyGrid: false,
        empytGrids: []
      });
    }
  },
  calculateDays(year, month) {
    let days = [];
 
    const thisMonthDays = this.getThisMonthDays(year, month);
 
    for (let i = 1; i <= thisMonthDays; i++) {
      days.push(i);
    }
 
    this.setData({
      days
    });
  },
  handleCalendar(e) {
    const handle = e.currentTarget.dataset.handle;
    const cur_year = this.data.cur_year;
    const cur_month = this.data.cur_month;
    if (handle === 'prev') {
      let newMonth = cur_month - 1;
      let newYear = cur_year;
      if (newMonth < 1) {
        newYear = cur_year - 1;
        newMonth = 12;
      }
 
      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);
 
      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      })
 
    } else {
      let newMonth = cur_month + 1;
      let newYear = cur_year;
      if (newMonth > 12) {
        newYear = cur_year + 1;
        newMonth = 1;
      }
 
      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);
 
      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      })
    }
  },
})