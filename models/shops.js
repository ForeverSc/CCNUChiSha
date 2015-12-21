/**
 * Created by 1122 on 2015/12/20.
 */
var mongodb=require("./db");
function Shops(shopmanager,shopname,shoptel,shopaddress){
    this.shopmanager=shopmanager;
    this.shopname=shopname;
    this.shoptel=shoptel;
    this.shopaddress=shopaddress;
}
module.exports=Shops;

Shops.prototype.save=function save(callback){
    var shop={
        shopmanager:this.shopmanager,
        shopname:this.shopname,
        shoptel:this.shoptel,
        shopaddress:this.shopaddress
    };
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection("shops",function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(shop,{safe:true},function(err,shop){
                mongodb.close();
                callback(err,shop);
            });

        });

    });

};

Shops.getByShopManager=function get(shopmanager ,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('shops',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({shopmanager:shopmanager},function(err,doc){
                mongodb.close();
                if(doc){
                    var shop=new Shops(doc.shopmanager,doc.shopname,doc.shoptel,doc.shopaddress);
                    callback(err,shop);

                }else{
                    callback(err,null);
                }

            });
        });
    });

};




Shops.getByShopName=function get(shopname ,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('shops',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({shopname:shopname},function(err,doc){
                mongodb.close();
                if(doc){
                    var shop=new Shops(doc.shopmanager,doc.shopname,doc.shoptel,doc.shopaddress);
                    callback(err,shop);

                }else{
                    callback(err,null);
                }

            });
        });
    });

};


Shops.getAll=function getAll(callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }

        db.collection("shops",function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({}).toArray(function(err,docs){
                if(err){
                    callback(err);
                }
                var shops=[];
                docs.forEach(function(doc,index){
                    var shop=new Shops(doc.shopmanager,doc.shopname,doc.shoptel,doc.shopaddress);
                    shops.push(shop);
                });
                callback(null,shops);
            });
        });
    });

};