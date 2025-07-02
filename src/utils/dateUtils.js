// src/utils/dateUtils.js
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateShort = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleTimeString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate2 = (dateString) => {
  // Cắt phần microseconds (chỉ lấy đến 3 chữ số sau dấu .)
  const trimmedDateString = dateString.replace(
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d{3})\d+$/,
    "$1.$2"
  );

  const date = new Date(trimmedDateString);

  if (isNaN(date.getTime())) return "Invalid Date";

  // Chuyển sang múi giờ Việt Nam (+07:00)
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  // Format theo kiểu: dd/MM/yyyy HH:mm:ss
  const day = String(vnDate.getDate()).padStart(2, "0");
  const month = String(vnDate.getMonth() + 1).padStart(2, "0"); // tháng bắt đầu từ 0
  const year = vnDate.getFullYear();
  const hours = String(vnDate.getHours()).padStart(2, "0");
  const minutes = String(vnDate.getMinutes()).padStart(2, "0");
  const seconds = String(vnDate.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
