const Userentry = (props) => {
  return (
    <div>
      {props.entrytimeloading.map((user, index) => {
        return (
          <div key={index}>
            <p>desktimedate: {user.desktimedate}</p>
            <p>arrivaltime: {user.arrivaltime}</p>
            <p>lefttime: {user.lefttime}</p>
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default Userentry;
