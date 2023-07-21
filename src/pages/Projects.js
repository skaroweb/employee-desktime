import { useState, useEffect } from "react";
import { projectFirestore } from "../services/firebaseConfig";
import NavBar from "../components/NavBar";
import { logout, isAuthenticated } from "../services/Auth";
import { useNavigate, Navigate } from "react-router-dom";

export default function Projectpage() {
  const navigate = useNavigate();
  const [projectname, setProjectname] = useState("");
  const [projectcategory, setProjectcategory] = useState("");
  const [updatedeskentry, setUpdatedeskentry] = useState([]);

  const initialStateErrors = {
    projectname: { required: false },
    projectcategory: { required: false },
  };
  const [errors, setErrors] = useState(initialStateErrors);

  const handleinputprojectname = (e) => {
    setProjectname(e.target.value);
  };

  const handleoptioncategory = (event) => {
    setProjectcategory(event.target.value);
  };

  const handleprojectname = (e) => {
    e.preventDefault();
    let data = {
      projectname: projectname,
      projectcategory: projectcategory,
    };
    let errors = initialStateErrors;
    let hasError = false;
    if (Object.keys(data.projectname).length === 0) {
      errors.projectname.required = true;
      hasError = true;
    }
    if (Object.keys(data.projectcategory).length === 0) {
      errors.projectcategory.required = true;
      hasError = true;
    }
    if (!hasError) {
      projectFirestore
        .collection("projectname")
        .add(data)
        .then((docRef) => {
          setUpdatedeskentry([
            ...updatedeskentry,
            {
              id: docRef.id,
              projectname: projectname,
              projectcategory: projectcategory,
            },
          ]);
          setProjectname("");
        })
        .catch((err) => {
          console.log(err);
        });
    }
    setErrors(errors);
  };

  useEffect(() => {
    projectFirestore
      .collection("projectname")
      .get()
      .then((querySnapshot) => {
        const entrydesktimeloading = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            projectname: doc.data().projectname,
            projectcategory: doc.data().projectcategory,
          };
        });
        setUpdatedeskentry(entrydesktimeloading);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const logoutUser = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated()) {
    //redirect user to dashboard
    return <Navigate to="/login" />;
  }

  const sortedCategories = [
    ...new Set(updatedeskentry.map((project) => project.projectcategory)),
  ].sort();

  const projectsByCategory = sortedCategories.reduce((acc, category) => {
    const projects = updatedeskentry
      .filter((project) => project.projectcategory === category)
      .map((project) => project.projectname)
      .sort();
    acc[category] = projects;
    return acc;
  }, {});

  return (
    <div>
      <NavBar logoutUser={logoutUser} />
      <form onSubmit={handleprojectname}>
        <label htmlFor="projectname">Projectname:</label>
        <input
          type="text"
          id="projectname"
          name="projectname"
          value={projectname}
          onChange={handleinputprojectname}
        />
        {errors.projectname.required ? (
          <span className="text-danger">Project is required.</span>
        ) : null}
        <br />
        <label htmlFor="selectoptions">Choose any category:</label>
        <select
          name="selectoptions"
          id="selectoptions"
          onChange={handleoptioncategory}
          value={projectcategory}
        >
          <option value="">Please choose any one</option>
          <option value="casino">Casino</option>
          <option value="betting">Betting</option>
          <option value="poker">Poker</option>
        </select>
        {errors.projectcategory.required ? (
          <span className="text-danger">Project category is required.</span>
        ) : null}
        <br />
        <button type="submit">Add project</button>
      </form>
      <div>Project Name</div>
      {sortedCategories.map((category) => (
        <div key={category}>
          <h4>{category}</h4>
          {projectsByCategory[category].map((project, index) => (
            <div key={index}>{project}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
