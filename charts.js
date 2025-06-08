/**
 * Chart management for College Management System
 * Handles all chart creation and updates using Chart.js
 */

class ChartManager {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#f093fb',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        };
        
        // Set default Chart.js configuration
        this.setDefaultConfig();
    }

    /**
     * Set default Chart.js configuration
     */
    setDefaultConfig() {
        Chart.defaults.font.family = 'Inter, sans-serif';
        Chart.defaults.color = '#64748b';
        Chart.defaults.backgroundColor = 'rgba(102, 126, 234, 0.1)';
        Chart.defaults.borderColor = '#667eea';
        Chart.defaults.plugins.legend.display = true;
        Chart.defaults.plugins.legend.position = 'bottom';
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
        Chart.defaults.plugins.tooltip.bodyColor = '#ffffff';
    }

    /**
     * Create grade distribution chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} grades - Grade data
     */
    createGradeChart(canvasId, grades = []) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Process grade data
        const gradeDistribution = this.processGradeData(grades);
        
        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: gradeDistribution.labels,
                datasets: [{
                    data: gradeDistribution.data,
                    backgroundColor: [
                        this.colors.success,
                        this.colors.info,
                        this.colors.warning,
                        this.colors.error,
                        this.colors.secondary
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });

        return this.charts[canvasId];
    }

    /**
     * Create attendance trends chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} attendance - Attendance data
     */
    createAttendanceChart(canvasId, attendance = []) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Process attendance data
        const attendanceData = this.processAttendanceData(attendance);
        
        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: attendanceData.labels,
                datasets: [{
                    label: 'Attendance Rate (%)',
                    data: attendanceData.data,
                    borderColor: this.colors.primary,
                    backgroundColor: `${this.colors.primary}20`,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: (value) => `${value}%`,
                            maxTicksLimit: 6
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 7
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Attendance: ${context.parsed.y}%`
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    }
                }
            }
        });

        return this.charts[canvasId];
    }

    /**
     * Create student performance chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} students - Student data
     */
    createStudentPerformanceChart(canvasId, students = []) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Process student performance data
        const performanceData = this.processStudentPerformanceData(students);
        
        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: performanceData.labels,
                datasets: [{
                    label: 'GPA',
                    data: performanceData.data,
                    backgroundColor: this.colors.info,
                    borderColor: this.colors.info,
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 4.0,
                        ticks: {
                            stepSize: 0.5
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => `Student: ${context[0].label}`,
                            label: (context) => `GPA: ${context.parsed.y.toFixed(2)}`
                        }
                    }
                }
            }
        });

        return this.charts[canvasId];
    }

    /**
     * Create course enrollment chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} courses - Course data
     */
    createCourseEnrollmentChart(canvasId, courses = []) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Process course enrollment data
        const enrollmentData = this.processCourseEnrollmentData(courses);
        
        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: enrollmentData.labels,
                datasets: [{
                    label: 'Enrolled Students',
                    data: enrollmentData.data,
                    backgroundColor: this.colors.accent,
                    borderColor: this.colors.accent,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

        return this.charts[canvasId];
    }

    /**
     * Create monthly attendance chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} attendance - Monthly attendance data
     */
    createMonthlyAttendanceChart(canvasId, attendance = []) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Process monthly attendance data
        const monthlyData = this.processMonthlyAttendanceData(attendance);
        
        // Destroy existing chart if it exists
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Present',
                        data: monthlyData.presentData,
                        backgroundColor: this.colors.success,
                        borderRadius: 4
                    },
                    {
                        label: 'Absent',
                        data: monthlyData.absentData,
                        backgroundColor: this.colors.error,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });

        return this.charts[canvasId];
    }

    /**
     * Process grade data for chart
     * @param {Array} grades - Raw grade data
     * @returns {Object} Processed data
     */
    processGradeData(grades) {
        const gradeCount = {
            'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0
        };

        grades.forEach(grade => {
            const letterGrade = grade.grade ? grade.grade.charAt(0) : 'F';
            if (gradeCount.hasOwnProperty(letterGrade)) {
                gradeCount[letterGrade]++;
            }
        });

        return {
            labels: Object.keys(gradeCount),
            data: Object.values(gradeCount)
        };
    }

    /**
     * Process attendance data for chart
     * @param {Array} attendance - Raw attendance data
     * @returns {Object} Processed data
     */
    processAttendanceData(attendance) {
        // Generate last 7 days
        const labels = [];
        const data = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            labels.push(Utils.formatDate(date, 'short'));

            // Calculate attendance for this date
            const dayAttendance = attendance.filter(a => a.date === dateString);
            const presentCount = dayAttendance.filter(a => a.status === 'present').length;
            const totalCount = dayAttendance.length;
            const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
            
            data.push(Math.round(percentage));
        }

        return { labels, data };
    }

    /**
     * Process student performance data for chart
     * @param {Array} students - Student data
     * @returns {Object} Processed data
     */
    processStudentPerformanceData(students) {
        // Get top 10 students by GPA
        const studentsWithGPA = students
            .map(student => ({
                name: student.firstName + ' ' + student.lastName,
                gpa: parseFloat(student.gpa || 0)
            }))
            .sort((a, b) => b.gpa - a.gpa)
            .slice(0, 10);

        return {
            labels: studentsWithGPA.map(s => s.name),
            data: studentsWithGPA.map(s => s.gpa)
        };
    }

    /**
     * Process course enrollment data for chart
     * @param {Array} courses - Course data
     * @returns {Object} Processed data
     */
    processCourseEnrollmentData(courses) {
        return {
            labels: courses.map(course => course.name || course.title),
            data: courses.map(course => course.enrolled || 0)
        };
    }

    /**
     * Process monthly attendance data for chart
     * @param {Array} attendance - Attendance data
     * @returns {Object} Processed data
     */
    processMonthlyAttendanceData(attendance) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const presentData = new Array(12).fill(0);
        const absentData = new Array(12).fill(0);

        attendance.forEach(record => {
            const date = new Date(record.date);
            const month = date.getMonth();
            
            if (record.status === 'present') {
                presentData[month]++;
            } else {
                absentData[month]++;
            }
        });

        return {
            labels: months,
            presentData,
            absentData
        };
    }

    /**
     * Update chart data
     * @param {string} chartId - Chart ID
     * @param {Object} newData - New data
     */
    updateChart(chartId, newData) {
        const chart = this.charts[chartId];
        if (chart) {
            chart.data = newData;
            chart.update('active');
        }
    }

    /**
     * Destroy chart
     * @param {string} chartId - Chart ID
     */
    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartId => {
            this.destroyChart(chartId);
        });
    }

    /**
     * Resize all charts
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.resize();
        });
    }

    /**
     * Get chart colors
     * @returns {Object} Color palette
     */
    getColors() {
        return { ...this.colors };
    }

    /**
     * Generate gradient colors
     * @param {string} color1 - Start color
     * @param {string} color2 - End color
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {CanvasGradient} Gradient
     */
    createGradient(color1, color2, canvas) {
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    }
}

// Create global instance
window.chartManager = new ChartManager();
