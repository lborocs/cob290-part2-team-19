
"use client";
import React, { useEffect, useRef } from "react";

const TaskCompletionChart = () => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        const loadChart = () => {
            if (typeof window !== "undefined" && window.Chart) {
                const Chart = window.Chart;

                if (chartRef.current && !chartInstanceRef.current) {
                    chartInstanceRef.current = new Chart(chartRef.current, {
                        type: "bar",
                        data: {
                            labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                            datasets: [
                                {
                                    label: "Tasks Completed",
                                    data: [5, 8, 6, 7, 9],
                                    backgroundColor: (ctx : any) => {
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
                                    callbacks : {
                                        title: (ctx: any)=>'',
                                        label: (ctx: any)=>ctx.raw,
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
                                    ticks: { color: "#555", font: { size: 13 } },
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
    }, []);

    return (
        <canvas ref={chartRef}></canvas>
    );
};

export default TaskCompletionChart;