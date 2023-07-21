import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "firebase/compat/auth";
import "firebase/compat/firestore";

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
export const auth = firebase.auth();
export const firestore = firebase.firestore();

// export const createUserDocument = async (user) => {
//   if (!user) return;

//   const userRef = firestore.doc(`users/${user.uid}`);
//   //console.log(userRef);
//   const snapshot = await userRef.get();

//   if (!snapshot.exists) {
//     const { email } = user;

//     try {
//       await userRef.set({
//         email,
//         createdAt: new Date(),
//       });
//     } catch (error) {
//       console.log("Error in creating user", error);
//     }
//   }
// };
