import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { database } from "../../../firebase";

const init = {
  // download: "",
  // lat: "",
  // lng: "",
  // ping: "",
  // // timestamp: "",
  // uid: "",
  // upload: "",
  name: "",
  age: ""
};
const FormEntry = () => {
  const [state, setState] = useState({ ...init });
  // const [data, setData] = useState([]);
  const handleChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };
  const collectionRef = collection(database, "users");

  const now = serverTimestamp();
  const handleSubmit = async (e) => {
    e.preventDefault();
    addDoc(collectionRef, {
      name: state.name,
      age: Number(state.age),
      timestamp: now,
    });
    setState({ ...init });
  };
  console.log(now);

  const fetchData = async () => {
    const snapshot = await getDocs(collectionRef);
    snapshot.forEach((doc) => console.log(doc.data()));
  };
  // const fetchFilteredData = async () => {
  //   const rangeRef = collection(database, "users");
  //   const q = query(rangeRef, where("uid", "==", "dfdfdf"));
  //   const snap = await getDocs(q);
  //   snap.docs.forEach((doc) => console.log(doc.data()))
  //   console.log("clicked")
  // };

  const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState([]);
  const fetchFilteredData = async (e) => {
    e.preventDefault();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const querySnapshot = query(
      collection(database, "users"),
      where("timestamp", ">=", start), where("timestamp", "<=", end)
    );
    const docs = await getDocs(querySnapshot);

    docs.docs.map((doc) => console.log(doc.data()));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={state.name}
          onChange={handleChange}
        />
        <input
          type="number"
          name="age"
          value={state.age}
          onChange={handleChange}
        />

        <button type="submit">Submit</button>
      </form>

      <button type="button" onClick={fetchData}>
        Fetch
      </button>
      {/* <button type="button" onClick={fetchFilteredData}>
        Filtered
      </button> */}

      {/* {data.length>1 && data.map()} */}
      <div>
        <form onSubmit={fetchFilteredData}>
          <input
            type="text"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
        {data.map((item) => (
          <div key={item.id}>{JSON.stringify(item)}</div>
        ))}
      </div>
    </div>
  );
};

export default FormEntry;


//  {/* <input
//           type={"number"}
//           name="download"
//           value={state.download}
//           onChange={handleChange}
//           placeholder="download"
//         />
//         <input
//           type={"number"}
//           name="lat"
//           value={state.lat}
//           onChange={handleChange}
//           placeholder="lat"
//         />
//         <input
//           type={"number"}
//           name="lng"
//           value={state.lng}
//           onChange={handleChange}
//           placeholder="lng"
//         />
//         <input
//           type={"number"}
//           name="ping"
//           value={state.ping}
//           onChange={handleChange}
//           placeholder="ping"
//         />
//         {/* <input
//           type={"datetime-local"}
//           name="timestamp"
//           value={state.timestamp}
//           onChange={handleChange}
//           placeholder="timestamp"
//         /> */}
//         <input
//           type={"text"}
//           name="uid"
//           value={state.uid}
//           onChange={handleChange}
//           placeholder="uid"
//         />
//         <input
//           type={"number"}
//           name="upload"
//           value={state.upload}
//           onChange={handleChange}
//           placeholder="upload"
//         />

