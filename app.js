//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];


mongoose.connect("mongodb+srv://navbhtt0:yl3nZ70LspKo37kz@cluster0.0vpzage.mongodb.net/ToDolistDB", {useNewUrlParser: true, useUnifiedTopology: true,});
//yl3nZ70LspKo37kz
const itemsSchema = new mongoose.Schema ({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "welcum to your todo list"
})
const item2 = new Item({
  name: "hit and run by salman"
})
const item3 = new Item({
  name: "fuck and run by johnny"
})

const defaultItems = [item1, item2, item3]


 const listSchema = {
    name: String,
    items:[itemsSchema]
  }

  const List = mongoose.model("List", listSchema)


app.get("/", function(req, res) {
  

Item.find({})
  .then(foundItems => {

    if(foundItems.length === 0){
    Item.insertMany(defaultItems)
    .then(() => {
      console.log("fucking fully saved");
    })
    .catch((err) => {
      console.error(err);
    });
    res.redirect("/")
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }


  })

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  
 List.findOne({ name: customListName })
  .then((foundList) => {
    if (!foundList) {
     
      const list = new List({
      name: customListName,
      items: defaultItems
      });

      list.save();
      res.redirect("/" + customListName)
    } else {
     res.render("list", {listTitle: foundList.name , newListItems: foundList.items})
    }
  })
  .catch((err) => {
    console.log("Error occurred while querying the database:", err);
  });

 
});



});

app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    try {
      const foundList = await List.findOne({ name: listName });
      foundList.items.push(item);
      await foundList.save();
      res.redirect("/" + listName);
    } catch (err) {
      console.error("Error finding or saving list:", err);
      // Handle the error accordingly
    }
  }
});


app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  try {
    if (listName === "Today") {
      const deletedItem = await Item.findOneAndDelete({ _id: checkedItemId });
      if (deletedItem) {
        console.log("Item successfully deleted.");
      } else {
        console.log("Item not found.");
      }
      res.redirect("/"); // Redirect to the homepage or wherever you want after successful deletion
    } else {
      const foundList = await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      );
      if (foundList) {
        console.log("Item successfully deleted from the custom list.");
        res.redirect("/" + listName); // Redirect to the custom list page after successful deletion
      } else {
        console.log("Custom list not found.");
        res.status(404).send("Custom list not found.");
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to delete item.");
  }
});




// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});


