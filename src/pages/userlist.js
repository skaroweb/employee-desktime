import axios from "axios";
import { useState, useEffect } from "react";
const UserList = () => {
  const projectId = "leave-tracker-project";
  const collectionName = "users";
  const apiKey = "AIzaSyAPTZreXkYhAxHtb0YlCX0trC2qg2sHwuI";
  const [userListHtml, setUserListHtml] = useState("");

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?key=${apiKey}`;
        const response = await axios.get(url);
        const firestoreData = response.data.documents;

        // Extract user data from the Firestore data
        const userList = firestoreData.map((document) => {
          const id = document.name.split("/").pop();
          const fields = {};

          for (const key in document.fields) {
            fields[key] = document.fields[key].stringValue;
          }

          return {
            id,
            ...fields,
          };
        });

        const html = userList
          .map(
            (user) => `
                <div key=${user.id}>
                  <p>User ID: ${user.id}</p>
                  <p>Name: ${user.name}</p>
                  <p>Email: ${user.email}</p>
                </div>
              `
          )
          .join("");

        setUserListHtml(html);
        console.log(userList);
      } catch (error) {
        console.error("Error fetching user list:", error);
        setUserListHtml(""); // Set an empty string in case of an error
      }
    };

    fetchUserList();
  }, []);

  return (
    <div>
      <h2>User List</h2>
      {userListHtml ? (
        <div dangerouslySetInnerHTML={{ __html: userListHtml }} />
      ) : (
        <p>Loading user list...</p>
      )}
    </div>
  );
};

export default UserList;
