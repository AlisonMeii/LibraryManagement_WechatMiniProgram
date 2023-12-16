// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const dbName=event.dbName
    const curd=event.curd
    const data=event.data
    const where=event.where
    if(curd!="add" && curd!="update" && curd!="get" && curd!="remove" && curd!="count"){
        return {
            status:-1,
            msg:"curd 操作未指定"
        }
    }
    var w={}
    for(var key in where){
        w[key]=where[key];
        var eq=/^eq\((.+?)\)$/g.exec(where[key]);
        if(eq){ w[key]=db.command.eq(+eq[1]) }
        var neq=/^neq\((.+?)\)$/g.exec(where[key]);
        if(neq){ w[key]=db.command.neq(+neq[1])}
        var lt=/^lt\((.+?)\)$/g.exec(where[key]);
        if(lt){ w[key]=db.command.lt(+lt[1])}
        var lte=/^lte\((.+?)\)$/g.exec(where[key]);
        if(lte){ w[key]=db.command.lte(+lte[1])}  
        var gt=/^gt\((.+?)\)$/g.exec(where[key]);
        if(gt){ w[key]=db.command.gt(+gt[1])}
        var gte=/^gte\((.+?)\)$/g.exec(where[key]);
        if(gte){ w[key]=db.command.gte(+gte[1])}
        var on=/^in\(\[(.+?)\]\)$/g.exec(where[key]);
        if(on){
            let arr=on[1].split(",").map(Number)
            let arrow=new Array();
            for(var k in arr)
              arrow.push(arr[k])
            w[key]=db.command.in(arrow)
        }
        var not=/^nin\(\[(.+?)\]\)$/g.exec(where[key]);
        if(not){
            let arr=not[1].split(",").map(Number)
            let arrow=new Array();
            for(var k in arr)
              arrow.push(arr[k])
            w[key]=db.command.nin(arrow)
        }
    }
    return new Promise((resolve,reject)=>{
        switch(curd){
            case 'add':
                db.collection(dbName).add({
                    data:data
                }).then((res)=>{
                    resolve({
                        data:res.data,
                        status:200,
                        res:res
                    })
                })
                break;
            case 'update':
                db.collection(dbName).where(w).update({
                    data:data
                }).then(res=>{
                    console.log("curd"+res)
                    resolve({
                        data:res.data,
                        status:200,
                        res:res
                    })
                })
                break;
            case 'get':
                db.collection(dbName).where(w).get().then(res=>{
                    resolve({
                        data:res.data,
                        status:200,
                        res:res
                    })
                })
                break;
            case 'remove':
                db.collection(dbName).where(w).remove().then(res=>{
                    resolve({
                        data:res.data,
                        status:200,
                        res:res
                    })
                })
                break;
            case 'count':
                db.collection(dbName).where(w).count().then(res=>{
                    resolve({
                        data:res.data,
                        status:200
                    })
                });
            default:
                break;
        }
    })
}