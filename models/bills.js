/**
 * Created by 1122 on 2015/12/20.
 */
var mongodb=require("./db");
function Bills(user,data,shop){
    this.user=user;
    this.bill=data;
    this.shop=shop;
}
module.exports=Bills;

Bills.prototype.save=function save(callback){
  var bills={
      user:this.user,
      checkbills:this.bill,
      shop:this.shop
  }
  mongodb.open(function(err,db){
    if(err){
        return callback(err);
    }
    db.collection("bills",function(err,collection){
        if(err){
            mongodb.close();
            return callback(err);
        }
        collection.insert(bills,{safe:true},function(err,bills){
            mongodb.close();
            callback(err,bills);
        });
    });
  });
};
//根据用户名获取订单
Bills.get=function get(username,callback){
    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('bills', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (username) {
                query["user.name"]=username
            }
            collection.find(query).sort({time: -1}).toArray(function(err, docs) {
                mongodb.close();
                if (err) {
                    callback(err, null);
                }

                var bills = [];
                docs.forEach(function(doc, index) {
                    var bill = new Bills(doc.user, doc.checkbills,doc.shop);
                    bills.push(bill);
                });
                callback(null, bills);
            });
        });
    });
};


Bills.getByShopName=function(shopname,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection("bills",function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            var query={};
            if(shopname){
                query["shop.shopname"]=shopname;
            }

            collection.find(query).sort({time:-1}).toArray(function(err,docs){
                if(err){
                    callback(err,null);
                }
                var bills = [];
                docs.forEach(function(doc, index) {
                    var bill = new Bills(doc.user, doc.checkbills,doc.shop);
                    bills.push(bill);
                });

                callback(null, bills);
            });
        });
    });
};