import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import fs from "fs";
import mongoose from "mongoose";
import { timeStamp } from "console";
import { title } from "process";

const app = express();
const port = process.env.PORT || 7000;

// Connect to mongoDB
mongoose.connect("mongodb://localhost:27017/").then(()=>{
  console.log("MongoDB service running")
}).catch((err)=>{
  console.log(err);
});

// Schema
const bPostsSchema = new mongoose.Schema({
  title: String,
  description: String,
  timestamp: String
})

// Schema model
const bPostModel = mongoose.model("blogposts", bPostsSchema);


// Configure Express middleware
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));

// Define paths to view files
const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = join(__dirname, "index.ejs");
const homePath = join(__dirname, "views/home.ejs");
const blogDetailsPath = join(__dirname, "views/blogDetails.ejs");
const course = join(__dirname, "views/course.ejs");

// Initialize blog list
let blogList = [];

// Render index page
app.get("/", (req, res) => {
  res.render(indexPath);
});

// Render home page with blog list
app.get("/home", (req, res) => {
  const checklist = JSON.parse(fs.readFileSync(join(__dirname, 'data', 'checklist.json')));

 
  // Read the entire collection
  bPostModel.find({})
  .then(posts => {
    // console.log('blogposts:', posts);
    // const dbData = JSON.parse(posts)
    res.render(homePath, {
      // blogList: blogList,
      checklist,
      posts
    });
  })
  .catch(error => {
    console.log('Error fetching MongoDB collection:', error);
  });
  
});

// app.get("/course",(req,res) =>{
//   res.render(course);
// })

app.get('/course', (req, res) => {
    // Example data to pass to the view, if needed
    // const exampleData = {
    //     title: "Course Information",
    //     description: "This is where course details will be displayed."
    // };
    const checklist = JSON.parse(fs.readFileSync(join(__dirname, 'data', 'checklist.json')));
    // Render the index.ejs template with the route
    // res.render('index', { route: req.originalUrl, exampleData });
    res.render(course, {checklist});
});

// Add new blog
app.post("/home", (req, res) => {
  const blogTitle = req.body.blogTitle;
  const blogDescription = req.body.blogDes;
  blogList.push({
    id: generateID(),
    title: blogTitle,
    description: blogDescription,
    timestamp: new Date().toLocaleDateString() +" "+ new Date().toLocaleTimeString(),
  });
  res.render(homePath, {
    blogList: blogList,
  });
  // Storing data

  // bPostModel.create(post).then((data)=>{
  //   console.log(data);
  // }).catch((err)=>{
  //   console.log(err)
  // })
  // Use the model to create a new user
const newPost = new bPostModel({
    title: blogTitle,
    description: blogDescription,
    timestamp: new Date().toLocaleDateString() +" "+ new Date().toLocaleTimeString()
})
  //{ title: 'John Doe',
  // description: 'john.doe@example.com',
  // timestamp: new Date().toLocaleDateString() +" "+ new Date().toLocaleTimeString()}


// Save the user to the database
newPost.save()
  .then(() => console.log('User saved!'))
  .catch((error) => console.log('Error saving user:', error));

});

// Delete a blog
app.post("/delete/:id", (req, res) => {
  const blogId = req.params.id;
  blogList = blogList.filter((blog) => blog.id !== parseInt(blogId));
  res.send(
    '<script>alert("Blog deleted successfully"); window.location="/home";</script>'
  );
  res.redirect("/home");
});

// Render blog details page
app.get("/blogDetails/:id", (req, res) => {
  const blogId = req.params.id;
  const blogDetails = blogList.find((blog) => blog.id === parseInt(blogId));
  res.render(blogDetailsPath, {
    blogDetails: blogDetails,
  });
});

// Render edit blog page
app.get("/edit/:id", (req, res) => {
  const blogId = req.params.id;
  const blogDetails = blogList.find((blog) => blog.id === parseInt(blogId));
  res.render(indexPath, {
    isEdit: true,
    blogDetails: blogDetails,
  });
});

// Update blog
app.post("/edit/:id", (req, res) => {
  const blogId = req.params.id;
  const editBlog = blogList.findIndex((blog) => blog.id === parseInt(blogId));
  if (editBlog === -1) {
    res.send("<h1> Something went wrong </h1>");
  }
  const updatedTitle = req.body.blogTitle;
  const updatedDescription = req.body.blogDes;

  const blogTitle = (blogList[editBlog].title = updatedTitle);
  const blogDescription = (blogList[editBlog].description = updatedDescription);
  [...blogList, { blogTitle: blogTitle, blogDescription: blogDescription }];

  res.render(homePath, {
    isEdit: true,
    blogList: blogList,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Function to generate random ID
function generateID() {
  return Math.floor(Math.random() * 10000);
}
