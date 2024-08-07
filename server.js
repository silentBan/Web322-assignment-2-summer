import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  addItem,
  getAllItems,
  getPublishedItems,
  getCategories,
  initialize,
  getItemsByCategory,
  getItemsByMinDate,
  getItemById,
} from "./store-service.js";
import multer from "multer";
import cloudinary from "cloudinary";
import streamifier from "streamifier";
import { engine } from "express-handlebars";

const app = express();
const port = process.env.PORT || 8080;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.engine('.hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    navLink: function(url, options){
      return '<li' + 
          ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
          '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
    }
  }
}));
app.set('view engine', '.hbs');

app.set('views', path.join(__dirname, 'views'));

cloudinary.config({
  cloud_name: "dbkz5fb2f",
  api_key: "489492869651797",
  api_secret: "BNSgnmPXnPSCkaA9GHGpaxbhnO8",
  secure: true,
});

const upload = multer();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.render('about');
});

app.get("/shop", (req, res) => {
  getPublishedItems()
    .then((items) => {
      res.render('shop', { items: items });
    })
    .catch((err) => {
      res.render('error', { message: err });
    });
});

app.get("/items", (req, res) => {
  const { category, minDate } = req.query;

  if (category) {
    const categoryNum = parseInt(category);
    if (isNaN(categoryNum) || categoryNum < 1 || categoryNum > 5) {
      res.status(400).render('error', { message: "Invalid category value" });
    } else {
      getItemsByCategory(categoryNum)
        .then((items) => {
          res.render('items', { items: items });
        })
        .catch((err) => {
          res.render('error', { message: err });
        });
    }
  } else if (minDate) {
    getItemsByMinDate(minDate)
      .then((items) => {
        res.render('items', { items: items });
      })
      .catch((err) => {
        res.render('error', { message: err });
      });
  } else {
    getAllItems()
      .then((items) => {
        res.render('items', { items: items });
      })
      .catch((err) => {
        res.render('error', { message: err });
      });
  }
});

app.get("/item/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).render('error', { message: "Invalid item ID" });
  } else {
    getItemById(id)
      .then((item) => {
        res.render('item', { item: item });
      })
      .catch((err) => {
        res.render('error', { message: err });
      });
  }
});

app.get("/categories", (req, res) => {
  getCategories()
    .then((categories) => {
      res.render('categories', { categories: categories });
    })
    .catch((err) => {
      res.render('error', { message: err });
    });
});

app.get("/items/add", (req, res) => {
  res.render('addPost');
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req)
      .then((uploaded) => {
        processItem(uploaded.url);
      })
      .catch((err) => {
        console.error("Error uploading file to Cloudinary:", err);
        processItem("");
      });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;

    const { title, description, price, category, published } = req.body;
    const newItem = {
      title,
      description,
      price,
      category,
      published,
      featureImage: imageUrl,
    };

    addItem(newItem)
      .then((addedItem) => {
        res.redirect("/items");
      })
      .catch((error) => {
        console.error(error);
        res.status(500).render('error', { message: "Internal Server Error" });
      });
  }
});

app.use((req, res) => {
  res.status(404).render('404');
});

initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Express http server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });