var express = require('express');
var router = express.Router();
var crypto=require('crypto');
var User=require('../models/user.js');
var Post=require('../models/post.js');
var Bills=require('../models/bills.js');
var Shops=require('../models/shops.js');
var Menu=require('../models/menu.js');


/* GET home page. */
router.get('/', function(req, res) {
  Post.get(null, function(err, posts) {
  if (err) {
    posts = [];
  }
  res.render('index', {
    title: '首页',
    posts: posts,
    user : req.session.user,
    success : req.flash('success').toString(),
    error : req.flash('error').toString()
  });
  });
});


//个人
router.get("/customer",checkLogin);
router.get("/customer", function(req,res){
  Bills.get(req.session.user.name,function(err,bills){
    if(err){
      bills=[];
    }
    res.render("customer",{
      title: "个人信息",
      user:req.session.user,
      bills:bills
  });
  });
});



//商铺
router.get("/shops",checkLogin);
router.get("/shops",function(req,res){

  Shops.getByShopManager(req.session.user,function(err,shop){
    if(!shop){
      res.render("shops",{
        title:"商铺信息"
      });
    }else{
      Menu.getByManager(req.session.user,function(err,menu){
        Bills.getByShopName(shop.shopname,function(err,bills){
          if(err){
            bills=[];
            return res.redirect("/");
          }
          res.render("shops",{
            title:"商铺信息",
            bills:bills,
            menu:menu
          });
        });

      });
    }



  });

});

//增加商铺
router.post("/shops",checkLogin);
router.post("/shops",function(req,res){
  var newshop=new Shops(req.session.user,req.body.shopname,req.body.shoptel,req.body.shopaddress);
  newshop.save(function(err){
    if(err){
      req.flash('error',"保存店铺出错");
    }
    req.flash('success',"提交成功");
    res.redirect("/shops");
  });

});

//修改菜单
router.post("/shops/commitmenu",checkLogin);
router.post("/shops/commitmenu",function(req,res){
  Shops.getByShopManager(req.session.user,function(err,shop){
    var newmenu=new Menu(req.session.user,req.body,shop);
    newmenu.save(function(err){
      if(err){
        res.send({status:'error'});
      }else {
        res.send({status: 'success'});
      }
    });
  });
});




//所有商铺界面
router.get("/products",function(req,res){
Shops.getAll(function(err,shops){
  if(err){
    shops=[];
    res.redirect("/");
  }
  res.render("products",{
    title:"在线订餐",
    shops:shops
  });
});
});

//订餐
router.get("/order/:shop",function(req,res){

  Shops.getByShopName(req.params.shop,function(err,shop){
    if(!shop){
      res.redirect("/");
    }
      //TODO：显示不同菜品
      Menu.getByManager(shop.shopmanager,function(err,menu){
        if(!menu){
          menu=[];
        }
          res.render("order",{
            title:req.params.shop,
            shopname:req.params.shop,
            menu:menu
          });

      });


    });

});

//bills
//怎样实现跳转？？？？？？
router.post("/order/:shop",checkLogin);
router.post("/order/:shop",function(req,res){
  var currentUser=req.session.user;
  var shopname=req.params.shop;
  Shops.getByShopName(shopname,function(err,shop){

    //req.body作为接收checkbill
    var bills=new Bills(currentUser,req.body,shop);
    bills.save(function(err){
      if(err){
        res.send({status:'error'});
      }else{
        res.send({status:'success'});
      }
    });

  });

});







//联系我们
router.get("/contact",function(req,res){
  res.render("contact",{
    title:"联系我们"
  });
});
//关于
router.get("/about",function(req,res){
  res.render("about",{
    title:"关于"
  });
});



router.post('/post',checkLogin);
router.post('/post',function(req,res,next){
  var currentUser=req.session.user;
  var post=new Post(currentUser.name,req.body.post);
  post.save(function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    req.flash('success','发表成功');
    res.redirect('/u/'+currentUser.name);
  });
});


//注册
router.get('/register',checkNotLogin);
router.get('/register',function(req,res,next){
  res.render('register',{title:'用户注册'});
});

router.post('/register',checkNotLogin);
router.post('/register',function(req,res,next){
  if (req.body['password-repeat']!=req.body['password']) {
    req.flash('error','两次输入口令不一致');
    return res.redirect('/register');
  }
  var md5=crypto.createHash('md5');
  var password=md5.update(req.body.password).digest('base64');
  var newUser=new User({
    name:req.body.username,
    password:password,
    tel:req.body.tel,
    address:req.body.address
  });

  User.get(newUser.name,function(err,user){
    if(user)
      err='用户名已经存在';
    if(err){
      req.flash('error',err);
      return res.redirect('/register');
    }

    newUser.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/register');
      }
      req.session.user=newUser;
      req.flash('success','注测成功');
      res.redirect('/');
    });

  });

});

//登录
router.get('/login',checkNotLogin);
router.get('/login',function(req,res,next){
  res.render('login',{
    title:'用户登录'
  });

});

router.post('/login',checkNotLogin);
router.post('/login',function(req,res,next){
    var md5=crypto.createHash('md5');
    var password=md5.update(req.body.password).digest('base64');
    User.get(req.body.username,function(err,user){
      if(!user){
        req.flash('error','用户不存在');
        return res.redirect('/login');
      }
      if(user.password!=password){
        req.flash('error','用户口令错误');
        return res.redirect('/login');
      }
      req.session.user=user;
      req.flash('success','登录成功');
      res.redirect('/customer');

    });
});

//登出
router.get('/logout',checkLogin);
router.get('/logout',function(req,res,next){
  req.session.user=null;
  req.flash('success','登出成功');
  res.redirect('/');
});


router.get("/u/:user",function(req,res) {
  User.get(req.params.user, function(err, user) {
    if (!user) {
      req.flash('error', '用户不存在');
      return res.redirect('/');
    }
    Post.get(user.name, function(err, posts) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        posts: posts
      });
    });
  });
});



function checkLogin(req,res,next){
  if(!req.session.user){
    req.flash('error','未登入');
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req,res,next){
  if(req.session.user){
    req.flash('error','已登入');
    return res.redirect('/');
  }
  next();
}


module.exports = router;