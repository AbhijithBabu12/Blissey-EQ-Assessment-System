import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChart({ data }) {
  const chartData = {
    labels: data.map(d => d.subject),
    datasets: [
      {
        label: 'EQ Score',
        data: data.map(d => d.A),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(16, 185, 129, 0.9)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 17, 17, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(16, 185, 129, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Score: ${context.raw}/100`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          stepSize: 20
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            family: "'Inter', 'Segoe UI', sans-serif",
            size: 12,
            weight: '500'
          },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false
        },
        grid: {
          display: false,
          drawBorder: false,
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart'
    }
  };

  return <Bar data={chartData} options={options} />;
}
