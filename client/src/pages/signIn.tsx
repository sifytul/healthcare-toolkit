import { ChangeEvent, useState , FormEvent} from "react";
import { BsEyeFill, BsEyeSlashFill, BsFillPersonFill } from "react-icons/bs";
import { CgKey } from "react-icons/cg";

const init = {
  username: "",
  password: "",
};
const SignIn = () => {
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [formState, setFormState] = useState({ ...init });

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //TODO: Need to implement submission
  };
  return (
    <div className="max-w-screen-2xl mx-auto flex">
      {/* left div  */}
      <div className="h-screen bg-gradient-to-br from-[#F59130] to-[#FFBB78] flex items-center justify-center flex-col text-white p-8 ">
        <img
          className="h-[250px] w-[200px] object-cover"
          src="https://i.pinimg.com/originals/2a/35/b1/2a35b15e65c10785fb21d0f7a63e1a72.jpg"
        />
        <h1 className="m-0">
          HealthCARE
          <span className="text-3xl"> Toolkit</span>
        </h1>
        <p className="text-white/90">
          The HealthCare Toolkit software serves as the foundational API and
          data model for Health IT applications
        </p>
      </div>

      {/* right div  */}
      <div className="w-3/4 h-screen">
        <nav className="flex justify-end gap-4 h-16 items-center text-xl font-bold">
          <p className=" text-gray-600">Help</p>
          <button className="text-primary px-4 py-2 border rounded-md">
            Log In
          </button>
        </nav>
        <div className="flex justify-center items-center flex-col mx-auto mt-[100px] text-center w-1/2 space-y-8">
          <div>
            <h2>HealthCare</h2>
            <h3 className="text-2xl text-gray-600">
              Welcome to HealthCare Toolkit
            </h3>
            <p className="font-extralight text-sm text-gray-500">
              Login to proceed
            </p>
          </div>
          <form 
          onSubmit={submitHandler}
          className="flex flex-col w-full space-y-3">
            <div className="flex items-center space-x-2 border border-gray p-2 rounded-lg">
              <BsFillPersonFill className="text-primary text-xl" />
              <input
                className="outline-none"
                name="username"
                placeholder="username"
                type="text"
                value={formState.username}
                onChange={changeHandler}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 border border-gray p-2 rounded-lg">
              <CgKey className="text-primary text-xl" />
              <input
                className="outline-none flex-grow"
                name="password"
                placeholder="password"
                type={passwordOpen ? "text" : "password"}
                value={formState.password}
                onChange={changeHandler}
              />
              <div
                className="text-primary text-xl"
                onClick={() => setPasswordOpen(!passwordOpen)}
              >
                {passwordOpen ? <BsEyeSlashFill /> : <BsEyeFill />}
              </div>
            </div>
            <button
              className="flex items-center border border-gray p-2 bg-primary rounded-lg justify-center text-white font-bold"
              type="submit"
            >
              LOGIN
            </button>
          </form>
          <p className="text-sm text-gray-500 underline cursor-pointer">
            I forgot my password
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
