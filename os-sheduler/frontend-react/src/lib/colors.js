// deterministic colors per PID
const palette = [
  "#ff5252", "#ff9800", "#ffeb3b",
  "#8bc34a", "#4caf50", "#00bcd4",
  "#2196f3", "#3f51b5", "#9c27b0"
];

export function colorForPID(pid) {
  return palette[pid % palette.length];
}
