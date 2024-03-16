
const express = require("express"); 
const bodyParser = require("body-parser"); 
const session = require('express-session');
const mySql = require("mysql"); 


const app = express(); 
app.use(bodyParser.urlencoded( {extended:false}) );
 
app.use(bodyParser.json()); 

let port = 4000 ;  
// let nom ;  

app.use(session({
    secret: "123456",  
    resave: false,
    saveUninitialized: true
}));

const pool = mySql.createPool({
    connectionLimit :10 , 
    host : 'localhost' , 
    user : 'root' , 
    password : null  ,
    database  : 'test' , 


})


 

app.post("/register", function(req ,res){
    let name = req.body.name; 
    let id = req.body.mat ; 

    pool.query( `INSERT INTO user (name, mat) VALUES ('${name}', ${id});`, (error, results, fields) => {
        if (error) {
            console.error('Error executing query: ' + error.stack);
            res.send("there is an error try again and change your id");
            res.end();  
            return;
        }
        console.log('Query results:', results);
         
        res.redirect("seucc.ejs"); 
        
    });
    
})

app.post("/login" , function(req ,res){
    let name = req.body.name ;
    let id = req.body.mat ; 
    pool.query('SELECT name, mat FROM user WHERE name = ? AND mat = ?', [name, id], function(err, result, fields) {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (result.length > 0 && result[0].name == name && result[0].mat == id) {
           
            req.session.name = result[0].name;
           


            res.render("user.ejs" ,{
                inf : result 
            })          
        } else {
            res.render("failed.ejs" ,{}); 
        }
    });
   

})

app.post("/submit" , function(req, res) {
    let mesg = req.body.message ;

    let senderName = req.session.name; 

    pool.query(`INSERT INTO messages (msg ,name) VALUES('${mesg}','${senderName}');`,function(err, result, fields) {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
            return;
        }else{
            res.redirect("/messages")
        }
        
        
    });
})

app.get("/messages" , function(req ,res)   {
    pool.query("SELECT * FROM messages" , function(err , result , fields){
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
            return;
        }else{
           

            console.log(result)
            res.render("messages.ejs" , {

                MSG : result , 
            })
        }
    })
})

app.get("/" , function(req , res){
    
    res.render("index.ejs" ,{}); 
    
            

})  
app.get("/register" , function(req , res){
    
    res.render("index.ejs" ,{}); 
    
            

})  

app.get("/seucc.ejs" , function(req ,res){
    res.render("seucc.ejs" , {}); 
}) 

app.get("/login" , function(req ,res){
    res.render("login.ejs" , {}); 
})

app.listen( port , "0.0.0.0", function(){
    console.log(`server on port : ${port}`)
})