//jshint esversion:6
//80eK1UhzUTftTTJp
//mongosh "mongodb+srv://cluster0.i7qdtbw.mongodb.net/myFirstDatabase" --apiVersion 1 --username Ken_oshimoto
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
var _ = require('lodash');

mongoose.connect('mongodb+srv://Ken_oshimoto:80eK1UhzUTftTTJp@cluster0.i7qdtbw.mongodb.net/todolistDB');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const breakfast = new Item({
  name: "Hi!"
});

const study = new Item({
  name: "add new items with +"
});



const defaultItems = [breakfast, study];
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

  const day = date.getDate();
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log("added default items");
        }
      });
      res.redirect("/");

    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
      
    }



  });



});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    newItem.save();

    res.redirect("/");
  
  }else{
    List.findOne({name: listName},(err, foundList)=>{
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  
});


app.post("/delete", (req, res) => {
  const checkedItemId = req.body.deleteItem;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        res.redirect("/");
        
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) =>{
      if (!err){
        res.redirect("/" + listName);
      }
    })
  }
  
  


});

app.get("/:newPage", function (req, res) {
  const requestedUrl = _.capitalize(req.params.newPage);

  List.findOne({name: requestedUrl}, (err, result)=>{
    if(!err){
      if(!result){
        const list = new List({
          name: requestedUrl,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + requestedUrl);
      }else{
        res.render("list", { listTitle: result.name, newListItems: result.items });
      }
     
    }
  });

  
  // res.render("list", { listTitle: "Today", newListItems: foundItems });

});

app.get("/about", function (req, res) {
  res.render("about");
});
const port = process.env.PORT || 3001;
app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});
