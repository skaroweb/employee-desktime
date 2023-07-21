import { useState, useEffect } from "react";
import { projectFirestore } from "../services/firebaseConfig";
import { UserDetailsApi } from "../services/Api";
import NavBar from "../components/NavBar";
import { logout, isAuthenticated } from "../services/Auth";
import { useNavigate, Navigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

export default function DesktimePage() {
  const navigate = useNavigate();
  const [deskdate, setDeskdate] = useState([]);
  const [arrivaltime, setArrivaltime] = useState([]);
  const [project, setProject] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [users, setUsers] = useState({ name: "", email: "", localId: "" });
  const [selectedOptions, setSelectedOptions] = useState([]);
  useEffect(() => {
    UserDetailsApi().then((response) => {
      setUsers({
        name: response.data.users[0].displayName,
        email: response.data.users[0].email,
        localId: response.data.users[0].localId,
      });
    });
  }, []);

  const handledate = (event) => {
    const date = new Date();
    const defaultValue = date.toLocaleDateString("en-CA");
    setDeskdate(defaultValue);
  };
  useEffect(() => {
    handledate();
  }, []);

  const handlearrivaltime = (event) => {
    var hours = (new Date().getHours() < 10 ? "0" : "") + new Date().getHours();
    var minutes =
      (new Date().getMinutes() < 10 ? "0" : "") + new Date().getMinutes();
    var defaultValue = `${hours}:${minutes}`;
    setArrivaltime(defaultValue);
  };

  const handleproject = (event) => {
    const selectedProject = event.target.value;
    // Find the project category based on the selected project name
    const selectedProjectData = updateprojectname.find(
      (item) => item.projectname === selectedProject
    );

    if (selectedProjectData) {
      const selectedProjectCategory = selectedProjectData.projectcategory;
      // Use the selected project category as needed in your API or state
      console.log("Selected Project Category:", selectedProjectCategory);
    }

    setProject(selectedProject);
    setSelectedOptions([]);
  };

  const [updateprojectname, setUpdateprojectname] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(projectFirestore, "projectname")
        );
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUpdateprojectname(data);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchData();
  }, []);

  const handleoptions = (event) => {
    setProject(event.target.value);
  };

  const [updatedeskentry, setUpdatedeskentry] = useState([]);

  const initialStateErrors = {
    arrivaltime: { required: false },
    project: { required: false },
  };
  const [errors, setErrors] = useState(initialStateErrors);
  const handleSubmit = async (event) => {
    event.preventDefault();
    let data = {
      deskdate: deskdate,
      arrivaltime: arrivaltime,
      lefttime: "",
      project: project,
      check: false,
      projecttime: "",
      userId: users.localId,
      createTime: new Date().toISOString(),
    };
    let errors = initialStateErrors;
    let hasError = false;

    if (Object.keys(data.arrivaltime).length === 0) {
      errors.arrivaltime.required = true;
      hasError = true;
    }
    if (!Object.keys(data.project).length > 0) {
      errors.project.required = true;
      hasError = true;
    }
    if (!hasError) {
      try {
        const docRef = await addDoc(
          collection(projectFirestore, "desktimeinput"),
          data
        );
        setUpdatedeskentry([
          ...entrydesktimeloading,
          {
            id: docRef.id,
            ...data,
          },
        ]);
        setArrivaltime("");
        setProject("");
      } catch (error) {
        console.error("Error adding data to Firestore:", error);
      }
    }
    setErrors(errors);
  };

  const updateValues = async (user) => {
    // Calculate the values for lefttimedefaultValue and result
    var hours = (new Date().getHours() < 10 ? "0" : "") + new Date().getHours();
    var minutes =
      (new Date().getMinutes() < 10 ? "0" : "") + new Date().getMinutes();
    var lefttimedefaultValue = `${hours}:${minutes}`;
    var result = minsToStr(
      strToMins(lefttimedefaultValue) - strToMins(user.arrivaltime)
    );

    try {
      const urlParts = user.id.split("/");
      const documentId = urlParts[urlParts.length - 1];
      const docRef = doc(projectFirestore, "desktimeinput", documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          lefttime: lefttimedefaultValue,
          check: true,
          projecttime: result,
          createTime: docSnap.data().createTime,
        });
        setRefresh(true);
      } else {
        console.error("Document does not exist:", documentId);
      }
    } catch (error) {
      console.error("Error updating data in Firestore:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(projectFirestore, "desktimeinput"),
            orderBy("createTime")
          )
        );
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRefresh(false);
        setUpdatedeskentry(data);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchData();
  }, [refresh]);

  const entrydesktimeloading = updatedeskentry.map((entry) => ({
    id: entry.id,
    deskdate: entry.deskdate,
    arrivaltime: entry.arrivaltime,
    lefttime: entry.lefttime,
    project: entry.project,
    check: entry.check,
    projecttime: entry.projecttime,
    userId: entry.userId,
  }));

  function strToMins(t) {
    if (typeof t !== "string") return 0;
    var s = t.split(":");
    return Number(s[0]) * 60 + Number(s[1]);
  }

  function minsToStr(t) {
    const hours = Math.trunc(t / 60);
    const minutes = t % 60;
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}`;
  }

  const updateValue = async (user, documentId) => {
    var hours = (new Date().getHours() < 10 ? "0" : "") + new Date().getHours();
    var minutes =
      (new Date().getMinutes() < 10 ? "0" : "") + new Date().getMinutes();
    var lefttimedefaultValue = `${hours}:${minutes}`;
    var result = minsToStr(
      strToMins(lefttimedefaultValue) - strToMins(user.arrivaltime)
    );

    try {
      const docRef = doc(projectFirestore, "desktimeinput", documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          lefttime: lefttimedefaultValue,
          check: true,
          projecttime: result,
        });

        setRefresh(true);
      } else {
        console.error("Document does not exist:", documentId);
      }
    } catch (error) {
      console.error("Error updating data in Firestore:", error);
    }
  };

  const tasks = entrydesktimeloading.some(
    (task) => task.userId === users.localId && task.check === false
  );

  var today = new Date().toISOString().split("T")[0];
  let curDate = entrydesktimeloading.filter(function (user) {
    return user.deskdate === today;
  });

  const curarrival = curDate
    .filter((user) => user.userId === users.localId)
    .map((res) => res.arrivaltime);
  const curarrivaltime = curarrival[0];
  const curleft = curDate
    .filter((user) => user.userId === users.localId)
    .map((res) => res.lefttime);
  const curlefttime = curleft[curleft.length - 1];

  function subtractTimes(time1, time2) {
    const minutes1 = strToMins(time1);
    const minutes2 = strToMins(time2);
    const diffMinutes = minutes1 - minutes2;
    return minsToStr(diffMinutes);
  }

  const time1 = curarrivaltime;
  const time2 = curlefttime;
  const timeDiffarrivleft = subtractTimes(time2, time1);

  const projecttiming = curDate.reduce((acc, curr) => {
    const { project, projecttime } = curr;
    if (curr.userId === users.localId) {
      if (acc.hasOwnProperty(project)) {
        const [existingHours, existingMinutes] = acc[project]
          .split(":")
          .map(Number);
        const [newHours, newMinutes] = projecttime.split(":").map(Number);
        const totalHours = existingHours + newHours;
        const totalMinutes = existingMinutes + newMinutes;
        const adjustedHours = Math.floor(totalMinutes / 60);
        const adjustedMinutes = totalMinutes % 60;
        const adjustedTime = `${totalHours + adjustedHours}:${adjustedMinutes
          .toString()
          .padStart(2, "0")}`;
        acc[project] = adjustedTime;
      } else {
        acc[project] = projecttime;
      }
    }
    return acc;
  }, {});

  const formattedProjectTiming = {};
  for (const [project, time] of Object.entries(projecttiming)) {
    if (time) {
      const [hours, minutes] = time.split(":").map(Number);
      const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      formattedProjectTiming[project] = formattedTime;
    } else {
      formattedProjectTiming[project] = time;
    }
  }

  const logoutUser = () => {
    logout();
    navigate("/login");
  };
  if (!isAuthenticated()) {
    //redirect user to dashboard
    return <Navigate to="/login" />;
  }
  const uniqueCategories = [
    ...new Set(updateprojectname.map((item) => item.projectcategory)),
  ];
  const handleOptionChange = (event) => {
    const selectedOptionValue = event.target?.value;

    // Clear all selected options except the current one
    setSelectedOptions((prevOptions) =>
      prevOptions.filter((option) => option === selectedOptionValue)
    );
  };

  function formatTime(time) {
    if (time && typeof time === "string") {
      const [hours, minutes] = time.split(":");
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return ""; // Return a default value if 'time' is undefined or not a string
  }
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };
  const calculateTotalTime = () => {
    let totalTime = 0;
    const filteredOptions = ["lunch", "permission", "break"];

    curDate.forEach((user) => {
      if (
        user.userId === users.localId &&
        filteredOptions.includes(user.project)
      ) {
        const timeDiff = strToMins(user.projecttime);
        totalTime += timeDiff;
      }
    });

    return minsToStr(totalTime);
  };
  const totalTimeExcludingFiltered = calculateTotalTime();

  return (
    <div>
      <NavBar logoutUser={logoutUser} />
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="desktimedate">Desktimedate:</label>
        <input
          type="date"
          id="desktimedate"
          name="desktimedate"
          value={deskdate}
          disabled
        />
        <br />
        <label htmlFor="arrivaltime">Arrival time:</label>
        <input
          type="time"
          id="arrivaltime"
          name="arrivaltime"
          value={arrivaltime}
          disabled
        />
        {errors.arrivaltime.required ? (
          <span className="text-danger">Arrival time is required.</span>
        ) : null}
        <button onClick={handlearrivaltime} disabled={tasks && "disabled"}>
          Arrival time
        </button>
        <br />
        <label htmlFor="selectproject">Choose a project:</label>
        <select
          name="selectproject"
          id="selectproject"
          onChange={handleproject}
          value={project}
          disabled={tasks && "disabled"}
        >
          <option value="">Please choose a project</option>
          {updateprojectname.map((item) => (
            <option key={item.id} value={item.projectname}>
              {item.projectname}
            </option>
          ))}
        </select>
        {errors.project.required ? (
          <span className="text-danger">Project is required.</span>
        ) : null}
        <br />
        <label htmlFor="selectoptions">Choose any option:</label>
        <select
          name="selectoptions"
          id="selectoptions"
          onChange={handleoptions}
          value={project}
          disabled={tasks && "disabled"}
        >
          <option value="">Please choose any one</option>
          {/* {updateprojectname.map((item) => (
            <option key={item.id} value={item.projectname}>
              {item.projectname}
            </option>
          ))} */}
          <option value="lunch">Lunch</option>
          <option value="break">Break</option>
          <option value="permission">Permission</option>
        </select>
        {errors.project.required ? (
          <span className="text-danger">Project is required.</span>
        ) : null}
        <br />
        <button onClick={handleSubmit} disabled={tasks && "disabled"}>
          Update
        </button>
      </form>
      <div>
        <div>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <th>Deskdate</th>
                <th>Project</th>
                <th>Arrival time</th>
                <th>Left time</th>
                <th>Project time</th>
              </tr>
              {curDate
                .filter((user) => user.userId === users.localId)
                .map((user) => {
                  return (
                    <tr key={user.id}>
                      <td>{formatDate(user.deskdate)}</td>
                      <td>{user.project}</td>
                      <td>{formatTime(user.arrivaltime)}</td>
                      <td>
                        {formatTime(user.lefttime)}
                        {!user.check && (
                          <button onClick={() => updateValues(user)}>
                            Update Value
                          </button>
                        )}
                      </td>
                      <td>{user.projecttime}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <hr />
          <div>In time: {formatTime(curarrivaltime)}</div>
          <div>Out time: {formatTime(curlefttime)}</div>
          {time2 && (
            <div>
              Total time:{" "}
              {subtractTimes(timeDiffarrivleft, totalTimeExcludingFiltered)}
            </div>
          )}
          {time2 && (
            <div>
              Total time for lunch,breakfast,permission: {calculateTotalTime()}
            </div>
          )}
          <h3>Projects</h3>

          {uniqueCategories.map((category) => {
            // Filter project names within the category
            const filteredProjects = updateprojectname.filter(
              (item) => item.projectcategory === category
            );
            // Exclude project category if it has no associated project names or if it has null project time
            if (
              filteredProjects.length === 0 ||
              filteredProjects.some(
                (item) => projecttiming[item.projectname] === null
              )
            ) {
              return null;
            }
            // Flag to check if the category heading is already rendered
            let categoryHeadingRendered = false;
            return (
              <div key={category}>
                {filteredProjects.map((item) => {
                  const projectTime = formattedProjectTiming[item.projectname];
                  // Exclude project names with null project time or empty project names
                  if (!projectTime || !item.projectname) {
                    return null;
                  }
                  // Render the category heading only once
                  if (!categoryHeadingRendered) {
                    categoryHeadingRendered = true;
                    return (
                      <div key={category}>
                        <h5>Project Category: {category}</h5>
                        <span>Project Name: {item.projectname}</span>
                        <br />
                        <span>Project Time: {projectTime}</span>
                        <br />
                        <br />
                      </div>
                    );
                  }
                  // Render other project names without the category heading
                  return (
                    <div key={item.projectname}>
                      <span>Project Name: {item.projectname}</span>
                      <br />
                      <span>Project Time: {projectTime}</span>
                      <br />
                      <br />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
