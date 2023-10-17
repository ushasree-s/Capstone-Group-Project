const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

app.use(express.static("public"));
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./key.json");


initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://your-firebase-project-id.firebaseio.com", 
});


const db = getFirestore();

app.use(express.urlencoded({ extended: true }));

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/public/" + "signup.html");
});

app.post("/signupSubmit", async function (req, res) { 
  const { Fullname, Email, Password } = req.body; 

 
  const saltRounds = 10; 
  try {
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    db.collection("signup")
      .add({
        Fullname: Fullname,
        Email: Email,
        Password: hashedPassword, 
      })
      .then(() => {
        res.sendFile(__dirname + "/public/" + "login.html");
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
        res.status(500).send("Signup failed");
      });
    } catch (error) {
      console.error("Error hashing the password: ", error);
      res.status(500).send("Signup failed");
    }
  });

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/public/" + "login.html");
});

app.get("/loginSubmit", function (req, res) {
  const { Email, Password } = req.query;

  db.collection("signup")
    .where("Email", "==", Email)
    .get()
    .then((snapshot) => {
      if (!snapshot.empty) {
        const user = snapshot.docs[0].data();
        const hashedPassword = user.Password;

        bcrypt.compare(Password, hashedPassword, (err, result) => {
          if (result) {
            res.redirect("/game.html"); // Redirect to the game page on successful login
          } else {
            res.redirect("/login?loginFailed=true");
          }
        });
      } else {
        res.redirect("/login?loginFailed=true");
      }
    });
});

app.get("/dashboard", function (req, res) {
  res.send("Hi");
});

const port = 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});