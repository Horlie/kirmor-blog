const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: String
})

const Item = new mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete the item."
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    userId: String,
    items: [itemSchema]
})

module.exports = {
    List: new mongoose.model("List", listSchema),
    Item: Item,
    defaultItems: defaultItems
}