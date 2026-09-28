// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Use your machine's LAN IP, not localhost — a physical device/emulator
// // can't resolve "localhost" as your dev machine. Find yours with `ipconfig`.
// const BASE_URL = "http://192.168.1.X:8080/api";

// export const apiClient = axios.create({ baseURL: BASE_URL });

// apiClient.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("authToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
