import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const API_ROOT = "http://192.168.0.102:8080"; // same host, no /api suffix
export const IMAGE_BASE_URL = API_ROOT;
const BASE_URL = `${API_ROOT}/api`;
export const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
