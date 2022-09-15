const express = require("express");
const {List, Item, defaultItems} = require("../models/list");
const { ROLE, checkIsInRole } = require("../models/user");
const router = express.Router();
const _ = require("lodash");

router.use((req, res, next)=>{
    if ( req.query._method == 'DELETE') {
        req.method = 'DELETE';
        req.url = req.path;
    }
    next();
});


router.post("/new" ,checkIsInRole(ROLE.BASIC, ROLE.ADMIN), (req, res)=>{
    const customListName = req.body.title;
    res.redirect("/to-do-list/" + customListName);
});

router.get("/",checkIsInRole(ROLE.BASIC, ROLE.ADMIN), (req, res)=>{
    List.find({userId: req.user.id}, (err, list)=>{
        if(err) console.log(err);
        else res.render("lists/todolist", {list: list})
    })
    
})

router.get("/:customListName",checkIsInRole(ROLE.BASIC, ROLE.ADMIN), function(req, res){
    const customListName = _.capitalize(req.params.customListName);
  
    List.findOne({name: customListName, userId: req.user.id}, async (err, foundItem)=>{
        if (!err){
            if (!foundItem){
                //Create new list
                const list = new List({
                name: customListName,
                userId: req.user.id,
                items: defaultItems
                });
                await list.save();
                res.redirect("/to-do-list/" + customListName);
            }
            else {
                //Show existing list
                res.render("lists/list", {listTitle: foundItem.name, newListItems: foundItem.items})
            }
        }
    })
  
});

router.post("/",checkIsInRole(ROLE.BASIC, ROLE.ADMIN), function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;
  
    const item = new Item({
      name: itemName
    });

    List.findOne({name: listName}, (err, foundList)=>{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/to-do-list/" + listName);
    });
});

router.post("/delete",checkIsInRole(ROLE.BASIC, ROLE.ADMIN), (req, res)=>{
    const checkedItemId = req.body.deleteItem;
    const listName = req.body.listName;

    List.findOneAndUpdate(
    {name: listName}, 
    {$pull: {items: {_id: checkedItemId}}}, 
    (err, foundList)=>{
        if(!err) res.redirect("/to-do-list/" + listName);
    });
});

router.delete("/:id",checkIsInRole(ROLE.BASIC, ROLE.ADMIN), async (req, res)=>{
    await List.findByIdAndDelete(req.params.id);
    res.redirect("/to-do-list/");
});

module.exports = router;