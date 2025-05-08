import axios from "axios";

const Instance = axios.create({
  baseURL: "http://localhost:6005" 
});
export default Instance;
