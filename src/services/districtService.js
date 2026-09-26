import { get, post } from "./api";

export const listDistricts = (params = {}) =>
  get("/api/districts/list.php", params);

export const createDistrict = (params = {}) =>
  post("/api/districts/create.php", params);