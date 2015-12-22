/**
 * Created by 1122 on 2015/12/22.
 */
var mongodb=require('./db');
function Menu(manager,menu,shop){
    this.manager=manager;
    this.menu=menu;
    this.shop=shop;
}
module.exports=Menu;

Menu.prototype.save=function save(callback){
    var menu={
        manager:this.manager,
        menu:this.menu,
        shop:this.shop
    };
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection("menus",function(err,collections){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查找数据库中是否存在，判断是第一次添加还是修改操作
            collections.findOne({manager:menu.manager},function(err,doc){
                if(doc){
                    //删除旧菜单
                    collections.deleteOne({manager:menu.manager});

                }
                    collections.insert(menu,{safe:true},function(err,menu){
                        mongodb.close();
                        callback(err,menu);
                    });

            });

        });
    });
};


Menu.getByManager=function getByManager(manager,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection("menus",function(err,collections){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query={};
            if(manager!=null){
                query.manager=manager;
            }
            collections.findOne(query,function(err,doc){
                mongodb.close();
                if(doc){
                    var menu=new Menu(doc.manager,doc.menu,doc.shop);
                    callback(err,menu);
                }else{
                    callback(err,null);
                }
            });

        });
    });
}
