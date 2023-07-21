import React, { useState, useEffect, useRef } from "react";
import {
  auth,
  createUserDocument,
  projectFirestore,
  updateProfileDocument,
  deleteProfileDocument,
  projectStorage,
  deleteUser,
  firestore,
} from "../services/firebaseConfig";
import NavBar from "../components/NavBar";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import firebase from "firebase/compat/app";
export default function RegisterPage() {
  const initialStateErrors = {
    name: { required: false, message: "" },
    email: { required: false, message: "" },
    password: { required: false, message: "" },
    custom_error: "",
  };
  const [errors, setErrors] = useState(initialStateErrors);
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    name: "",
    phoneNumber: "",
    employeeid: "",
    designation: "",
    dob: "",
    joiningdate: "",
    profile: "",
    gender: "",
  });

  const [profilelists, setProfilelists] = useState([]);
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [initialProfileData, setInitialProfileData] = useState({});
  const [hasError, setHasError] = useState(false);
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState(null);
  const [imageview, setImageview] = useState(null);
  const handleFileInput = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpdate = async (profileId) => {
    try {
      // Update the profile document with the new data
      const updatedData = {
        name: inputs.name,
        email: inputs.email,
        password: inputs.password,
        employeeid: inputs.employeeid,
        designation: inputs.designation,
        gender: inputs.gender,
        phoneNumber: inputs.phoneNumber,
        dob: inputs.dob,
        joiningdate: inputs.joiningdate,
        profile: inputs.profile,
      };

      let imageUrl = ""; // Define imageUrl variable here

      if (image) {
        const storageRef = ref(projectStorage, `profile_images/${profileId}`);
        await uploadBytes(storageRef, image);

        // Get the download URL of the uploaded image
        imageUrl = await getDownloadURL(storageRef);
      }

      updatedData.profile = imageUrl; // Set the profile field to the imageUrl

      await updateProfileDocument(profileId, updatedData);

      // Update the profilelists state with the updated data
      setProfilelists((prevProfilelists) =>
        prevProfilelists.map((profile) => {
          if (profile.id === profileId) {
            return { ...profile, ...updatedData };
          }
          return profile;
        })
      );

      setEditingProfileId(null);
    } catch (error) {
      console.error("Error updating user details:", error);
    }
    setInputs({
      email: "",
      password: "",
      name: "",
      phoneNumber: "",
      employeeid: "",
      designation: "",
      dob: "",
      joiningdate: "",
      profile: "",
      gender: "",
    });
  };
  const fileInputRef = useRef(null);
  const handleEdit = async (profileId) => {
    const profile = profilelists.find((profile) => profile.id === profileId);
    if (profile) {
      const initialData = initialProfileData.find(
        (data) => data.id === profileId
      );

      setInputs({
        ...initialData,
        // profile: "",
      });

      setEditingProfileId(profileId);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      let imageUrl = ""; // Define imageUrl variable here
      if (profile.profile) {
        try {
          const storageRef = ref(projectStorage, `profile_images/${profileId}`);
          imageUrl = await getDownloadURL(storageRef); // Assign the imageUrl value
          setUrl(imageUrl);
        } catch (error) {
          console.error("Error getting profile image URL:", error);
        }
      }
    }
  };

  const handleDelete = async (profileId) => {
    try {
      await deleteProfileDocument(profileId);

      setProfilelists((prevProfilelists) =>
        prevProfilelists.filter((profile) => profile.id !== profileId)
      );
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleInput = (event) => {
    if (event.target.name === "profile") {
      // Handle changes in the file input field
      if (event.target.files[0]) {
        setImage(event.target.files[0]);
      }
    } else {
      // Handle changes in other input fields
      setInputs({ ...inputs, [event.target.name]: event.target.value });
    }
  };

  const handleRegistration = async (event) => {
    event.preventDefault();
    let hasError = false;
    let errors = initialStateErrors;
    setErrors(initialStateErrors);

    try {
      // Create the user with email and password
      const { user } = await auth.createUserWithEmailAndPassword(
        inputs.email,
        inputs.password
      );
      // Upload the image to Firebase Storage
      const storageRef = ref(projectStorage, `profile_images/${user.uid}`);
      await uploadBytes(storageRef, image);

      // Get the download URL of the uploaded image
      const imageUrl = await getDownloadURL(storageRef);
      // Call createUserDocument to create the user document in Firestore
      await createUserDocument(user, {
        name: inputs.name,
        phoneNumber: inputs.phoneNumber,
        employeeid: inputs.employeeid,
        designation: inputs.designation,
        dob: inputs.dob,
        joiningdate: inputs.joiningdate,
        profile: imageUrl,
        gender: inputs.gender,
        password: inputs.password,
      });

      // Reset the form inputs
      setInputs({
        email: "",
        password: "",
        name: "",
        phoneNumber: "",
        employeeid: "",
        designation: "",
        dob: "",
        joiningdate: "",
        profile: "",
        gender: "",
      });
      setHasError(false);
      // Redirect or perform any necessary actions after successful registration
      // Fetch updated data and update the profilelists state
      const querySnapshot = await getDocs(
        collection(projectFirestore, "users")
      );
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProfilelists(data);
      setInitialProfileData(data);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        errors.custom_error = "Already this email has been registered!";
        hasError = true;
      } else if (error.code === "auth/weak-password") {
        errors.custom_error = "Password should be at least 6 characters!";
        hasError = true;
      } else {
        errors.custom_error = "An error occurred. Please try again.";
        hasError = true;
      }

      setErrors({ ...errors });
    }

    setHasError(hasError);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(projectFirestore, "users")
        );
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProfilelists(data);
        setInitialProfileData(data);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchData();
  }, []);
  const sortedProfilelists = profilelists.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  // const handleImage = (e) => {
  //   const file = e.target.files[0];
  //   setFileToBase(file);
  // };

  // const setFileToBase = (file) => {
  //   let reader = new FileReader();
  //   reader.readAsDataURL(file);
  //   reader.onload = function () {
  //     // cb(reader.result);
  //     setImageview(reader.result);
  //   };
  //   reader.onerror = function (error) {
  //     console.log("Error: ", error);
  //   };
  // };

  const handleDeleteAccount = async (userId) => {
    try {
      // Delete the user account from authentication
      const user = auth.currentUser;
      await user.delete();

      // Delete the user document from Firestore
      const userRef = doc(collection(projectFirestore, "users"), userId);
      await deleteDoc(userRef);

      // Remove the deleted profile from the profilelists state
      setProfilelists((prevProfilelists) =>
        prevProfilelists.filter((profile) => profile.id !== userId)
      );
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div>
      <NavBar />
      <section className="register-block">
        <div className="row">
          <div className="col register-sec">
            <h2 className="text-center">Register Now</h2>
            <form onSubmit={handleRegistration} className="register-form">
              <div className="form-group">
                <label htmlFor="exampleInputName1" className="text-uppercase">
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  onChange={handleInput}
                  name="name"
                  id="exampleInputName1"
                  value={inputs.name}
                />
                {errors.name.required ? (
                  <span className="text-danger">Name is required.</span>
                ) : null}
              </div>
              <div className="form-group">
                <label htmlFor="exampleInputEmail1" className="text-uppercase">
                  Email
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.email.required ? "is-invalid" : ""
                  }`}
                  onChange={handleInput}
                  name="email"
                  id="exampleInputEmail1"
                  value={inputs.email}
                />
                {errors.email.required && (
                  <span className="text-danger">{errors.email.message}</span>
                )}
              </div>
              <div className="form-group">
                <label
                  htmlFor="exampleInputPassword"
                  className="text-uppercase"
                >
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  onChange={handleInput}
                  name="password"
                  id="exampleInputPassword"
                  value={inputs.password}
                />
              </div>

              <div className="form-group">
                <label
                  htmlFor="exampleInputemployeeid"
                  className="text-uppercase"
                >
                  Employee ID
                </label>
                <input
                  className="form-control"
                  type="input"
                  onChange={handleInput}
                  name="employeeid"
                  id="exampleInputemployeeid"
                  value={inputs.employeeid}
                />
              </div>
              <div className="form-group">
                <label
                  htmlFor="exampleInputdesignation"
                  className="text-uppercase"
                >
                  Designation
                </label>
                <input
                  className="form-control"
                  type="input"
                  onChange={handleInput}
                  name="designation"
                  id="exampleInputdesignation"
                  value={inputs.designation}
                />
              </div>
              <div className="form-group">
                <p>Gender</p>
                <label
                  htmlFor="exampleInputgendermale"
                  className="text-uppercase"
                >
                  <input
                    className="form-control"
                    type="radio"
                    onChange={handleInput}
                    name="gender"
                    id="exampleInputgendermale"
                    value="male"
                    checked={inputs.gender === "male"}
                  />
                  Male
                </label>
                <label
                  htmlFor="exampleInputgenderfemale"
                  className="text-uppercase"
                >
                  <input
                    className="form-control"
                    type="radio"
                    onChange={handleInput}
                    name="gender"
                    id="exampleInputgenderfemale"
                    value="female"
                    checked={inputs.gender === "female"}
                  />
                  Female
                </label>
              </div>
              <div className="form-group">
                <label
                  htmlFor="exampleInputphonenumber"
                  className="text-uppercase"
                >
                  Phone Number
                </label>
                <input
                  className="form-control"
                  type="number"
                  onChange={handleInput}
                  name="phoneNumber"
                  id="exampleInputphonenumber"
                  value={inputs.phoneNumber}
                />
              </div>
              <div className="form-group">
                <label htmlFor="exampleInputdob" className="text-uppercase">
                  Date of Birth
                </label>
                <input
                  className="form-control"
                  type="date"
                  onChange={handleInput}
                  name="dob"
                  id="exampleInputdob"
                  value={inputs.dob}
                />
              </div>
              <div className="form-group">
                <label
                  htmlFor="exampleInputjoiningdate"
                  className="text-uppercase"
                >
                  Joining Date
                </label>
                <input
                  className="form-control"
                  type="date"
                  onChange={handleInput}
                  name="joiningdate"
                  id="exampleInputjoiningdate"
                  value={inputs.joiningdate}
                />
              </div>
              <div className="form-group">
                <label htmlFor="exampleInputphoto" className="text-uppercase">
                  Profile Photo
                </label>
                {/* <img id="image" src={imageview} alt="asd" /> */}
                <input
                  className="form-control"
                  type="file"
                  onChange={handleInput}
                  name="profile"
                  id="exampleInputphoto"
                  value={profilelists.profile}
                />
              </div>
              <div className="form-group">
                <span className="text-danger">
                  {errors.custom_error && <p>{errors.custom_error}</p>}
                </span>
              </div>
              <input type="submit" value="Register" />
            </form>
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Employee ID</th>
                  <th>Designation</th>
                  <th>Gender</th>
                  <th>Phone number</th>
                  <th>Date of birth</th>
                  <th>Joining date</th>
                  <th>Profile photo</th>
                  <th>Action</th>
                </tr>
                {sortedProfilelists.map((profilelist) => {
                  const {
                    id,
                    name,
                    email,
                    employeeid,
                    designation,
                    gender,
                    phoneNumber,
                    dob,
                    joiningdate,
                    profile,
                  } = profilelist;

                  return (
                    <tr key={profilelist.id}>
                      <td>
                        {editingProfileId === profilelist.id ? (
                          <input
                            type="text"
                            value={inputs.name}
                            onChange={handleInput}
                            name="name"
                          />
                        ) : (
                          profilelist.name
                        )}
                      </td>
                      <td>
                        {editingProfileId === profilelist.id ? (
                          <input
                            type="text"
                            value={inputs.email}
                            onChange={handleInput}
                            name="email"
                          />
                        ) : (
                          profilelist.email
                        )}
                      </td>
                      <td>
                        {editingProfileId === profilelist.id ? (
                          <input
                            type="text"
                            value={inputs.employeeid}
                            onChange={handleInput}
                            name="employeeid"
                          />
                        ) : (
                          profilelist.employeeid
                        )}
                      </td>
                      <td>
                        {editingProfileId === profilelist.id ? (
                          <input
                            type="text"
                            value={inputs.designation}
                            onChange={handleInput}
                            name="designation"
                          />
                        ) : (
                          profilelist.designation
                        )}
                      </td>
                      <td>
                        {editingProfileId === profilelist.id ? (
                          <>
                            <label>
                              <input
                                type="radio"
                                value="male"
                                checked={inputs.gender === "male"}
                                onChange={handleInput}
                                name="gender"
                              />{" "}
                              Male
                            </label>
                            <label>
                              <input
                                type="radio"
                                value="female"
                                checked={inputs.gender === "female"}
                                onChange={handleInput}
                                name="gender"
                              />{" "}
                              Female
                            </label>
                          </>
                        ) : (
                          profilelist.gender
                        )}
                      </td>
                      <td>
                        {editingProfileId === profilelist.id ? (
                          <input
                            type="number"
                            value={inputs.phoneNumber}
                            onChange={handleInput}
                            name="phoneNumber"
                          />
                        ) : (
                          profilelist.phoneNumber
                        )}
                      </td>
                      <td>
                        {editingProfileId === profilelist.id ? (
                          <input
                            type="date"
                            value={inputs.dob}
                            onChange={handleInput}
                            name="dob"
                          />
                        ) : (
                          profilelist.dob
                        )}
                      </td>
                      <td>
                        {editingProfileId === profilelist.id ? (
                          <input
                            type="date"
                            value={inputs.joiningdate}
                            onChange={handleInput}
                            name="joiningdate"
                          />
                        ) : (
                          profilelist.joiningdate
                        )}
                      </td>
                      <td>
                        {editingProfileId === profilelist.id ? (
                          <div>
                            <input
                              type="file"
                              onChange={handleFileInput}
                              name="profile"
                              value={profilelist.id.profile}
                            />
                            {url && (
                              <div>
                                <img
                                  src={url}
                                  alt="Profile"
                                  style={{ width: "100px", height: "100px" }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          profilelist.profile && (
                            <div>
                              <img
                                src={profilelist.profile}
                                alt="Profile"
                                style={{ width: "100px", height: "100px" }}
                              />
                            </div>
                          )
                        )}
                      </td>
                      <td>
                        {editingProfileId === profilelist.id ? (
                          <button onClick={() => handleUpdate(id)}>Save</button>
                        ) : (
                          <button onClick={() => handleEdit(id)}>Edit</button>
                        )}
                        <button
                          onClick={() => {
                            const confirmation = window.confirm(
                              "Are you sure you want to delete this user?"
                            );
                            if (confirmation) {
                              const deleteConfirmation = window.confirm(
                                "This action is irreversible. Are you sure you want to proceed?"
                              );
                              if (deleteConfirmation) {
                                handleDelete(id);
                                handleDeleteAccount(id);
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
