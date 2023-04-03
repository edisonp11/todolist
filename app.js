//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://edisondipeng:Mu4kIVbOYc2xNGGJ@edisoncluster.yilezwf.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema = {
  name: String };

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item ({
  name : "Welcome to your todolist!"
});

const item2 = new Item ({
name : "Hit the + button to aff a new item."  
});

const item3 = new Item ({
name : "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const ListSchema = {
  name: String,
  items: [itemsSchema]
};

const List =mongoose.model("List", ListSchema);
 

app.get("/", function(req, res) {

  Item.find().then(function(foundItems){if (foundItems.length === 0) { 
    Item.insertMany(defaultItems).then(console.log("Success"))
    .catch(function (err) {
      console.log(err);
    });
    res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems})}})    
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});

  if (listName === "Today"){
  item.save();
  res.redirect("/");}
  else{
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
// });

app.post("/delete", function(req,res){
const deleteItemId = req.body.deleteItem;
const listName = req.body.listName;

console.log(deleteItemId);

if(listName === "Today") {Item.findByIdAndRemove(deleteItemId ).then(function(){
  console.log("Data deleted"); // Success
}).catch(function(error){
  console.log(error); // Failure
});
res.redirect("/");
}else{ List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteItemId}}}).then(function(){
  res.redirect("/"+listName)
})

} 
});


app.get('/:topic', function(req, res) {

const topic = _.capitalize(req.params.topic);  

List.findOne({name: topic }).then(function(foundList){
if (!foundList){
 //create a new list
 const list = new List({
  name: topic,
  items: defaultItems
});
list.save();
res.redirect("/" + topic);
} else {
  res.render("list", {listTitle: foundList.name, newListItems: foundList.items})}

}).catch(function(error){
  console.log(error); });
});
 



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
