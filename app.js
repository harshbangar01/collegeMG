/**
 * Main Application Controller for College Management System
 * Handles navigation, UI interactions, data management, and form processing
 * Author: Harsh Bangar
 */

class CollegeManagementApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.isSidebarCollapsed = false;
        this.isMobileView = window.innerWidth <= 768;
        this.searchDebounceTimer = null;
        this.currentModal = null;
        this.toastContainer = null;
        
        // Initialize app
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    /**
     * Initialize app after DOM is ready
     */
    initializeApp() {
        this.setupEventListeners();
        this.initializeUI();
        this.loadInitialData();
        
        // Hide loading screen after initialization
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 1000);
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Sidebar navigation
        document.addEventListener('click', (e) => {
            // Menu item clicks
            if (e.target.closest('.menu-item')) {
                const menuItem = e.target.closest('.menu-item');
                const page = menuItem.dataset.page;
                if (page) {
                    this.navigateToPage(page);
                }
            }

            // Sidebar toggle
            if (e.target.closest('#sidebar-toggle') || e.target.closest('#mobile-menu-btn')) {
                this.toggleSidebar();
            }

            // Modal close
            if (e.target.closest('.modal-close') || e.target.classList.contains('modal')) {
                this.closeModal();
            }

            // Button actions
            this.handleButtonClicks(e);
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(e);
        });

        // Global search
        const globalSearch = document.getElementById('global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }

    /**
     * Handle button clicks
     */
    handleButtonClicks(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.id || button.dataset.action;
        
        switch (action) {
            case 'add-student-btn':
                this.showStudentForm();
                break;
            case 'add-course-btn':
                this.showCourseForm();
                break;
            case 'add-faculty-btn':
                this.showFacultyForm();
                break;
            case 'add-grade-btn':
                this.showGradeForm();
                break;
            case 'mark-attendance-btn':
                this.showAttendanceForm();
                break;
            case 'add-schedule-btn':
                this.showScheduleForm();
                break;
            case 'prev-month':
                this.changeCalendarMonth(-1);
                break;
            case 'next-month':
                this.changeCalendarMonth(1);
                break;
            default:
                if (action && action.startsWith('edit-')) {
                    this.handleEditAction(action, button);
                } else if (action && action.startsWith('delete-')) {
                    this.handleDeleteAction(action, button);
                }
        }
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        this.toastContainer = document.getElementById('toast-container');
        this.updatePageTitle('Dashboard');
        this.initializeFilters();
        this.initializeCalendar();
        this.handleResize();
    }

    /**
     * Load initial data and update UI
     */
    loadInitialData() {
        this.updateDashboardStats();
        this.updateStudentsTable();
        this.updateCoursesGrid();
        this.updateFacultyGrid();
        this.updateGradesTable();
        this.updateScheduleGrid();
        this.initializeCharts();
    }

    /**
     * Navigate to a specific page
     */
    navigateToPage(pageName) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            this.updatePageTitle(Utils.toTitleCase(pageName));
            
            // Load page-specific data
            this.loadPageData(pageName);
        }

        // Close sidebar on mobile after navigation
        if (this.isMobileView) {
            this.closeSidebar();
        }
    }

    /**
     * Load data for specific page
     */
    loadPageData(pageName) {
        switch (pageName) {
            case 'dashboard':
                this.updateDashboardStats();
                this.updateDashboardCharts();
                break;
            case 'students':
                this.updateStudentsTable();
                break;
            case 'courses':
                this.updateCoursesGrid();
                break;
            case 'faculty':
                this.updateFacultyGrid();
                break;
            case 'grades':
                this.updateGradesTable();
                break;
            case 'attendance':
                this.updateAttendanceCalendar();
                this.updateAttendanceStats();
                break;
            case 'schedule':
                this.updateScheduleGrid();
                break;
        }
    }

    /**
     * Update page title
     */
    updatePageTitle(title) {
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = title;
        }
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        if (this.isMobileView) {
            sidebar.classList.toggle('open');
        } else {
            sidebar.classList.toggle('collapsed');
            this.isSidebarCollapsed = sidebar.classList.contains('collapsed');
        }
    }

    /**
     * Close sidebar (mobile)
     */
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('open');
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const wasMobile = this.isMobileView;
        this.isMobileView = window.innerWidth <= 768;
        
        // Handle mobile/desktop transition
        if (wasMobile !== this.isMobileView) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('open', 'collapsed');
            
            if (!this.isMobileView && this.isSidebarCollapsed) {
                sidebar.classList.add('collapsed');
            }
        }

        // Resize charts
        if (window.chartManager) {
            window.chartManager.resizeCharts();
        }
    }

    /**
     * Show modal with content
     */
    showModal(title, content, className = '') {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = title;
            modalBody.innerHTML = content;
            modal.className = `modal ${className}`;
            modal.classList.add('active');
            this.currentModal = modal;
            
            // Focus first input
            const firstInput = modalBody.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('active');
            this.currentModal = null;
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 5000) {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close event
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });

        this.toastContainer.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    /**
     * Get toast icon based on type
     */
    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove toast
     */
    removeToast(toast) {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats() {
        const stats = storageManager.getStatistics();
        
        document.getElementById('total-students').textContent = stats.totalStudents;
        document.getElementById('total-courses').textContent = stats.totalCourses;
        document.getElementById('total-faculty').textContent = stats.totalFaculty;
        document.getElementById('avg-attendance').textContent = `${stats.avgAttendance}%`;
    }

    /**
     * Update dashboard charts
     */
    updateDashboardCharts() {
        const grades = storageManager.getGrades();
        const attendance = storageManager.getAttendance();
        
        window.chartManager.createGradeChart('gradeChart', grades);
        window.chartManager.createAttendanceChart('attendanceChart', attendance);
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        this.updateDashboardCharts();
    }

    /**
     * Update students table
     */
    updateStudentsTable() {
        const students = storageManager.getStudents();
        const tbody = document.getElementById('students-tbody');
        
        if (!tbody) return;

        if (students.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="7">No students found. Click "Add Student" to get started.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = students.map(student => {
            const gpa = storageManager.calculateGPA(student.id);
            return `
                <tr>
                    <td>${student.studentId || student.id}</td>
                    <td>${student.firstName} ${student.lastName}</td>
                    <td>${student.email}</td>
                    <td>${student.department}</td>
                    <td>${student.year || 'N/A'}</td>
                    <td>${gpa}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" data-action="edit-student" data-id="${student.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-error" data-action="delete-student" data-id="${student.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Update courses grid
     */
    updateCoursesGrid() {
        const courses = storageManager.getCourses();
        const grid = document.getElementById('courses-grid');
        
        if (!grid) return;

        if (courses.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-card">
                    <i class="fas fa-book"></i>
                    <h3>No Courses Available</h3>
                    <p>Click "Add Course" to create your first course.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = courses.map(course => `
            <div class="course-card">
                <h4>${course.name}</h4>
                <p><strong>Code:</strong> ${course.code}</p>
                <p><strong>Department:</strong> ${course.department}</p>
                <p><strong>Credits:</strong> ${course.credits}</p>
                <p><strong>Instructor:</strong> ${course.instructor || 'TBA'}</p>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" data-action="edit-course" data-id="${course.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-error" data-action="delete-course" data-id="${course.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update faculty grid
     */
    updateFacultyGrid() {
        const faculty = storageManager.getFaculty();
        const grid = document.getElementById('faculty-grid');
        
        if (!grid) return;

        if (faculty.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-card">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <h3>No Faculty Members</h3>
                    <p>Click "Add Faculty" to add your first faculty member.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = faculty.map(member => `
            <div class="faculty-card">
                <h4>${member.firstName} ${member.lastName}</h4>
                <p><strong>Department:</strong> ${member.department}</p>
                <p><strong>Position:</strong> ${member.position || 'Faculty'}</p>
                <p><strong>Email:</strong> ${member.email}</p>
                <p><strong>Phone:</strong> ${member.phone || 'N/A'}</p>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" data-action="edit-faculty" data-id="${member.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-error" data-action="delete-faculty" data-id="${member.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update grades table
     */
    updateGradesTable() {
        const grades = storageManager.getGrades();
        const students = storageManager.getStudents();
        const courses = storageManager.getCourses();
        const tbody = document.getElementById('grades-tbody');
        
        if (!tbody) return;

        if (grades.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="6">No grades recorded. Click "Add Grade" to start grading.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = grades.map(grade => {
            const student = students.find(s => s.id === grade.studentId);
            const course = courses.find(c => c.id === grade.courseId);
            
            return `
                <tr>
                    <td>${student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}</td>
                    <td>${course ? course.name : 'Unknown Course'}</td>
                    <td>${grade.assignment}</td>
                    <td><span class="grade-badge">${grade.grade}</span></td>
                    <td>${Utils.formatDate(grade.date)}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" data-action="edit-grade" data-id="${grade.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-error" data-action="delete-grade" data-id="${grade.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Initialize calendar
     */
    initializeCalendar() {
        this.currentCalendarDate = new Date();
        this.updateAttendanceCalendar();
    }

    /**
     * Update attendance calendar
     */
    updateAttendanceCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const currentMonth = document.getElementById('current-month');
        
        if (!calendarGrid || !currentMonth) return;

        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        currentMonth.textContent = `${Utils.getMonthName(month)} ${year}`;
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = Utils.getDaysInMonth(year, month);
        
        // Generate calendar days
        let calendarHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            calendarHTML += `<div class="calendar-header-day">${day}</div>`;
        });
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of month
        const today = new Date();
        const attendance = storageManager.getAttendance();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const isToday = date.toDateString() === today.toDateString();
            const hasAttendance = attendance.some(a => a.date === dateString);
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasAttendance ? 'has-attendance' : ''}" 
                     data-date="${dateString}">
                    ${day}
                </div>
            `;
        }
        
        calendarGrid.innerHTML = calendarHTML;
    }

    /**
     * Change calendar month
     */
    changeCalendarMonth(direction) {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + direction);
        this.updateAttendanceCalendar();
    }

    /**
     * Update attendance statistics
     */
    updateAttendanceStats() {
        const today = new Date().toISOString().split('T')[0];
        const thisWeek = this.getWeekDates();
        const thisMonth = this.getMonthDates();
        
        const attendance = storageManager.getAttendance();
        
        // Today's attendance
        const todayAttendance = attendance.filter(a => a.date === today);
        const todayPresent = todayAttendance.filter(a => a.status === 'present').length;
        const todayPercentage = todayAttendance.length > 0 ? (todayPresent / todayAttendance.length * 100).toFixed(0) : 0;
        
        // Week attendance
        const weekAttendance = attendance.filter(a => thisWeek.includes(a.date));
        const weekPresent = weekAttendance.filter(a => a.status === 'present').length;
        const weekPercentage = weekAttendance.length > 0 ? (weekPresent / weekAttendance.length * 100).toFixed(0) : 0;
        
        // Month attendance
        const monthAttendance = attendance.filter(a => thisMonth.includes(a.date));
        const monthPresent = monthAttendance.filter(a => a.status === 'present').length;
        const monthPercentage = monthAttendance.length > 0 ? (monthPresent / monthAttendance.length * 100).toFixed(0) : 0;
        
        document.getElementById('today-attendance').textContent = `${todayPercentage}%`;
        document.getElementById('week-attendance').textContent = `${weekPercentage}%`;
        document.getElementById('month-attendance').textContent = `${monthPercentage}%`;
    }

    /**
     * Get week dates
     */
    getWeekDates() {
        const today = new Date();
        const weekDates = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            weekDates.push(date.toISOString().split('T')[0]);
        }
        
        return weekDates;
    }

    /**
     * Get month dates
     */
    getMonthDates() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = Utils.getDaysInMonth(year, month);
        const monthDates = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            monthDates.push(date.toISOString().split('T')[0]);
        }
        
        return monthDates;
    }

    /**
     * Update schedule grid
     */
    updateScheduleGrid() {
        const schedule = storageManager.getSchedule();
        const courses = storageManager.getCourses();
        const faculty = storageManager.getFaculty();
        
        // Clear existing schedule items
        document.querySelectorAll('.schedule-item').forEach(item => item.remove());
        
        schedule.forEach(item => {
            const course = courses.find(c => c.id === item.courseId);
            const instructor = faculty.find(f => f.id === item.instructorId);
            const slotsContainer = document.getElementById(`${item.day}-slots`);
            
            if (slotsContainer && course) {
                const scheduleElement = document.createElement('div');
                scheduleElement.className = 'schedule-item';
                scheduleElement.style.top = this.calculateSchedulePosition(item.startTime);
                scheduleElement.style.height = this.calculateScheduleDuration(item.startTime, item.endTime);
                
                scheduleElement.innerHTML = `
                    <div class="schedule-course">${course.name}</div>
                    <div class="schedule-time">${Utils.formatTime(item.startTime)} - ${Utils.formatTime(item.endTime)}</div>
                    <div class="schedule-instructor">${instructor ? `${instructor.firstName} ${instructor.lastName}` : 'TBA'}</div>
                `;
                
                scheduleElement.addEventListener('click', () => {
                    this.showScheduleForm(item);
                });
                
                slotsContainer.appendChild(scheduleElement);
            }
        });
    }

    /**
     * Calculate schedule position based on time
     */
    calculateSchedulePosition(time) {
        const [hours, minutes] = time.split(':').map(Number);
        const startHour = 8; // 8 AM
        const totalMinutes = (hours - startHour) * 60 + minutes;
        const pixelsPerMinute = 60 / 60; // 60px per hour
        return `${totalMinutes * pixelsPerMinute}px`;
    }

    /**
     * Calculate schedule duration
     */
    calculateScheduleDuration(startTime, endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        const durationMinutes = endTotalMinutes - startTotalMinutes;
        
        const pixelsPerMinute = 60 / 60; // 60px per hour
        return `${durationMinutes * pixelsPerMinute}px`;
    }

    /**
     * Initialize filters
     */
    initializeFilters() {
        // Setup search filters
        this.setupSearchFilter('student-search', () => this.filterStudents());
        this.setupSearchFilter('course-search', () => this.filterCourses());
        this.setupSearchFilter('faculty-search', () => this.filterFaculty());
        this.setupSearchFilter('grade-search', () => this.filterGrades());
        
        // Setup dropdown filters
        this.setupDropdownFilters();
    }

    /**
     * Setup search filter with debouncing
     */
    setupSearchFilter(inputId, callback) {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', Utils.debounce(callback, 300));
        }
    }

    /**
     * Setup dropdown filters
     */
    setupDropdownFilters() {
        // Populate department filters
        this.populateDepartmentFilters();
        
        // Populate course and student filters for grades
        this.populateGradeFilters();
    }

    /**
     * Populate department filters
     */
    populateDepartmentFilters() {
        const courses = storageManager.getCourses();
        const departments = [...new Set(courses.map(c => c.department))].filter(Boolean);
        
        const filters = ['student-filter', 'course-filter', 'faculty-filter'];
        filters.forEach(filterId => {
            const select = document.getElementById(filterId);
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '<option value="">All Departments</option>';
                departments.forEach(dept => {
                    select.innerHTML += `<option value="${dept}">${dept}</option>`;
                });
                select.value = currentValue;
                
                select.addEventListener('change', () => {
                    switch (filterId) {
                        case 'student-filter':
                            this.filterStudents();
                            break;
                        case 'course-filter':
                            this.filterCourses();
                            break;
                        case 'faculty-filter':
                            this.filterFaculty();
                            break;
                    }
                });
            }
        });
    }

    /**
     * Populate grade filters
     */
    populateGradeFilters() {
        const courses = storageManager.getCourses();
        const students = storageManager.getStudents();
        
        // Course filter
        const courseFilter = document.getElementById('grade-course-filter');
        if (courseFilter) {
            courseFilter.innerHTML = '<option value="">All Courses</option>';
            courses.forEach(course => {
                courseFilter.innerHTML += `<option value="${course.id}">${course.name}</option>`;
            });
            courseFilter.addEventListener('change', () => this.filterGrades());
        }
        
        // Student filter
        const studentFilter = document.getElementById('grade-student-filter');
        if (studentFilter) {
            studentFilter.innerHTML = '<option value="">All Students</option>';
            students.forEach(student => {
                studentFilter.innerHTML += `<option value="${student.id}">${student.firstName} ${student.lastName}</option>`;
            });
            studentFilter.addEventListener('change', () => this.filterGrades());
        }
    }

    /**
     * Filter students
     */
    filterStudents() {
        const searchTerm = document.getElementById('student-search')?.value || '';
        const department = document.getElementById('student-filter')?.value || '';
        
        let students = storageManager.getStudents();
        
        if (searchTerm) {
            students = Utils.searchObjects(students, searchTerm, ['firstName', 'lastName', 'email', 'studentId']);
        }
        
        if (department) {
            students = students.filter(s => s.department === department);
        }
        
        this.renderFilteredStudents(students);
    }

    /**
     * Filter courses
     */
    filterCourses() {
        const searchTerm = document.getElementById('course-search')?.value || '';
        const department = document.getElementById('course-filter')?.value || '';
        
        let courses = storageManager.getCourses();
        
        if (searchTerm) {
            courses = Utils.searchObjects(courses, searchTerm, ['name', 'code', 'instructor']);
        }
        
        if (department) {
            courses = courses.filter(c => c.department === department);
        }
        
        this.renderFilteredCourses(courses);
    }

    /**
     * Filter faculty
     */
    filterFaculty() {
        const searchTerm = document.getElementById('faculty-search')?.value || '';
        const department = document.getElementById('faculty-filter')?.value || '';
        
        let faculty = storageManager.getFaculty();
        
        if (searchTerm) {
            faculty = Utils.searchObjects(faculty, searchTerm, ['firstName', 'lastName', 'email', 'position']);
        }
        
        if (department) {
            faculty = faculty.filter(f => f.department === department);
        }
        
        this.renderFilteredFaculty(faculty);
    }

    /**
     * Filter grades
     */
    filterGrades() {
        const searchTerm = document.getElementById('grade-search')?.value || '';
        const courseId = document.getElementById('grade-course-filter')?.value || '';
        const studentId = document.getElementById('grade-student-filter')?.value || '';
        
        let grades = storageManager.getGrades();
        
        if (courseId) {
            grades = grades.filter(g => g.courseId === courseId);
        }
        
        if (studentId) {
            grades = grades.filter(g => g.studentId === studentId);
        }
        
        if (searchTerm) {
            grades = Utils.searchObjects(grades, searchTerm, ['assignment', 'grade']);
        }
        
        this.renderFilteredGrades(grades);
    }

    /**
     * Render filtered students
     */
    renderFilteredStudents(students) {
        const tbody = document.getElementById('students-tbody');
        if (!tbody) return;
        
        if (students.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="7">No students match your search criteria.</td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = students.map(student => {
            const gpa = storageManager.calculateGPA(student.id);
            return `
                <tr>
                    <td>${student.studentId || student.id}</td>
                    <td>${student.firstName} ${student.lastName}</td>
                    <td>${student.email}</td>
                    <td>${student.department}</td>
                    <td>${student.year || 'N/A'}</td>
                    <td>${gpa}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" data-action="edit-student" data-id="${student.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-error" data-action="delete-student" data-id="${student.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Render filtered courses
     */
    renderFilteredCourses(courses) {
        const grid = document.getElementById('courses-grid');
        if (!grid) return;
        
        if (courses.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-card">
                    <i class="fas fa-search"></i>
                    <h3>No courses match your search</h3>
                    <p>Try adjusting your search criteria.</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = courses.map(course => `
            <div class="course-card">
                <h4>${course.name}</h4>
                <p><strong>Code:</strong> ${course.code}</p>
                <p><strong>Department:</strong> ${course.department}</p>
                <p><strong>Credits:</strong> ${course.credits}</p>
                <p><strong>Instructor:</strong> ${course.instructor || 'TBA'}</p>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" data-action="edit-course" data-id="${course.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-error" data-action="delete-course" data-id="${course.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render filtered faculty
     */
    renderFilteredFaculty(faculty) {
        const grid = document.getElementById('faculty-grid');
        if (!grid) return;
        
        if (faculty.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-card">
                    <i class="fas fa-search"></i>
                    <h3>No faculty match your search</h3>
                    <p>Try adjusting your search criteria.</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = faculty.map(member => `
            <div class="faculty-card">
                <h4>${member.firstName} ${member.lastName}</h4>
                <p><strong>Department:</strong> ${member.department}</p>
                <p><strong>Position:</strong> ${member.position || 'Faculty'}</p>
                <p><strong>Email:</strong> ${member.email}</p>
                <p><strong>Phone:</strong> ${member.phone || 'N/A'}</p>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" data-action="edit-faculty" data-id="${member.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-error" data-action="delete-faculty" data-id="${member.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render filtered grades
     */
    renderFilteredGrades(grades) {
        const tbody = document.getElementById('grades-tbody');
        const students = storageManager.getStudents();
        const courses = storageManager.getCourses();
        
        if (!tbody) return;
        
        if (grades.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="6">No grades match your search criteria.</td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = grades.map(grade => {
            const student = students.find(s => s.id === grade.studentId);
            const course = courses.find(c => c.id === grade.courseId);
            
            return `
                <tr>
                    <td>${student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}</td>
                    <td>${course ? course.name : 'Unknown Course'}</td>
                    <td>${grade.assignment}</td>
                    <td><span class="grade-badge">${grade.grade}</span></td>
                    <td>${Utils.formatDate(grade.date)}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" data-action="edit-grade" data-id="${grade.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-error" data-action="delete-grade" data-id="${grade.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Handle global search
     */
    handleGlobalSearch(query) {
        if (!query.trim()) return;
        
        // Search across all entities
        const students = Utils.searchObjects(storageManager.getStudents(), query, ['firstName', 'lastName', 'email']);
        const courses = Utils.searchObjects(storageManager.getCourses(), query, ['name', 'code']);
        const faculty = Utils.searchObjects(storageManager.getFaculty(), query, ['firstName', 'lastName', 'email']);
        
        // For now, just show a toast with results count
        const totalResults = students.length + courses.length + faculty.length;
        this.showToast(`Found ${totalResults} results for "${query}"`, 'info');
    }

    /**
     * Show student form
     */
    showStudentForm(student = null) {
        const isEdit = student !== null;
        const title = isEdit ? 'Edit Student' : 'Add New Student';
        
        const form = `
            <form id="student-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">First Name *</label>
                        <input type="text" name="firstName" class="form-input" value="${student?.firstName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Last Name *</label>
                        <input type="text" name="lastName" class="form-input" value="${student?.lastName || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" name="email" class="form-input" value="${student?.email || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Student ID</label>
                    <input type="text" name="studentId" class="form-input" value="${student?.studentId || ''}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Department *</label>
                        <select name="department" class="form-select" required>
                            <option value="">Select Department</option>
                            <option value="Computer Science" ${student?.department === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                            <option value="Information Technology" ${student?.department === 'Information Technology' ? 'selected' : ''}>Information Technology</option>
                            <option value="Mechanical Engineering" ${student?.department === 'Mechanical Engineering' ? 'selected' : ''}>Mechanical Engineering</option>
                            <option value="Civil Engineering" ${student?.department === 'Civil Engineering' ? 'selected' : ''}>Civil Engineering</option>
                            <option value="Electrical Engineering" ${student?.department === 'Electrical Engineering' ? 'selected' : ''}>Electrical Engineering</option>
                            <option value="Electronics and Communication Engineering" ${student?.department === 'Electronics and Communication Engineering' ? 'selected' : ''}>Electronics and Communication Engineering</option>
                            <option value="Electronics and Communication Engineering" ${student?.department === 'Electronics and Communication Engineering' ? 'selected' : ''}>Electronics and Communication Engineering</option>
                            <option value="Chemical Engineering" ${student?.department === 'Chemical Engineering' ? 'selected' : ''}>Chemical Engineering</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Year</label>
                        <select name="year" class="form-select">
                            <option value="">Select Year</option>
                            <option value="1" ${student?.year === '1' ? 'selected' : ''}>1st Year</option>
                            <option value="2" ${student?.year === '2' ? 'selected' : ''}>2nd Year</option>
                            <option value="3" ${student?.year === '3' ? 'selected' : ''}>3rd Year</option>
                            <option value="4" ${student?.year === '4' ? 'selected' : ''}>4th Year</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <input type="tel" name="phone" class="form-input" value="${student?.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date of Birth</label>
                        <input type="date" name="dateOfBirth" class="form-input" value="${student?.dateOfBirth || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Address</label>
                    <textarea name="address" class="form-textarea" rows="3">${student?.address || ''}</textarea>
                </div>
                ${isEdit ? `<input type="hidden" name="id" value="${student.id}">` : ''}
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Save'} Student
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(title, form);
    }

    /**
     * Show course form
     */
    showCourseForm(course = null) {
        const isEdit = course !== null;
        const title = isEdit ? 'Edit Course' : 'Add New Course';
        const faculty = storageManager.getFaculty();
        
        const form = `
            <form id="course-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Course Name *</label>
                        <input type="text" name="name" class="form-input" value="${course?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Course Code *</label>
                        <input type="text" name="code" class="form-input" value="${course?.code || ''}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Department *</label>
                        <select name="department" class="form-select" required>
                            <option value="">Select Department</option>
                            <option value="Computer Science" ${course?.department === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                            <option value="Mathematics" ${course?.department === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                            <option value="Physics" ${course?.department === 'Physics' ? 'selected' : ''}>Physics</option>
                            <option value="Chemistry" ${course?.department === 'Chemistry' ? 'selected' : ''}>Chemistry</option>
                            <option value="Biology" ${course?.department === 'Biology' ? 'selected' : ''}>Biology</option>
                            <option value="English" ${course?.department === 'English' ? 'selected' : ''}>English</option>
                            <option value="History" ${course?.department === 'History' ? 'selected' : ''}>History</option>
                            <option value="Psychology" ${course?.department === 'Psychology' ? 'selected' : ''}>Psychology</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Credits *</label>
                        <select name="credits" class="form-select" required>
                            <option value="">Select Credits</option>
                            <option value="1" ${course?.credits === '1' ? 'selected' : ''}>1 Credit</option>
                            <option value="2" ${course?.credits === '2' ? 'selected' : ''}>2 Credits</option>
                            <option value="3" ${course?.credits === '3' ? 'selected' : ''}>3 Credits</option>
                            <option value="4" ${course?.credits === '4' ? 'selected' : ''}>4 Credits</option>
                            <option value="5" ${course?.credits === '5' ? 'selected' : ''}>5 Credits</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Instructor</label>
                    <select name="instructorId" class="form-select">
                        <option value="">Select Instructor</option>
                        ${faculty.map(f => `
                            <option value="${f.id}" ${course?.instructorId === f.id ? 'selected' : ''}>
                                ${f.firstName} ${f.lastName}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea name="description" class="form-textarea" rows="4">${course?.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Semester</label>
                        <select name="semester" class="form-select">
                            <option value="">Select Semester</option>
                            <option value="Fall" ${course?.semester === 'Fall' ? 'selected' : ''}>Fall</option>
                            <option value="Spring" ${course?.semester === 'Spring' ? 'selected' : ''}>Spring</option>
                            <option value="Summer" ${course?.semester === 'Summer' ? 'selected' : ''}>Summer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Academic Year</label>
                        <input type="text" name="academicYear" class="form-input" value="${course?.academicYear || Utils.getCurrentAcademicYear()}" placeholder="2023-2024">
                    </div>
                </div>
                ${isEdit ? `<input type="hidden" name="id" value="${course.id}">` : ''}
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Save'} Course
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(title, form);
    }

    /**
     * Show faculty form
     */
    showFacultyForm(faculty = null) {
        const isEdit = faculty !== null;
        const title = isEdit ? 'Edit Faculty' : 'Add New Faculty';
        
        const form = `
            <form id="faculty-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">First Name *</label>
                        <input type="text" name="firstName" class="form-input" value="${faculty?.firstName || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Last Name *</label>
                        <input type="text" name="lastName" class="form-input" value="${faculty?.lastName || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input type="email" name="email" class="form-input" value="${faculty?.email || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Department *</label>
                        <select name="department" class="form-select" required>
                            <option value="">Select Department</option>
                            <option value="Computer Science" ${faculty?.department === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                            <option value="Mathematics" ${faculty?.department === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                            <option value="Physics" ${faculty?.department === 'Physics' ? 'selected' : ''}>Physics</option>
                            <option value="Chemistry" ${faculty?.department === 'Chemistry' ? 'selected' : ''}>Chemistry</option>
                            <option value="Biology" ${faculty?.department === 'Biology' ? 'selected' : ''}>Biology</option>
                            <option value="English" ${faculty?.department === 'English' ? 'selected' : ''}>English</option>
                            <option value="History" ${faculty?.department === 'History' ? 'selected' : ''}>History</option>
                            <option value="Psychology" ${faculty?.department === 'Psychology' ? 'selected' : ''}>Psychology</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Position</label>
                        <select name="position" class="form-select">
                            <option value="">Select Position</option>
                            <option value="Professor" ${faculty?.position === 'Professor' ? 'selected' : ''}>Professor</option>
                            <option value="Associate Professor" ${faculty?.position === 'Associate Professor' ? 'selected' : ''}>Associate Professor</option>
                            <option value="Assistant Professor" ${faculty?.position === 'Assistant Professor' ? 'selected' : ''}>Assistant Professor</option>
                            <option value="Lecturer" ${faculty?.position === 'Lecturer' ? 'selected' : ''}>Lecturer</option>
                            <option value="Instructor" ${faculty?.position === 'Instructor' ? 'selected' : ''}>Instructor</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <input type="tel" name="phone" class="form-input" value="${faculty?.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Employee ID</label>
                        <input type="text" name="employeeId" class="form-input" value="${faculty?.employeeId || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Hire Date</label>
                        <input type="date" name="hireDate" class="form-input" value="${faculty?.hireDate || ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Office</label>
                        <input type="text" name="office" class="form-input" value="${faculty?.office || ''}" placeholder="e.g., Room 201">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Qualifications</label>
                    <textarea name="qualifications" class="form-textarea" rows="3">${faculty?.qualifications || ''}</textarea>
                </div>
                ${isEdit ? `<input type="hidden" name="id" value="${faculty.id}">` : ''}
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Save'} Faculty
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(title, form);
    }

    /**
     * Show grade form
     */
    showGradeForm(grade = null) {
        const isEdit = grade !== null;
        const title = isEdit ? 'Edit Grade' : 'Add New Grade';
        const students = storageManager.getStudents();
        const courses = storageManager.getCourses();
        
        const form = `
            <form id="grade-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Student *</label>
                        <select name="studentId" class="form-select" required>
                            <option value="">Select Student</option>
                            ${students.map(s => `
                                <option value="${s.id}" ${grade?.studentId === s.id ? 'selected' : ''}>
                                    ${s.firstName} ${s.lastName}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Course *</label>
                        <select name="courseId" class="form-select" required>
                            <option value="">Select Course</option>
                            ${courses.map(c => `
                                <option value="${c.id}" ${grade?.courseId === c.id ? 'selected' : ''}>
                                    ${c.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Assignment *</label>
                        <input type="text" name="assignment" class="form-input" value="${grade?.assignment || ''}" required placeholder="e.g., Midterm Exam">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Grade *</label>
                        <select name="grade" class="form-select" required>
                            <option value="">Select Grade</option>
                            <option value="A+" ${grade?.grade === 'A+' ? 'selected' : ''}>A+</option>
                            <option value="A" ${grade?.grade === 'A' ? 'selected' : ''}>A</option>
                            <option value="A-" ${grade?.grade === 'A-' ? 'selected' : ''}>A-</option>
                            <option value="B+" ${grade?.grade === 'B+' ? 'selected' : ''}>B+</option>
                            <option value="B" ${grade?.grade === 'B' ? 'selected' : ''}>B</option>
                            <option value="B-" ${grade?.grade === 'B-' ? 'selected' : ''}>B-</option>
                            <option value="C+" ${grade?.grade === 'C+' ? 'selected' : ''}>C+</option>
                            <option value="C" ${grade?.grade === 'C' ? 'selected' : ''}>C</option>
                            <option value="C-" ${grade?.grade === 'C-' ? 'selected' : ''}>C-</option>
                            <option value="D+" ${grade?.grade === 'D+' ? 'selected' : ''}>D+</option>
                            <option value="D" ${grade?.grade === 'D' ? 'selected' : ''}>D</option>
                            <option value="F" ${grade?.grade === 'F' ? 'selected' : ''}>F</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Points</label>
                        <input type="number" name="points" class="form-input" value="${grade?.points || ''}" min="0" max="100" step="0.1" placeholder="85.5">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Max Points</label>
                        <input type="number" name="maxPoints" class="form-input" value="${grade?.maxPoints || ''}" min="0" step="0.1" placeholder="100">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date *</label>
                        <input type="date" name="date" class="form-input" value="${grade?.date || new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Credits</label>
                        <input type="number" name="credits" class="form-input" value="${grade?.credits || '3'}" min="1" max="6" step="1">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Comments</label>
                    <textarea name="comments" class="form-textarea" rows="3">${grade?.comments || ''}</textarea>
                </div>
                ${isEdit ? `<input type="hidden" name="id" value="${grade.id}">` : ''}
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Save'} Grade
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(title, form);
    }

    /**
     * Show attendance form
     */
    showAttendanceForm() {
        const students = storageManager.getStudents();
        const courses = storageManager.getCourses();
        const today = new Date().toISOString().split('T')[0];
        
        const form = `
            <form id="attendance-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Date *</label>
                        <input type="date" name="date" class="form-input" value="${today}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Course</label>
                        <select name="courseId" class="form-select">
                            <option value="">Select Course (Optional)</option>
                            ${courses.map(c => `
                                <option value="${c.id}">${c.name}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Students Attendance *</label>
                    <div class="attendance-list" style="max-height: 300px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
                        ${students.map(student => `
                            <div class="attendance-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                                <span>${student.firstName} ${student.lastName}</span>
                                <div style="display: flex; gap: 12px;">
                                    <label style="display: flex; align-items: center; gap: 4px;">
                                        <input type="radio" name="attendance_${student.id}" value="present" style="margin: 0;" checked>
                                        <span style="color: var(--success-color);">Present</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 4px;">
                                        <input type="radio" name="attendance_${student.id}" value="absent" style="margin: 0;">
                                        <span style="color: var(--error-color);">Absent</span>
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 4px;">
                                        <input type="radio" name="attendance_${student.id}" value="late" style="margin: 0;">
                                        <span style="color: var(--warning-color);">Late</span>
                                    </label>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea name="notes" class="form-textarea" rows="3" placeholder="Additional notes about today's attendance..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Attendance
                    </button>
                </div>
            </form>
        `;
        
        this.showModal('Mark Attendance', form);
    }

    /**
     * Show schedule form
     */
    showScheduleForm(scheduleItem = null) {
        const isEdit = scheduleItem !== null;
        const title = isEdit ? 'Edit Schedule' : 'Add Schedule Item';
        const courses = storageManager.getCourses();
        const faculty = storageManager.getFaculty();
        
        const form = `
            <form id="schedule-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Course *</label>
                        <select name="courseId" class="form-select" required>
                            <option value="">Select Course</option>
                            ${courses.map(c => `
                                <option value="${c.id}" ${scheduleItem?.courseId === c.id ? 'selected' : ''}>
                                    ${c.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Instructor</label>
                        <select name="instructorId" class="form-select">
                            <option value="">Select Instructor</option>
                            ${faculty.map(f => `
                                <option value="${f.id}" ${scheduleItem?.instructorId === f.id ? 'selected' : ''}>
                                    ${f.firstName} ${f.lastName}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Day *</label>
                        <select name="day" class="form-select" required>
                            <option value="">Select Day</option>
                            <option value="monday" ${scheduleItem?.day === 'monday' ? 'selected' : ''}>Monday</option>
                            <option value="tuesday" ${scheduleItem?.day === 'tuesday' ? 'selected' : ''}>Tuesday</option>
                            <option value="wednesday" ${scheduleItem?.day === 'wednesday' ? 'selected' : ''}>Wednesday</option>
                            <option value="thursday" ${scheduleItem?.day === 'thursday' ? 'selected' : ''}>Thursday</option>
                            <option value="friday" ${scheduleItem?.day === 'friday' ? 'selected' : ''}>Friday</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Room</label>
                        <input type="text" name="room" class="form-input" value="${scheduleItem?.room || ''}" placeholder="e.g., Room 101">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Start Time *</label>
                        <input type="time" name="startTime" class="form-input" value="${scheduleItem?.startTime || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Time *</label>
                        <input type="time" name="endTime" class="form-input" value="${scheduleItem?.endTime || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Type</label>
                    <select name="type" class="form-select">
                        <option value="lecture" ${scheduleItem?.type === 'lecture' ? 'selected' : ''}>Lecture</option>
                        <option value="lab" ${scheduleItem?.type === 'lab' ? 'selected' : ''}>Lab</option>
                        <option value="tutorial" ${scheduleItem?.type === 'tutorial' ? 'selected' : ''}>Tutorial</option>
                        <option value="seminar" ${scheduleItem?.type === 'seminar' ? 'selected' : ''}>Seminar</option>
                    </select>
                </div>
                ${isEdit ? `<input type="hidden" name="id" value="${scheduleItem.id}">` : ''}
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Save'} Schedule
                    </button>
                </div>
            </form>
        `;
        
        this.showModal(title, form);
    }

    /**
     * Handle form submission
     */
    handleFormSubmission(e) {
        const form = e.target;
        const formId = form.id;
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        const validation = this.validateFormData(formId, data);
        if (!validation.isValid) {
            this.showValidationErrors(validation.errors);
            return;
        }
        
        // Process form based on type
        switch (formId) {
            case 'student-form':
                this.handleStudentSubmission(data);
                break;
            case 'course-form':
                this.handleCourseSubmission(data);
                break;
            case 'faculty-form':
                this.handleFacultySubmission(data);
                break;
            case 'grade-form':
                this.handleGradeSubmission(data);
                break;
            case 'attendance-form':
                this.handleAttendanceSubmission(data, form);
                break;
            case 'schedule-form':
                this.handleScheduleSubmission(data);
                break;
        }
    }

    /**
     * Validate form data
     */
    validateFormData(formId, data) {
        const rules = this.getValidationRules(formId);
        return Utils.validateForm(data, rules);
    }

    /**
     * Get validation rules for form
     */
    getValidationRules(formId) {
        const rules = {
            'student-form': {
                firstName: { required: true, label: 'First Name', minLength: 2 },
                lastName: { required: true, label: 'Last Name', minLength: 2 },
                email: { required: true, email: true, label: 'Email' },
                department: { required: true, label: 'Department' }
            },
            'course-form': {
                name: { required: true, label: 'Course Name', minLength: 3 },
                code: { required: true, label: 'Course Code', minLength: 3 },
                department: { required: true, label: 'Department' },
                credits: { required: true, label: 'Credits' }
            },
            'faculty-form': {
                firstName: { required: true, label: 'First Name', minLength: 2 },
                lastName: { required: true, label: 'Last Name', minLength: 2 },
                email: { required: true, email: true, label: 'Email' },
                department: { required: true, label: 'Department' }
            },
            'grade-form': {
                studentId: { required: true, label: 'Student' },
                courseId: { required: true, label: 'Course' },
                assignment: { required: true, label: 'Assignment', minLength: 3 },
                grade: { required: true, label: 'Grade' },
                date: { required: true, label: 'Date' }
            },
            'schedule-form': {
                courseId: { required: true, label: 'Course' },
                day: { required: true, label: 'Day' },
                startTime: { required: true, label: 'Start Time' },
                endTime: { required: true, label: 'End Time' }
            }
        };
        
        return rules[formId] || {};
    }

    /**
     * Show validation errors
     */
    showValidationErrors(errors) {
        // Remove existing error messages
        document.querySelectorAll('.form-error').forEach(error => error.remove());
        
        // Add new error messages
        Object.keys(errors).forEach(field => {
            const input = document.querySelector(`[name="${field}"]`);
            if (input) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'form-error';
                errorDiv.textContent = errors[field];
                input.parentNode.appendChild(errorDiv);
                input.classList.add('error');
            }
        });
        
        this.showToast('Please fix the errors in the form', 'error');
    }

    /**
     * Handle student form submission
     */
    handleStudentSubmission(data) {
        try {
            if (data.id) {
                // Update existing student
                const result = storageManager.updateStudent(data.id, data);
                if (result) {
                    this.showToast('Student updated successfully', 'success');
                    this.updateStudentsTable();
                    this.populateDepartmentFilters();
                    this.populateGradeFilters();
                    this.updateDashboardStats();
                    this.closeModal();
                } else {
                    this.showToast('Failed to update student', 'error');
                }
            } else {
                // Add new student
                const result = storageManager.addStudent(data);
                if (result) {
                    this.showToast('Student added successfully', 'success');
                    this.updateStudentsTable();
                    this.populateDepartmentFilters();
                    this.populateGradeFilters();
                    this.updateDashboardStats();
                    this.closeModal();
                } else {
                    this.showToast('Failed to add student', 'error');
                }
            }
        } catch (error) {
            console.error('Error handling student submission:', error);
            this.showToast('An error occurred while saving student', 'error');
        }
    }

    /**
     * Handle course form submission
     */
    handleCourseSubmission(data) {
        try {
            if (data.id) {
                // Update existing course
                const result = storageManager.updateCourse(data.id, data);
                if (result) {
                    this.showToast('Course updated successfully', 'success');
                    this.updateCoursesGrid();
                    this.populateDepartmentFilters();
                    this.populateGradeFilters();
                    this.updateDashboardStats();
                    this.updateScheduleGrid();
                    this.closeModal();
                } else {
                    this.showToast('Failed to update course', 'error');
                }
            } else {
                // Add new course
                const result = storageManager.addCourse(data);
                if (result) {
                    this.showToast('Course added successfully', 'success');
                    this.updateCoursesGrid();
                    this.populateDepartmentFilters();
                    this.populateGradeFilters();
                    this.updateDashboardStats();
                    this.closeModal();
                } else {
                    this.showToast('Failed to add course', 'error');
                }
            }
        } catch (error) {
            console.error('Error handling course submission:', error);
            this.showToast('An error occurred while saving course', 'error');
        }
    }

    /**
     * Handle faculty form submission
     */
    handleFacultySubmission(data) {
        try {
            if (data.id) {
                // Update existing faculty
                const result = storageManager.updateFaculty(data.id, data);
                if (result) {
                    this.showToast('Faculty updated successfully', 'success');
                    this.updateFacultyGrid();
                    this.populateDepartmentFilters();
                    this.updateDashboardStats();
                    this.updateScheduleGrid();
                    this.closeModal();
                } else {
                    this.showToast('Failed to update faculty', 'error');
                }
            } else {
                // Add new faculty
                const result = storageManager.addFaculty(data);
                if (result) {
                    this.showToast('Faculty added successfully', 'success');
                    this.updateFacultyGrid();
                    this.populateDepartmentFilters();
                    this.updateDashboardStats();
                    this.closeModal();
                } else {
                    this.showToast('Failed to add faculty', 'error');
                }
            }
        } catch (error) {
            console.error('Error handling faculty submission:', error);
            this.showToast('An error occurred while saving faculty', 'error');
        }
    }

    /**
     * Handle grade form submission
     */
    handleGradeSubmission(data) {
        try {
            if (data.id) {
                // Update existing grade
                const result = storageManager.updateGrade(data.id, data);
                if (result) {
                    this.showToast('Grade updated successfully', 'success');
                    this.updateGradesTable();
                    this.updateStudentsTable(); // Update GPA
                    this.updateDashboardCharts();
                    this.closeModal();
                } else {
                    this.showToast('Failed to update grade', 'error');
                }
            } else {
                // Add new grade
                const result = storageManager.addGrade(data);
                if (result) {
                    this.showToast('Grade added successfully', 'success');
                    this.updateGradesTable();
                    this.updateStudentsTable(); // Update GPA
                    this.updateDashboardCharts();
                    this.closeModal();
                } else {
                    this.showToast('Failed to add grade', 'error');
                }
            }
        } catch (error) {
            console.error('Error handling grade submission:', error);
            this.showToast('An error occurred while saving grade', 'error');
        }
    }

    /**
     * Handle attendance form submission
     */
    handleAttendanceSubmission(data, form) {
        try {
            const students = storageManager.getStudents();
            const attendanceRecords = [];
            
            // Process attendance for each student
            students.forEach(student => {
                const attendanceInput = form.querySelector(`input[name="attendance_${student.id}"]:checked`);
                if (attendanceInput) {
                    attendanceRecords.push({
                        studentId: student.id,
                        courseId: data.courseId || null,
                        date: data.date,
                        status: attendanceInput.value,
                        notes: data.notes || ''
                    });
                }
            });
            
            // Save all attendance records
            let successCount = 0;
            attendanceRecords.forEach(record => {
                const result = storageManager.addAttendance(record);
                if (result) successCount++;
            });
            
            if (successCount === attendanceRecords.length) {
                this.showToast(`Attendance marked for ${successCount} students`, 'success');
                this.updateAttendanceCalendar();
                this.updateAttendanceStats();
                this.updateDashboardStats();
                this.updateDashboardCharts();
                this.closeModal();
            } else {
                this.showToast('Some attendance records failed to save', 'warning');
            }
        } catch (error) {
            console.error('Error handling attendance submission:', error);
            this.showToast('An error occurred while saving attendance', 'error');
        }
    }

    /**
     * Handle schedule form submission
     */
    handleScheduleSubmission(data) {
        try {
            // Validate time conflict
            if (this.hasTimeConflict(data)) {
                this.showToast('Time conflict detected with existing schedule', 'error');
                return;
            }
            
            if (data.id) {
                // Update existing schedule item
                const result = storageManager.updateScheduleItem(data.id, data);
                if (result) {
                    this.showToast('Schedule updated successfully', 'success');
                    this.updateScheduleGrid();
                    this.closeModal();
                } else {
                    this.showToast('Failed to update schedule', 'error');
                }
            } else {
                // Add new schedule item
                const result = storageManager.addScheduleItem(data);
                if (result) {
                    this.showToast('Schedule item added successfully', 'success');
                    this.updateScheduleGrid();
                    this.closeModal();
                } else {
                    this.showToast('Failed to add schedule item', 'error');
                }
            }
        } catch (error) {
            console.error('Error handling schedule submission:', error);
            this.showToast('An error occurred while saving schedule', 'error');
        }
    }

    /**
     * Check for time conflicts in schedule
     */
    hasTimeConflict(newItem) {
        const existingSchedule = storageManager.getSchedule();
        
        return existingSchedule.some(item => {
            // Skip checking against itself if editing
            if (newItem.id && item.id === newItem.id) return false;
            
            // Same day check
            if (item.day !== newItem.day) return false;
            
            // Time overlap check
            const itemStart = this.timeToMinutes(item.startTime);
            const itemEnd = this.timeToMinutes(item.endTime);
            const newStart = this.timeToMinutes(newItem.startTime);
            const newEnd = this.timeToMinutes(newItem.endTime);
            
            return (newStart < itemEnd && newEnd > itemStart);
        });
    }

    /**
     * Convert time to minutes for comparison
     */
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Handle edit actions
     */
    handleEditAction(action, button) {
        const id = button.dataset.id;
        const type = action.replace('edit-', '');
        
        switch (type) {
            case 'student':
                const student = storageManager.getStudentById(id);
                if (student) this.showStudentForm(student);
                break;
            case 'course':
                const course = storageManager.getCourseById(id);
                if (course) this.showCourseForm(course);
                break;
            case 'faculty':
                const faculty = storageManager.getFacultyById(id);
                if (faculty) this.showFacultyForm(faculty);
                break;
            case 'grade':
                const grades = storageManager.getGrades();
                const grade = grades.find(g => g.id === id);
                if (grade) this.showGradeForm(grade);
                break;
        }
    }

    /**
     * Handle delete actions
     */
    handleDeleteAction(action, button) {
        const id = button.dataset.id;
        const type = action.replace('delete-', '');
        
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            let result = false;
            
            switch (type) {
                case 'student':
                    result = storageManager.deleteStudent(id);
                    if (result) {
                        this.updateStudentsTable();
                        this.populateGradeFilters();
                        this.updateDashboardStats();
                    }
                    break;
                case 'course':
                    result = storageManager.deleteCourse(id);
                    if (result) {
                        this.updateCoursesGrid();
                        this.populateDepartmentFilters();
                        this.populateGradeFilters();
                        this.updateDashboardStats();
                        this.updateScheduleGrid();
                    }
                    break;
                case 'faculty':
                    result = storageManager.deleteFaculty(id);
                    if (result) {
                        this.updateFacultyGrid();
                        this.populateDepartmentFilters();
                        this.updateDashboardStats();
                        this.updateScheduleGrid();
                    }
                    break;
                case 'grade':
                    result = storageManager.deleteGrade(id);
                    if (result) {
                        this.updateGradesTable();
                        this.updateStudentsTable(); // Update GPA
                        this.updateDashboardCharts();
                    }
                    break;
            }
            
            if (result) {
                this.showToast(`${Utils.capitalize(type)} deleted successfully`, 'success');
            } else {
                this.showToast(`Failed to delete ${type}`, 'error');
            }
        }
    }
}

// Initialize the application when DOM is ready
window.app = new CollegeManagementApp();
