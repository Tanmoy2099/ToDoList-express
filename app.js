
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const app = express();
const _ = require("lodash")
let PORT = process.env.PORT
const year = new Date()
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Tanmoy2099:Mytodolist@cluster0.tia6h.mongodb.net/todolistDB", { useNewUrlParser: true })

const itemSchema = {
  name: String
}

const listSchema = {
  name: String,
  items: [itemSchema]
}
const Item = mongoose.model("Item", itemSchema)
const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {
  Item.find({}, (err, result) => {
    if (!err) {
      res.render("list", {
        listTitle: "MyTodo",
        newListItems: result,
        year: year.getFullYear()
      });
    } else {
      res.redirect("/")
    }
  })
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemName });
  if (listName === "MyTodo") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "MyTodo") {
    Item.findByIdAndRemove(itemId, err => {
      if (!err) {
        res.redirect("/");
      }
    })
  }
  else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemId } } },
      (err, foundList) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
  }
})

app.get("/about", (req, res) => {

  res.render("about", { year: year.getFullYear() })

});


app.get("/:customLink", (req, res) => {
  const customLink = _.capitalize(req.params.customLink)
  // console.log(extra);
  List.findOne({ name: customLink }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customLink,
          items: [{ name: "work" }, { name: "walk" }]
        });
        list.save();
        res.redirect("/" + customLink);
      }
      else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items, year: year.getFullYear() });
      }
    }
  });
});


if (PORT == null || PORT == "") {
  PORT = 3000;
}

app.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
