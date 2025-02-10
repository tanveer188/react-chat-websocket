import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="px-8 flex items-center justify-center text-white bg-[url(/src/assets/background.jpg)] bg-no-repeat bg-cover w-full h-screen">
      <div className="w-fit flex flex-col justify-center items-center text-center space-y-2 bg-white/10 backdrop-blur-sm rounded-xl py-8 px-4">
        <h1 className="text-3xl font-bold">Welcome to SocketGram</h1>
        <Link to="/login" className="p-2 bg-blue-500 hover:bg-blue-700 rounded-md font-medium w-[300px] text-center">
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default Home;