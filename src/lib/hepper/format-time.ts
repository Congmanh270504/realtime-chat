/**
 * Chuyển đổi timestamp thành format giờ AM/PM
 * @param timestamp - Timestamp dạng number (milliseconds)
 * @returns Chuỗi thời gian format "HH:MM AM/PM"
 *
 * @example
 * formatTimestamp(1755672155254) // "09:30 PM"
 * formatTimestamp(Date.now()) // "02:15 AM"
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  // Lấy giờ và phút
  let hours = date.getHours();
  const minutes = date.getMinutes();

  // Xác định AM/PM
  const ampm = hours >= 12 ? "PM" : "AM";

  // Chuyển đổi sang format 12 giờ
  hours = hours % 12;
  hours = hours ? hours : 12; // Giờ 0 sẽ thành 12

  // Thêm số 0 đằng trước nếu phút < 10
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${hours}:${formattedMinutes} ${ampm}`;
}

/**
 * Kiểm tra xem có cần hiển thị divider thời gian giữa 2 tin nhắn không
 * @param currentTimestamp - Timestamp của tin nhắn hiện tại
 * @param previousTimestamp - Timestamp của tin nhắn trước đó (nếu có)
 * @returns Object chứa thông tin có cần hiển thị divider và nội dung
 */
export function shouldShowTimeDivider(
  currentTimestamp: number,
  previousTimestamp?: number
): { show: boolean; content?: string } {
  if (!previousTimestamp) {
    return { show: false };
  }

  const timeDiff = currentTimestamp - previousTimestamp;
  const fifteenMinutes = 15 * 60 * 1000; // 15 phút tính bằng milliseconds
  const oneDay = 24 * 60 * 60 * 1000; // 1 ngày tính bằng milliseconds

  // Nếu khoảng cách dưới 15 phút thì không hiển thị divider
  if (timeDiff < fifteenMinutes) {
    return { show: false };
  }

  // Nếu khoảng cách từ 15 phút đến 1 ngày thì hiển thị giờ
  if (timeDiff >= fifteenMinutes && timeDiff < oneDay) {
    return {
      show: true,
      content: formatTimestamp(currentTimestamp),
    };
  }

  // Nếu khoảng cách trên 1 ngày thì hiển thị ngày
  return {
    show: true,
    content: formatDate(currentTimestamp),
  };
}

/**
 * Chuyển đổi timestamp thành format ngày tháng
 * @param timestamp - Timestamp dạng number (milliseconds)
 * @returns Chuỗi ngày tháng format "DD/MM/YYYY"
 *
 * @example
 * formatDate(1755672155254) // "20/08/2025"
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);

  const day = date.getDate();
  const month = date.getMonth() + 1; // getMonth() trả về 0-11
  const year = date.getFullYear();

  // Thêm số 0 đằng trước nếu cần
  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedMonth = month < 10 ? `0${month}` : month;

  return `${formattedDay}/${formattedMonth}/${year}`;
}

/**
 * Chuyển đổi timestamp thành format đầy đủ
 * @param timestamp - Timestamp dạng number (milliseconds)
 * @returns Chuỗi thời gian đầy đủ format "DD/MM/YYYY HH:MM AM/PM"
 *
 * @example
 * formatFullDateTime(1755672155254) // "20/08/2025 09:30 PM"
 */
export function formatFullDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTimestamp(timestamp)}`;
}

/**
 * Chuyển đổi timestamp thành format tương đối (như Facebook/WhatsApp)
 * @param timestamp - Timestamp dạng number (milliseconds)
 * @returns Chuỗi thời gian tương đối
 *
 * @example
 * formatRelativeTime(Date.now() - 60000) // "1 minute ago"
 * formatRelativeTime(Date.now() - 3600000) // "1 hour ago"
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return formatDate(timestamp);
  } else if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}
