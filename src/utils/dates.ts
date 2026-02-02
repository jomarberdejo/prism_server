import moment from "moment-timezone";

// Set default timezone to Asia/Manila
const DEFAULT_TIMEZONE = "Asia/Manila";

/**
 * Custom moment utility that defaults to Asia/Manila timezone
 * Assumes DB stores local Manila times
 */
class DateTimeUtil {
  private timezone: string;

  constructor(timezone: string = DEFAULT_TIMEZONE) {
    this.timezone = timezone;
  }

  /**
   * Parse a date stored in local Manila time
   */
  parse(date: string | Date | number) {
    // Treat the input as already in Manila time
    return moment.tz(date, this.timezone);
  }

  /**
   * Format date as "Month Day, Year" (e.g., "December 26, 2025")
   */
  formatDate(date: string | Date | number): string {
    return this.parse(date).format("MMMM D, YYYY");
  }

  formatTime(date: string | Date | number): string {
    return this.parse(date).format("h:mm A");
  }

  /**
   * Format date with time as "Month Day, Year at HH:MM AM/PM"
   */
  formatDateTime(date: string | Date | number): string {
    return this.parse(date).format("MMMM D, YYYY [at] h:mm A");
  }

  /**
   * Format date as short format "MMM D, YYYY" (e.g., "Dec 26, 2025")
   */
  formatDateShort(date: string | Date | number): string {
    return this.parse(date).format("MMM D, YYYY");
  }

  /**
   * Get relative time (e.g., "2 days ago", "in 3 hours")
   */
  fromNow(date: string | Date | number): string {
    return this.parse(date).fromNow();
  }

  /**
   * Get current date/time in Manila timezone
   */
  now() {
    return moment.tz(this.timezone);
  }

  /**
   * Custom format with any moment format string
   */
  format(date: string | Date | number, formatString: string): string {
    return this.parse(date).format(formatString);
  }
}

// Export singleton instance
export const dateTime = new DateTimeUtil();

// Export class for custom instances if needed
export default DateTimeUtil;
