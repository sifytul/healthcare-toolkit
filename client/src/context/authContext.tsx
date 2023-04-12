import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import {getFirestore} from "firebase/firestore"
import React, { createContext, useContext, useEffect, useState } from "react";
import "../../firebase";

// prepare the data layer
export const AuthContext = createContext<any>(null);

// Wrap our app and provide the data layer
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<Object>();

  // authState change handling
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user as User);
      setLoading(false);
    });
  });

  //signup function
  async function signup(email: string, password: string, username: string) {
    const auth = getAuth();
    await createUserWithEmailAndPassword(auth, email, password);

    // update user
    await updateProfile(auth.currentUser as User, {
      displayName: username,
    });

    const user = auth.currentUser;
    setCurrentUser({
      ...user,
    });
  }
  //signin

  async function signin(email: string, password: string) {
    const auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password);

    const user = auth.currentUser;
    setCurrentUser({
      ...user,
    });
  }

  //signout
  async function signout() {
    const auth = getAuth();
    await signOut(auth);
  }
  const value = {
    currentUser,
    signup,
    signin,
    signout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// pull auth information from the data layer
export const useAuth = () => {
  return useContext(AuthContext);
};



// it's for some firebase firestore
// const startDate = new Date("2022-01-01T00:00:00.000Z");
// const endDate = new Date("2022-12-31T23:59:59.999Z");

// const query = firebase
//   .firestore()
//   .collection("collection_name")
//   .where("timestamp", ">=", startDate)
//   .where("timestamp", "<=", endDate);

// query.get().then((snapshot) => {
//   snapshot.forEach((doc) => {
//     console.log(doc.data());
//   });
// });

// import firebase from "firebase/app";
// import "firebase/firestore";

// // Initialize Firebase
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   databaseURL: "YOUR_DATABASE_URL",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID",
// };

// firebase.initializeApp(firebaseConfig);

// // Get a reference to the Firestore instance
// const db = firebase.firestore();

// // Perform a query
// db.collection("users")
//   .where("age", ">", 30)
//   .get()
//   .then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//       console.log(doc.id, " => ", doc.data());
//     });
//   })
//   .catch((error) => {
//     console.log("Error getting documents: ", error);
//   });