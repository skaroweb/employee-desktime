const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

// Initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());

// Get the user's UID
const uid = "hyj8wkWe2AeccXPotSC5uVAtmf33";

// Set custom claims for the user
const claims = {
  isAdmin: true,
  customData: {
    key1: "value1",
    key2: "value2",
  },
};

admin
  .auth()
  .setCustomUserClaims(uid, claims)
  .then(() => {
    console.log("Custom claims added successfully.");
  })
  .catch((error) => {
    console.log("Error setting custom claims:", error);
  });

// API endpoint to fetch the user list
app.get("/api/users", async (req, res) => {
  try {
    const userList = await admin.auth().listUsers();
    console.log(userList.users);
    res.json(userList.users);
  } catch (error) {
    console.error("Error fetching user list:", error);
    res.status(500).json({ error: "Error fetching user list" });
  }
});

// Start the server
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
