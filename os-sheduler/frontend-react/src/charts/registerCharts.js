import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

export default function registerChartsOnce() {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
  );

  // 🔥 GLOBAL DARK THEME DEFAULTS
  ChartJS.defaults.color = "#ffffff";                       // text color
  ChartJS.defaults.borderColor = "rgba(255,255,255,0.25)";  // grid & border lines
  ChartJS.defaults.backgroundColor = "rgba(0,150,255,0.4)"; // fallback bg
}
