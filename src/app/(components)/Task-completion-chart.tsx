
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
                                    backgroundColor: ["#4CAF50", "#4CAF50", "#4CAF50", "#4CAF50", "#4CAF50"],
                                    borderColor: ['#f3f4f6'],
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
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