import { useEffect, useState } from "react";
import { UserDetailsApi } from "../services/Api";
export default function DashboardPage() {
  const [user, setUser] = useState({ name: "", email: "", localId: "" });

  useEffect(() => {
    UserDetailsApi().then((response) => {
      setUser({
        name: response.data.users[0].displayName,
        email: response.data.users[0].email,
        localId: response.data.users[0].localId,
      });
    });
  }, []);

  /* Login user details ends */
  return (
    <div>
      <main role="main" className="mt-5 container">
        <div className="mt-5">
          <h3>My Desktime</h3>
          <div>
            <p className="text-bold ">
              {user.name}, <span>{user.email}</span>
            </p>
            <p>your Firebase ID is {user.localId}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
