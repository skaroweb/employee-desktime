import { useState, useEffect } from "react";
import { format } from "date-fns";
import "./Reports.css";
import { UserDetailsApi } from "../services/Api";
import { projectFirestore } from "../services/firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { logout, isAuthenticated } from "../services/Auth";
import { useNavigate, Navigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { writeFile } from "xlsx";
import * as XLSX from "xlsx";
export default function Reportpage() {
  const navigate = useNavigate();
  const [updateprojectentry, setUpdateprojectentry] = useState([]);
  const [filteredList, setFilteredList] = useState(updateprojectentry);
  const currentdate = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState({
    fromdate: currentdate,
    todate: "",
  });
  const [hideinout, setHideinout] = useState(true);
  const [users, setUsers] = useState({ name: "", email: "", localId: "" });
  const [employee, setEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeelist, setEmployeelist] = useState([]);
  const [updateprojectname, setUpdateprojectname] = useState([]);
  const exportFilteredData = () => {
    // Prepare the data for export
    const exportData = hasadmin.map((entry) => ({
      Deskdate: formatDate(entry.deskdate),
      "Arrival time": formatTime(entry.arrivaltime),
      "Left time": formatTime(entry.lefttime),
      Project: entry.project,
      "Project time": entry.projecttime,
    }));

    // Convert the data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");

    // Save the workbook to a file
    writeFile(workbook, "Desktime-data.xlsx");
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(projectFirestore, "projectname"))
        );
        const projectnameData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUpdateprojectname(projectnameData);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const snapshot = await getDocs(collection(projectFirestore, "users"));
        const userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployee(userList);
      } catch (error) {
        console.error("Error fetching user list:", error);
        setEmployeelist(""); // Set an empty string in case of an error
      }
    };
    fetchUserList();
  }, []);

  useEffect(() => {
    UserDetailsApi().then((response) => {
      setUsers({
        name: response.data.users[0].displayName,
        email: response.data.users[0].email,
        localId: response.data.users[0].localId,
      });
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(
          query(
            collection(projectFirestore, "desktimeinput"),
            orderBy("createTime")
          )
        );
        const entryprojectloading = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUpdateprojectentry(entryprojectloading);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };
    fetchData();
  }, []);

  const isAdmin = employee.filter((obj) => obj.role === "admin");
  //console.log(isAdmin[0]?.id);
  const hasadmin =
    isAdmin[0]?.id === users.localId
      ? filteredList
      : filteredList.filter((user) => user.userId === users.localId);

  const filterByDate = (filteredData) => {
    if (selectedDate.fromdate === "" && selectedDate.todate === "") {
      return filteredData;
    } else if (selectedDate.todate !== "") {
      setHideinout(false);
      const filtereddatas = filteredData.filter(
        (data) =>
          data.deskdate >= selectedDate.fromdate &&
          data.deskdate <= selectedDate.todate
      );
      return filtereddatas;
    } else if (selectedDate.fromdate !== "") {
      setHideinout(true);
      const filtereddatas = filteredData.filter(
        (data) => data.deskdate === selectedDate.fromdate
      );
      return filtereddatas;
    } else {
      return filteredData;
    }
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    setSelectedDate({
      ...selectedDate,
      [name]: value,
    });
  };

  useEffect(() => {
    const filteredData = filterByDate(updateprojectentry);
    setFilteredList(filteredData);
  }, [selectedDate, updateprojectentry]);

  const resetFilters = () => {
    setSelectedDate({
      fromdate: "",
      todate: "",
    });
    setHideinout(false);
  };

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

  const curarrival = hasadmin.map((res) => res.arrivaltime);
  const curarrivaltime = curarrival[0];
  const curleft = hasadmin.map((res) => res.lefttime);
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

  const projecttiming = updateprojectentry.reduce((acc, curr) => {
    const { project, projecttime } = curr;
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

  const aggregatedProjects = hasadmin.reduce((acc, item) => {
    const { userId, project, projecttime } = item;

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
    return acc;
  }, {});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(
          query(
            collection(projectFirestore, "desktimeinput"),
            orderBy("createTime")
          )
        );
        const result = snapshot.docs.reduce((acc, doc) => {
          const { userId } = doc.data();
          if (userId in acc) {
            acc[userId]++;
          } else {
            acc[userId] = 1;
          }
          return acc;
        }, {});
        const idToNameMap = {};
        for (const id in result) {
          const count = result[id];
          const profile = employee.find((profile) => profile.id === id);
          if (profile) {
            idToNameMap[id] = {
              count,
              name: profile.name,
              role: profile.role,
            };
          }
        }
        setEmployeelist(idToNameMap);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };
    fetchData();
  }, [updateprojectentry]);

  const filterByEmployee = (filteredData) => {
    if (!selectedEmployee || selectedEmployee === "all") {
      return filteredData;
    }

    const filteredEmployee = filteredData.filter(
      (car) => car.userId === selectedEmployee
    );
    return filteredEmployee;
  };

  useEffect(() => {
    const filteredData = filterByEmployee(filterByDate(updateprojectentry));
    setFilteredList(filteredData);
  }, [selectedDate, updateprojectentry, selectedEmployee]);

  useEffect(() => {
    if (isAdmin[0]?.id === users.localId) {
      setSelectedEmployee(isAdmin[0]?.id);
    }
  }, [employee]);
  // Function to apply all filters and return filtered data
  const applyFilters = (data) => {
    let filteredData = data;

    // Filter by date
    if (selectedDate.fromdate !== "" && selectedDate.todate !== "") {
      filteredData = filteredData.filter(
        (entry) =>
          entry.deskdate >= selectedDate.fromdate &&
          entry.deskdate <= selectedDate.todate
      );
    } else if (selectedDate.fromdate !== "") {
      filteredData = filteredData.filter(
        (entry) => entry.deskdate === selectedDate.fromdate
      );
    }

    // Filter by employee
    if (selectedEmployee && selectedEmployee !== "all") {
      filteredData = filteredData.filter(
        (entry) => entry.userId === selectedEmployee
      );
    }

    return filteredData;
  };

  // Function to calculate total time for a specific project
  const calculateTotalTimeForProject = (data, project) => {
    if (!data || data.length === 0) {
      return "0:00";
    }

    let totalTime = 0;
    data.forEach((user) => {
      if (user.project === project) {
        const timeDiff = strToMins(user.projecttime);
        totalTime += timeDiff;
      }
    });

    return minsToStr(totalTime);
  };

  // Calculate total time for lunch, breakfast, and permission
  const calculateTotalTimeWithFilter = (data, filterOptions) => {
    let totalTime = 0;
    filterOptions.forEach((project) => {
      const time = calculateTotalTimeForProject(data, project);
      totalTime += strToMins(time);
    });

    return minsToStr(totalTime);
  };

  // Calculate total time excluding lunch, breakfast, and permission
  const calculateTotalTimeExcludingFilter = (data, filterOptions) => {
    const filteredData = data.filter(
      (user) => !filterOptions.includes(user.project)
    );
    let totalTime = 0;
    filteredData.forEach((user) => {
      const timeDiff = strToMins(user.projecttime);
      totalTime += timeDiff;
    });

    return minsToStr(totalTime);
  };

  // Calculate total time and total time for lunch, breakfast, permission
  const calculateTotalTimes = (data) => {
    const filteredOptions = ["lunch", "permission", "break"];
    const totalTimeExcludingFiltered = calculateTotalTimeExcludingFilter(
      data,
      filteredOptions
    );
    const totalTimeWithFilter = calculateTotalTimeWithFilter(
      data,
      filteredOptions
    );

    return { totalTimeExcludingFiltered, totalTimeWithFilter };
  };

  useEffect(() => {
    // Apply all filters and set the filtered list
    const filteredData = applyFilters(updateprojectentry);
    setFilteredList(filteredData);
  }, [selectedDate, updateprojectentry, selectedEmployee]);

  // Calculate total times
  const { totalTimeExcludingFiltered, totalTimeWithFilter } =
    calculateTotalTimes(filteredList);

  const logoutUser = () => {
    logout();
    navigate("/login");
  };
  if (!isAuthenticated()) {
    //redirect user to dashboard
    return <Navigate to="/login" />;
  }

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };
  function formatTime(time) {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const uniqueCategories = [
    ...new Set(updateprojectname.map((item) => item.projectcategory)),
  ];
  return (
    <>
      <NavBar logoutUser={logoutUser} />
      <div className="filterbyfilters">
        <div className="filter-from-date">
          <label>Filter by from date:</label>
          <input
            className="form-control"
            type="date"
            value={selectedDate.fromdate}
            name="fromdate"
            onChange={handleDateChange}
          />
        </div>

        <div className="filter-to-date">
          <label>Filter by to date:</label>
          <input
            className="form-control"
            type="date"
            value={selectedDate.todate}
            name="todate"
            onChange={handleDateChange}
          />
        </div>
        {isAdmin[0]?.id === users.localId && (
          <div className="filter-from-employee">
            <label>Filter by Employee Name:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              {Object.entries(employeelist).map(([id, { name }]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
        <button onClick={resetFilters}>Reset Filters</button>
        {isAdmin[0]?.id === users.localId && (
          <button onClick={exportFilteredData}>Export</button>
        )}
      </div>
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <th>Deskdate</th>
            <th>Arrival time</th>
            <th>Left time</th>
            <th>Project</th>
            <th>Project time</th>
          </tr>
          {hasadmin.map((item, index) => {
            return (
              <tr key={index}>
                <td>{formatDate(item.deskdate)}</td>
                <td>{formatTime(item.arrivaltime)}</td>
                <td>{formatTime(item.lefttime)}</td>
                <td>{item.project}</td>
                <td>{item.projecttime}</td>
                <td>{item.userId}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <hr />
      {hideinout && curarrivaltime && curlefttime && timeDiffarrivleft && (
        <>
          <div>In time: {formatTime(curarrivaltime)}</div>
          <div>Out time: {formatTime(curlefttime)}</div>
          <div>Total time:{totalTimeExcludingFiltered}</div>
          <div>
            Total time for lunch, breakfast, permission: {totalTimeWithFilter}
          </div>
        </>
      )}
      {Object.keys(aggregatedProjects).length > 0 && (
        <div>
          <h3>Projects</h3>
          {uniqueCategories.map((category) => {
            const filteredProjects = updateprojectname.filter(
              (item) => item.projectcategory === category
            );
            let categoryHeadingRendered = false;
            return (
              <div key={category}>
                {filteredProjects.map((item) => {
                  const projectTime = projecttiming[item.projectname];
                  if (!projectTime || !item.projectname) {
                    return null;
                  }
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
      )}
      {Object.keys(aggregatedProjects).length === 0 && (
        <div>No data available</div>
      )}
    </>
  );
}
