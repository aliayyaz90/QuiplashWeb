import axios from "axios";
import Cookies from "js-cookie";

function getAxios(tocInstance, header) {
    const instance = axios.create({
        baseURL: process.env.REACT_APP_API_BASE_URL,
        headers: header ?
            header : {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
    });

    // Hooking a request interceptor
    // hookRequestInterceptorsWithAxiosInstance(instance, req);

    // Hooking a response interceptor
    // hookResponseInterceptorWithAxiosInstance(instance);

    const bearer = Cookies.get("token");
    if (bearer != undefined) {
        if (bearer) {
            instance.defaults.headers.common.Authorization = `Bearer ${bearer}`;
        } else {
            localStorage.clear();
            Cookies.remove("token");
            window.location.href = "/";
            // push toast message
            return;
        }
    }
    return instance;
}

function onAxiosRejected(error) {
    // handle exception failure.
    return error;
}

export const get = (uri, payload = null, tocInstance = true, req = false) =>
    getAxios(tocInstance, req)
        .get(uri, { params: payload })
        .then((res) => {
            return res.data;
        }, onAxiosRejected);

export const post = (uri, payload, tocInstance = true, req = false) =>
    getAxios(tocInstance, req)
        .post(uri, payload)
        .then((res) => {
            return res.data;
        }, onAxiosRejected);

export const postFd = (uri, payload, tocInstance = true) => {
    let header = {
        "Access-Control-Allow-Origin": "*",
        "content-type": "multipart/form-data",
    };
    return getAxios(tocInstance, header)
        .post(uri, payload)
        .then((res) => {
            return res.data;
        }, onAxiosRejected);
};

export const put = (uri, payload, tocInstance = true, req = false) =>
    getAxios(tocInstance, req)
        .put(uri, payload)
        .then((res) => {
            return res.data;
        }, onAxiosRejected);

export const del = (uri, tocInstance = true, req = false) =>
    getAxios(tocInstance, req)
        .delete(uri)
        .then((res) => {
            return res.data;
        }, onAxiosRejected);

export const delWithPayload = (uri, payload, tocInstance = true, req = false) =>
    getAxios(tocInstance, req)
        .delete(uri, { data: payload })
        .then((res) => {
            return res.data;
        }, onAxiosRejected);