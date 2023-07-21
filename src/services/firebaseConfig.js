import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAPTZreXkYhAxHtb0YlCX0trC2qg2sHwuI",
  authDomain: "leave-tracker-project.firebaseapp.com",
  databaseURL: "https://leave-tracker-project-default-rtdb.firebaseio.com",
  projectId: "leave-tracker-project",
  storageBucket: "leave-tracker-project.appspot.com",
  messagingSenderId: "261883404887",
  appId: "1:261883404887:web:765c667942b137a06c3912",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;

// Export the Firebase modules you need to use
const app = firebase.initializeApp(firebaseConfig);
export const auth = app.auth();

export const firestore = firebase.firestore();

export const createUserDocument = async (user, additionalData) => {
  if (!user) return;

  const userRef = firestore.collection("users").doc(user.uid);

  try {
    await userRef.set({
      email: user.email,
      // createdAt: new Date(),
      role: "employee",
      phoneNumber: user.phoneNumber,
      employeeid: user.employeeid,
      designation: user.designation,
      dob: user.dob,
      joiningdate: user.joiningdate,
      profile: user.profile,
      gender: user.gender,
      password: user.password,
      ...additionalData,
    });
    console.log("User document created successfully.");
  } catch (error) {
    console.error("Error creating user document:", error);
  }
};

// Create a Firestore instance
const projectFirestore = firebase.firestore();

export { projectFirestore };
export const projectStorage = firebase.storage();
export const updateProfileDocument = async (profileId, updatedData) => {
  try {
    const profileRef = projectFirestore.collection("users").doc(profileId);
    await profileRef.update(updatedData);
  } catch (error) {
    throw new Error("Error updating profile document:", error);
  }
};

export const deleteProfileDocument = async (profileId) => {
  try {
    const profileRef = projectFirestore.collection("users").doc(profileId);
    await profileRef.delete();
  } catch (error) {
    throw new Error("Error deleting profile document:", error);
  }
};
