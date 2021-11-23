//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
// const date = require(__dirname + "/date.js");
const _=require("lodash");
 
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-mukul:Test-123@cluster0.slcyt.mongodb.net/todolistDB');

const itemsSchema=new mongoose.Schema({
  name: String
});
const listSchema=new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const Item= mongoose.model("Item",itemsSchema);
const List= mongoose.model("List",listSchema);

const item1= new Item({name:"Welcome"});
const item2= new Item({name:"Hit + to add new item"});
const item3= new Item({name:"<-- Hit to delete an item"});
const defaultItems=[item1,item2,item3];

// item1.save();

// Item.insertMany(defaultItems,function(err){
//   if(err)
//     console.log(err);
//   else
//     console.log("Successfully saved Default items to DB");
// });


app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length===0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err)
          console.log(err);
        else
          console.log("Successfully saved Default items to DB");
      });
      res.redirect("/");
    }
    else
      res.render("list", {listTitle: "Today", newListItems: foundItems});
  });
});

app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
          console.log("List Not exists earlier");
          const list= new List({
            name:customListName,
            items:defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
        }
      else{
          console.log("List already exists");
          res.render("list",{listTitle:foundList.name, newListItems: foundList.items});
        }
    }
  });
});


app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName= _.capitalize(req.body.listName);
  console.log(listName);
  if(listName==="Today"){
      Item.findByIdAndRemove(checkedItemId,function(err){
      if(err)
        console.log(err);
      else{
        console.log("Deleted successfully");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
          console.log("Deleted successfully");
          res.redirect("/"+listName);
        }
    });
  }
  
});


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName= req.body.list;

  const item= new Item({
    name:itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
