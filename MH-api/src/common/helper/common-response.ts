export function commonResponse(message, data) {
  return {
    message: message,
    data: data,
  };
}

export function errorResponse(message, data) {
  return {
    message: message,
    data: data,
  };
}
