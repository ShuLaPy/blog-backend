import express from "express";
import bodyParser from "body-parser";
import compression from "compression";
import { getMetadata } from "page-metadata-parser";
import domino from "domino";
import fetch from "node-fetch";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import connectDB from "./db.js";
import Post from "./database/post.js";
import cors from "cors";

const app = express();

app.use(cors());

app.use("/images", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
  },
});

const upload = multer({ storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(compression());

app.get("/url-metadata", async ({ query }, res) => {
  try {
    const url = query.url;
    const response = await fetch(url);
    const html = await response.text();
    const doc = domino.createWindow(html).document;
    const metadata = getMetadata(doc, url);

    console.log(metadata);
    res.status(200).json({
      success: 1,
      meta: {
        title: metadata.title,
        description: metadata.description,
        image: {
          url: metadata.image,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: 0,
      meta: {},
    });
  }
});

app.post("/uploadFile", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    console.log(file);
    res.status(200).json({
      success: 1,
      file: {
        url: "http://localhost:3500/images/" + file.filename,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: 0,
      file: {},
    });
  }
});

app.post("/create-post", async (req, res) => {
  try {
    const body = req.body;
    const name = body.blocks.find((block) => block.type === "header");
    const data = {
      name: name.data.text,
      data: body,
    };
    const post = await Post.create(data);
    res.status(200).json({
      success: 1,
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: 0,
      data: {},
    });
  }
});

app.post("/update-post/:id", async (req, res) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const name = body.blocks.find((block) => block.type === "header");
    const data = {
      name: name.data.text,
      data: body,
    };
    const post = await Post.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );
    res.status(200).json({
      success: 1,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: 0,
      data: {},
    });
  }
});

app.get("/get-posts", async (req, res) => {
  try {
    const posts = await Post.find().select("_id name createdAt");
    res.status(200).json({
      success: 1,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: 0,
      posts: {},
    });
  }
});

app.get("/post/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.status(200).json({
      success: 1,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: 0,
      post: {},
    });
  }
});

connectDB(() => {
  app.listen(3500, () => {
    console.log(`🚀 server running successfully on 3500`);
  });
});
