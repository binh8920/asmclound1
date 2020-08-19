const express = require('express');
const engines = require('consolidate');
const app = express();
//require express-session
const session = require('express-session');
app.use(session({
    resave: true, 
    saveUninitialized: true, 
    secret: 'mykey282892373122', 
    cookie: { maxAge: 600000 }}));

 //require body-parser
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

//require path
var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

//using handlebars
app.engine('hbs',engines.handlebars);
app.set('views','./views');
app.set('view engine','hbs');

//connect to mongoDB
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://testMongo:123qweasd@cluster0.yqx2y.mongodb.net/test?authSource=admin&replicaSet=atlas-11v77l-shard-0&readPreference=primary&ssl=true"

//localhost:5000/products
app.get('/products',async function(req,res){
    let client= await MongoClient.connect(url);
    let dbo = client.db("asm2");
    let results = await dbo.collection("products").find({}).toArray();
    //doc session
    res.render('products',{model:results,ss:req.session.User});
})

//search products
app.post('/doSearch',async (req,res)=>{
    let inputName = req.body.txtName;
    let client= await MongoClient.connect(url);
    let dbo = client.db("asm2");
    let results = await dbo.collection("products").
    find({name: new RegExp(inputName,'i')}).toArray();
    
    res.render('products',{model:results});
})

//delete product 
app.get('/delete',async (req,res)=>{
    let inputId = req.query.id;
    let client= await MongoClient.connect(url);
    let dbo = client.db("asm2");
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(inputId)};
    await dbo.collection("products").deleteOne(condition);
    res.redirect('/products');
})

//add product
app.get('/addProduct',(req,res)=>{
    res.render('addProduct');
})
app.post('/doInsert',async (req,res)=>{
    let inputName = req.body.txtName;
    let inputPrice = req.body.txtPrice;
    let inputQuantity = req.body.txtQuantity;
    let inputDate = req.body.txtDate;
    let newProduct = { 
                      name: inputName, 
                      price: inputPrice, 
                      quantity: inputQuantity,
                      date: inputDate};
    let client= await MongoClient.connect(url);
    let dbo = client.db("asm2");
    await dbo.collection("products").insertOne(newProduct);
    res.redirect('/products');
})

//update product
app.get('/updateProduct',async function(req,res){
    let inputId = req.query.id;
    let client= await MongoClient.connect(url);
    let dbo = client.db("asm2");
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(inputId)};
    let results = await dbo.collection("products").find(condition).toArray();
    res.render('updateProduct',{products:results});
})

app.post('/doupdate',async (req,res)=>{
    let inputId = req.body.id;
    console.log(inputId);
    let inputName = req.body.txtName;
    let inputPrice = req.body.txtPrice;
    let inputQuantity = req.body.txtQuantity;
    // let inputDate = req.body.txtDate;
    let Change = {$set:{ name : inputName , price : inputPrice , quantity : inputQuantity}};
    // if(inputName.trim().length == 0){
    //     let modelError ={
    //             nameError:"You have not entered a Name!",
    //             priceError:"You have not entered a Price!",
    //             quantityError:"You have not entered a Quantity",
    //             dateError:"You have not entered a Date",
    //         };
    //     res.render('updateProduct',{products:modelError});
    //     return false;
    // }else{
    //     if(isNaN(inputPrice,inputQuantity)){
    //         let modelError1 =  {priceError:"You have to enter a number",
    //                             quantityError:"You have to enter a number"
    //     };
    //         res.render('updateProduct',{products:modelError1});
    //     }
        let client= await MongoClient.connect(url);
        var ObjectID = require('mongodb').ObjectID;
        let condition = {"_id" : ObjectID(inputId)};
        console.log(condition);
        let dbo = client.db("asm2"); 
        dbo.collection("products").updateOne(condition,Change).then(result => {
            res.redirect('/products');
        }).catch(err => console.log(err));
       
    
})  
const PORT = process.env.PORT || 5001;
var server=app.listen(PORT,function() {});
