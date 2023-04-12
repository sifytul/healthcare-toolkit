// import * as firebase from "firebase/firestore";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { useState } from "react";
// import { database } from "../../../firebase";

// const Radiology = () => {
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [data, setData] = useState([]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     const querySnapshot = query(collection(database, "users"), where("age", "<", 10), where("age", ">", 18))
//     const docs = await getDocs(querySnapshot)
      

//     docs.docs.map((doc) => console.log(doc.data()));
    

//   return (
    // <div>
    //   <form onSubmit={handleSubmit}>
    //     <input
    //       type="text"
    //       placeholder="Start Date"
    //       value={startDate}
    //       onChange={(e) => setStartDate(e.target.value)}
    //     />
    //     <input
    //       type="text"
    //       placeholder="End Date"
    //       value={endDate}
    //       onChange={(e) => setEndDate(e.target.value)}
    //     />
    //     <button type="submit">Submit</button>
    //   </form>
    //   {data.map((item) => (
    //     <div key={item.id}>{JSON.stringify(item)}</div>
    //   ))}
    // </div>
//   );
// };


const Radiology = () => {
  return <div>hello</div>
}
export default Radiology;