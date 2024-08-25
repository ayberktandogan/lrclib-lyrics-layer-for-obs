class Timestamp {
  public convertTimestampToMs(timestamp: string): number {
    // Remove the brackets
    const timeString = timestamp.replace(/\[|\]/g, '');

    // Split the time string into minutes, seconds, and milliseconds
    const [minutes, seconds] = timeString.split(':');
    const [sec, millis] = seconds.split('.');

    // Convert to milliseconds
    const minutesInMs = parseInt(minutes) * 60 * 1000; // Convert minutes to milliseconds
    const secondsInMs = parseInt(sec) * 1000; // Convert seconds to milliseconds
    const millisInMs = parseInt(millis); // Milliseconds

    // Return the total milliseconds
    return minutesInMs + secondsInMs + millisInMs;
  }
}

export default new Timestamp();
