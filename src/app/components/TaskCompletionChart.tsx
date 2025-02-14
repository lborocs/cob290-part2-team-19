"use client";
import React, { useEffect, useRef } from "react";
import { Task } from '@/interfaces/interfaces';

interface TaskCompletionChartProps {
    tasks: Task[];
}

const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ tasks }) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<any>(null);

    // Calculate labels for the past week ending on today
    const today = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const endDay = today.getDay();
    const labels = [...daysOfWeek.slice(endDay + 1), ...daysOfWeek.slice(0, endDay + 1)];

    useEffect(() => {
        const loadChart = () => {
            if (typeof window !== "undefined" && window.Chart) {
                const Chart = window.Chart;

                if (chartRef.current && !chartInstanceRef.current) {
                    // Filter tasks completed in the past week
                    const pastWeekTasks = tasks.filter(task => {
                        const completedDate = new Date(task.completed_date);
                        const diffTime = Math.abs(today.getTime() - completedDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 7 && task.completed;
                    });

                    // Count tasks completed each day
                    const taskCounts = Array(7).fill(0);
                    pastWeekTasks.forEach(task => {
                        const completedDate = new Date(task.completed_date);
                        const dayOfWeek = (completedDate.getDay() - endDay + 6) % 7; // Adjust dayOfWeek to match labels
                        taskCounts[dayOfWeek]++;
                        console.log(dayOfWeek);
                    });

                    chartInstanceRef.current = new Chart(chartRef.current, {
                        type: "bar",
                        data: {
                            labels: labels, // Use the calculated labels
                            datasets: [
                                {
                                    label: "Tasks Completed",
                                    data: taskCounts,
                                    backgroundColor: (ctx: any) => {
                                        const canvas = ctx.chart.ctx;
                                        const gradient = canvas.createLinearGradient(0, 0, 0, 400);
                                        gradient.addColorStop(0, "#4CAF50");
                                        gradient.addColorStop(1, "#2E7D32");
                                        return gradient;
                                    },
                                    borderColor: "#f3f4f6",
                                    borderWidth: 1.5,
                                    borderRadius: 5,
                                    hoverBackgroundColor: "#66bb6a",
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            font: {
                                size: 18,
                                weight: "bold",
                                family: "Inter, sans-serif"
                            },
                            color: "#333",
                            padding: 20,
                            plugins: {
                                legend: {
                                    display: false,
                                    position: "top",
                                    labels: {
                                        color: "#333",
                                        font: { size: 14, weight: "bold" },
                                    },
                                },
                                title: {
                                    display: true,
                                    text: "Tasks Completed Over the Week",
                                    font: {
                                        size: 15,
                                        weight: "bold",
                                        family: "Inter, sans-serif"
                                    },
                                    color: "#333",
                                    padding: 20
                                },
                                tooltip: {
                                    backgroundColor: "rgba(0,0,0,0.7)",
                                    titleColor: "#fff",
                                    bodyColor: "#ddd",
                                    bodyFont: { size: 13 },
                                    padding: 10,
                                    cornerRadius: 5,
                                    displayColors: false,
                                    callbacks: {
                                        title: (ctx: any) => '',
                                        label: (ctx: any) => ctx.raw,
                                    }
                                },
                            },
                            scales: {
                                x: {
                                    grid: { display: false },
                                    ticks: { color: "#555", font: { size: 13 } },
                                },
                                y: {
                                    grid: { color: "#e0e0e0", borderDash: [5, 5] },
                                    ticks: {
                                        color: "#555",
                                        font: { size: 13 },
                                        stepSize: 1, // Ensure step size is 1
                                        callback: function (value: number) {
                                            return Number.isInteger(value) ? value : null; // Show only integers
                                        }
                                    },
                                },
                            },
                        },
                    });
                }
            }
        };

        if (typeof window !== "undefined" && window.Chart) {
            loadChart();
        } else {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/chart.js";
            script.onload = loadChart;
            document.head.appendChild(script);
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [tasks]);

    return (
        <canvas ref={chartRef}></canvas>
    );
};

export default TaskCompletionChart;