import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { UserDetailsApi } from "../services/Api";
import { logout } from "../services/Auth";
import axios from "axios";
import Userentry from "./Userentry";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState({ name: "", email: "", localId: "" });

  /* User entry details starts */
  const [entryinputs, setEntryinputs] = useState({
    desktimedate: "",
    arrivaltime: "",
    lefttime: "",
  });
  const [updateentry, setUpdateentry] = useState([]);

  useEffect(() => {
    axios
      .get(
        "https://leave-tracker-project-default-rtdb.firebaseio.com/userentry.json"
      )
      .then((response) => {
        setUpdateentry(response.data);
      });
  }, []);

  const entrytimeloading = [];
  for (const key in updateentry) {
    entrytimeloading.push({
      id: key,
      desktimedate: updateentry[key].desktimedate,
      arrivaltime: updateentry[key].arrivaltime,
      lefttime: updateentry[key].lefttime,
    });
  }
  //console.log(updateentry);
  const handleSubmit = (event) => {
    event.preventDefault();
    let data = {
      desktimedate: entryinputs.desktimedate,
      arrivaltime: entryinputs.arrivaltime,
      lefttime: entryinputs.lefttime,
    };
    axios
      .post(
        "https://leave-tracker-project-default-rtdb.firebaseio.com/userentry.json",
        data
      )
      .then((response) => {
        setUpdateentry([
          ...entrytimeloading,
          {
            desktimedate: entryinputs.desktimedate,
            arrivaltime: entryinputs.arrivaltime,
            lefttime: entryinputs.lefttime,
          },
        ]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleInput = (event) => {
    setEntryinputs({ ...entryinputs, [event.target.name]: event.target.value });
  };
  /* User entry details ends */
  /* Login user details starts */
  useEffect(() => {
    // if (isAuthenticated()) {
    UserDetailsApi().then((response) => {
      setUser({
        name: response.data.users[0].displayName,
        email: response.data.users[0].email,
        localId: response.data.users[0].localId,
      });
    });
    // }
  }, []);
  const logoutUser = () => {
    logout();
    navigate("/login");
  };

  // if (!isAuthenticated()) {
  //   //redirect user to dashboard
  //   return <Navigate to="/login" />;
  // }
  /* Login user details ends */
  return (
    <div>
      <NavBar logoutUser={logoutUser} />
      <main role="main" className="mt-5 container">
        <div className="mt-5">
          <h3>My Desktime</h3>
          <div>
            <p className="text-bold ">
              {user.name}, <span>{user.email}</span>
            </p>
            <p>your Firebase ID is {user.localId}</p>
          </div>
          <Userentry entrytimeloading={entrytimeloading} />
          <form onSubmit={handleSubmit} className="desktime-form" action="">
            <div className="form-group">
              <label htmlFor="desktimedate" className="text-uppercase">
                Date
              </label>
              <button>Date</button>
              <input
                type="date"
                className="form-control"
                onChange={handleInput}
                name="desktimedate"
                id="desktimedate"
                required
              />
              <span className="validity"></span>
            </div>
            <div className="form-group">
              <label htmlFor="arrivaltime" className="text-uppercase">
                Arrival Time
              </label>
              <input
                type="time"
                className="form-control"
                onChange={handleInput}
                name="arrivaltime"
                id="arrivaltime"
                min="00:00"
                max="23:59"
                required
              />
              <span className="validity"></span>
            </div>
            <div className="form-group">
              <label htmlFor="lefttime" className="text-uppercase">
                Left Time
              </label>
              <input
                type="time"
                className="form-control"
                onChange={handleInput}
                name="lefttime"
                id="lefttime"
                min="00:00"
                max="23:59"
                required
              />
              <span className="validity"></span>
            </div>
            <div>
              <input type="submit" value="Submit form" />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
