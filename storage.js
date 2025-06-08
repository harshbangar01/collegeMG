/**
 * Local Storage Manager for College Management System
 * Handles data persistence using browser's local storage
 */

class StorageManager {
    constructor() {
        this.keys = {
            STUDENTS: 'cms_students',
            COURSES: 'cms_courses',
            FACULTY: 'cms_faculty',
            GRADES: 'cms_grades',
            ATTENDANCE: 'cms_attendance',
            SCHEDULE: 'cms_schedule',
            SETTINGS: 'cms_settings'
        };
        
        this.initializeData();
    }

    /**
     * Initialize default data if not exists
     */
    initializeData() {
        if (!this.getItem(this.keys.STUDENTS)) {
            this.setItem(this.keys.STUDENTS, []);
        }
        if (!this.getItem(this.keys.COURSES)) {
            this.setItem(this.keys.COURSES, []);
        }
        if (!this.getItem(this.keys.FACULTY)) {
            this.setItem(this.keys.FACULTY, []);
        }
        if (!this.getItem(this.keys.GRADES)) {
            this.setItem(this.keys.GRADES, []);
        }
        if (!this.getItem(this.keys.ATTENDANCE)) {
            this.setItem(this.keys.ATTENDANCE, []);
        }
        if (!this.getItem(this.keys.SCHEDULE)) {
            this.setItem(this.keys.SCHEDULE, []);
        }
        if (!this.getItem(this.keys.SETTINGS)) {
            this.setItem(this.keys.SETTINGS, {
                theme: 'light',
                sidebarCollapsed: false,
                language: 'en'
            });
        }
    }

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @returns {any} Parsed data or null
     */
    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
        }
    }

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     * @returns {boolean} Success status
     */
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting item in storage:', error);
            return false;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing item from storage:', error);
            return false;
        }
    }

    /**
     * Clear all data
     * @returns {boolean} Success status
     */
    clearAll() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            this.initializeData();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    // Student Methods
    getStudents() {
        return this.getItem(this.keys.STUDENTS) || [];
    }

    addStudent(student) {
        const students = this.getStudents();
        student.id = this.generateId();
        student.createdAt = new Date().toISOString();
        student.updatedAt = new Date().toISOString();
        students.push(student);
        return this.setItem(this.keys.STUDENTS, students) ? student : null;
    }

    updateStudent(id, updatedData) {
        const students = this.getStudents();
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedData };
            students[index].updatedAt = new Date().toISOString();
            return this.setItem(this.keys.STUDENTS, students) ? students[index] : null;
        }
        return null;
    }

    deleteStudent(id) {
        const students = this.getStudents();
        const filteredStudents = students.filter(s => s.id !== id);
        return this.setItem(this.keys.STUDENTS, filteredStudents);
    }

    getStudentById(id) {
        const students = this.getStudents();
        return students.find(s => s.id === id) || null;
    }

    // Course Methods
    getCourses() {
        return this.getItem(this.keys.COURSES) || [];
    }

    addCourse(course) {
        const courses = this.getCourses();
        course.id = this.generateId();
        course.createdAt = new Date().toISOString();
        course.updatedAt = new Date().toISOString();
        courses.push(course);
        return this.setItem(this.keys.COURSES, courses) ? course : null;
    }

    updateCourse(id, updatedData) {
        const courses = this.getCourses();
        const index = courses.findIndex(c => c.id === id);
        if (index !== -1) {
            courses[index] = { ...courses[index], ...updatedData };
            courses[index].updatedAt = new Date().toISOString();
            return this.setItem(this.keys.COURSES, courses) ? courses[index] : null;
        }
        return null;
    }

    deleteCourse(id) {
        const courses = this.getCourses();
        const filteredCourses = courses.filter(c => c.id !== id);
        return this.setItem(this.keys.COURSES, filteredCourses);
    }

    getCourseById(id) {
        const courses = this.getCourses();
        return courses.find(c => c.id === id) || null;
    }

    // Faculty Methods
    getFaculty() {
        return this.getItem(this.keys.FACULTY) || [];
    }

    addFaculty(faculty) {
        const facultyList = this.getFaculty();
        faculty.id = this.generateId();
        faculty.createdAt = new Date().toISOString();
        faculty.updatedAt = new Date().toISOString();
        facultyList.push(faculty);
        return this.setItem(this.keys.FACULTY, facultyList) ? faculty : null;
    }

    updateFaculty(id, updatedData) {
        const facultyList = this.getFaculty();
        const index = facultyList.findIndex(f => f.id === id);
        if (index !== -1) {
            facultyList[index] = { ...facultyList[index], ...updatedData };
            facultyList[index].updatedAt = new Date().toISOString();
            return this.setItem(this.keys.FACULTY, facultyList) ? facultyList[index] : null;
        }
        return null;
    }

    deleteFaculty(id) {
        const facultyList = this.getFaculty();
        const filteredFaculty = facultyList.filter(f => f.id !== id);
        return this.setItem(this.keys.FACULTY, filteredFaculty);
    }

    getFacultyById(id) {
        const facultyList = this.getFaculty();
        return facultyList.find(f => f.id === id) || null;
    }

    // Grade Methods
    getGrades() {
        return this.getItem(this.keys.GRADES) || [];
    }

    addGrade(grade) {
        const grades = this.getGrades();
        grade.id = this.generateId();
        grade.createdAt = new Date().toISOString();
        grade.updatedAt = new Date().toISOString();
        grades.push(grade);
        return this.setItem(this.keys.GRADES, grades) ? grade : null;
    }

    updateGrade(id, updatedData) {
        const grades = this.getGrades();
        const index = grades.findIndex(g => g.id === id);
        if (index !== -1) {
            grades[index] = { ...grades[index], ...updatedData };
            grades[index].updatedAt = new Date().toISOString();
            return this.setItem(this.keys.GRADES, grades) ? grades[index] : null;
        }
        return null;
    }

    deleteGrade(id) {
        const grades = this.getGrades();
        const filteredGrades = grades.filter(g => g.id !== id);
        return this.setItem(this.keys.GRADES, filteredGrades);
    }

    getGradesByStudentId(studentId) {
        const grades = this.getGrades();
        return grades.filter(g => g.studentId === studentId);
    }

    getGradesByCourseId(courseId) {
        const grades = this.getGrades();
        return grades.filter(g => g.courseId === courseId);
    }

    // Attendance Methods
    getAttendance() {
        return this.getItem(this.keys.ATTENDANCE) || [];
    }

    addAttendance(attendance) {
        const attendanceList = this.getAttendance();
        attendance.id = this.generateId();
        attendance.createdAt = new Date().toISOString();
        attendanceList.push(attendance);
        return this.setItem(this.keys.ATTENDANCE, attendanceList) ? attendance : null;
    }

    updateAttendance(id, updatedData) {
        const attendanceList = this.getAttendance();
        const index = attendanceList.findIndex(a => a.id === id);
        if (index !== -1) {
            attendanceList[index] = { ...attendanceList[index], ...updatedData };
            return this.setItem(this.keys.ATTENDANCE, attendanceList) ? attendanceList[index] : null;
        }
        return null;
    }

    getAttendanceByDate(date) {
        const attendanceList = this.getAttendance();
        return attendanceList.filter(a => a.date === date);
    }

    getAttendanceByStudentId(studentId) {
        const attendanceList = this.getAttendance();
        return attendanceList.filter(a => a.studentId === studentId);
    }

    // Schedule Methods
    getSchedule() {
        return this.getItem(this.keys.SCHEDULE) || [];
    }

    addScheduleItem(scheduleItem) {
        const schedule = this.getSchedule();
        scheduleItem.id = this.generateId();
        scheduleItem.createdAt = new Date().toISOString();
        scheduleItem.updatedAt = new Date().toISOString();
        schedule.push(scheduleItem);
        return this.setItem(this.keys.SCHEDULE, schedule) ? scheduleItem : null;
    }

    updateScheduleItem(id, updatedData) {
        const schedule = this.getSchedule();
        const index = schedule.findIndex(s => s.id === id);
        if (index !== -1) {
            schedule[index] = { ...schedule[index], ...updatedData };
            schedule[index].updatedAt = new Date().toISOString();
            return this.setItem(this.keys.SCHEDULE, schedule) ? schedule[index] : null;
        }
        return null;
    }

    deleteScheduleItem(id) {
        const schedule = this.getSchedule();
        const filteredSchedule = schedule.filter(s => s.id !== id);
        return this.setItem(this.keys.SCHEDULE, filteredSchedule);
    }

    getScheduleByDay(day) {
        const schedule = this.getSchedule();
        return schedule.filter(s => s.day === day);
    }

    // Settings Methods
    getSettings() {
        return this.getItem(this.keys.SETTINGS) || {};
    }

    updateSettings(newSettings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        return this.setItem(this.keys.SETTINGS, updatedSettings);
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Calculate GPA for a student
     * @param {string} studentId - Student ID
     * @returns {number} GPA value
     */
    calculateGPA(studentId) {
        const grades = this.getGradesByStudentId(studentId);
        if (grades.length === 0) return 0;

        const gradePoints = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'F': 0.0
        };

        let totalPoints = 0;
        let totalCredits = 0;

        grades.forEach(grade => {
            const points = gradePoints[grade.grade] || 0;
            const credits = grade.credits || 3; // Default 3 credits
            totalPoints += points * credits;
            totalCredits += credits;
        });

        return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    }

    /**
     * Calculate attendance percentage for a student
     * @param {string} studentId - Student ID
     * @returns {number} Attendance percentage
     */
    calculateAttendancePercentage(studentId) {
        const attendance = this.getAttendanceByStudentId(studentId);
        if (attendance.length === 0) return 0;

        const presentCount = attendance.filter(a => a.status === 'present').length;
        return ((presentCount / attendance.length) * 100).toFixed(1);
    }

    /**
     * Get statistics for dashboard
     * @returns {object} Statistics object
     */
    getStatistics() {
        const students = this.getStudents();
        const courses = this.getCourses();
        const faculty = this.getFaculty();
        const attendance = this.getAttendance();

        // Calculate average attendance
        let totalAttendance = 0;
        let attendanceCount = 0;
        
        students.forEach(student => {
            const studentAttendance = this.getAttendanceByStudentId(student.id);
            if (studentAttendance.length > 0) {
                const percentage = this.calculateAttendancePercentage(student.id);
                totalAttendance += parseFloat(percentage);
                attendanceCount++;
            }
        });

        const avgAttendance = attendanceCount > 0 ? (totalAttendance / attendanceCount).toFixed(1) : 0;

        return {
            totalStudents: students.length,
            totalCourses: courses.length,
            totalFaculty: faculty.length,
            avgAttendance: avgAttendance
        };
    }

    /**
     * Export all data as JSON
     * @returns {string} JSON string of all data
     */
    exportData() {
        const data = {
            students: this.getStudents(),
            courses: this.getCourses(),
            faculty: this.getFaculty(),
            grades: this.getGrades(),
            attendance: this.getAttendance(),
            schedule: this.getSchedule(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data from JSON
     * @param {string} jsonData - JSON string to import
     * @returns {boolean} Success status
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.students) this.setItem(this.keys.STUDENTS, data.students);
            if (data.courses) this.setItem(this.keys.COURSES, data.courses);
            if (data.faculty) this.setItem(this.keys.FACULTY, data.faculty);
            if (data.grades) this.setItem(this.keys.GRADES, data.grades);
            if (data.attendance) this.setItem(this.keys.ATTENDANCE, data.attendance);
            if (data.schedule) this.setItem(this.keys.SCHEDULE, data.schedule);
            if (data.settings) this.setItem(this.keys.SETTINGS, data.settings);
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Create global instance
window.storageManager = new StorageManager();
