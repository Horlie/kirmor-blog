const express = require("express");
const Article = require("../models/article");
const { ROLE, checkIsInRole } = require("../models/user")
const router = express.Router();

router.use((req, res, next)=>{
    if ( req.query._method == 'DELETE') {
        req.method = 'DELETE';
        req.url = req.path;
    }
    if ( req.query._method == 'PUT') {
        req.method = 'PUT';
        req.url = req.path;
    }
    next();
});



router.get("/new", checkIsInRole(ROLE.ADMIN), (req, res)=>{
    res.render("articles/new", {article: new Article() });
});


router.get("/edit/:id", checkIsInRole(ROLE.ADMIN), async (req, res)=>{
    const article = await Article.findById(req.params.id);
    res.render("articles/edit", {article: article });
})

router.get("/:slug",checkIsInRole(ROLE.BASIC, ROLE.ADMIN), async (req, res)=>{
    const article = await Article.findOne({slug: req.params.slug})
    if (article == null) res.redirect("/");
    res.render('articles/show', {article: article, role: req.user.role});
})

router.post("/", async (req, res, next)=>{
    req.article = new Article();
    next();
}, SaveArticleAndRedirect("new"))


router.put("/:id", checkIsInRole(ROLE.ADMIN), async (req, res, next)=>{
    req.article = await Article.findById(req.params.id);
    next();
}, SaveArticleAndRedirect("edit"))


router.delete("/:id",checkIsInRole(ROLE.ADMIN), async (req, res)=>{
    await Article.findByIdAndDelete(req.params.id);
    res.redirect("/");
});

function SaveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article;
        article.title = req.body.title;
        article.description = req.body.description;
        article.markdown = req.body.markdown;
        try {
            article = await article.save();
            res.redirect(`/articles/${article.slug}`)
        } catch(e) {
            console.log(e);
            res.render(`/articles/${path}`, {article: article})
        }
        
    }
}

module.exports = router;