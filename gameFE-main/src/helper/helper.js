import { notification } from "antd";
export const makeRequest = async (
  loader,
  call,
  payload,
  onSuccess,
  onError
) => {
  loader(true);
  try {
    let res = await call(payload);
    if (res) {
      onSuccess(res, res);
    } else {
      if (onError) {
        onError(res.data, res);
      }
    }
  } catch (e) {
    if (onError) {
      onError(e.message, e);
    }
  }
  loader(false);
};
export const NOTIFICATION_TYPE = {
  INFO: "info",
  ERROR: "error",
  SUCCESS: "success",
  WARNING: "warning",
};
export const notify = (title, message, type = NOTIFICATION_TYPE.SUCCESS) => {
  var notificationObject = notification;
  notificationObject[type]({
    message: title,
    description: message,
  });
};
