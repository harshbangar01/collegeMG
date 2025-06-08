/**
 * Utility functions for College Management System
 */

class Utils {
    /**
     * Format date to readable string
     * @param {Date|string} date - Date to format
     * @param {string} format - Format type (short, long, time)
     * @returns {string} Formatted date string
     */
    static formatDate(date, format = 'short') {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';

        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        };

        return d.toLocaleDateString('en-US', options[format] || options.short);
    }

    /**
     * Format time to readable string
     * @param {string} time - Time in HH:MM format
     * @returns {string} Formatted time string
     */
    static formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number format
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Is valid phone number
     */
    static isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    /**
     * Generate random color
     * @returns {string} Hex color code
     */
    static getRandomColor() {
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
            '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
            '#ff9a9e', '#fecfcd', '#ffeaa7', '#fab1a0'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Convert string to title case
     * @param {string} str - String to convert
     * @returns {string} Title case string
     */
    static toTitleCase(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, txt => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    /**
     * Format file size to readable string
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Calculate age from birth date
     * @param {Date|string} birthDate - Birth date
     * @returns {number} Age in years
     */
    static calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    /**
     * Search array of objects by multiple fields
     * @param {Array} array - Array to search
     * @param {string} query - Search query
     * @param {Array} fields - Fields to search in
     * @returns {Array} Filtered array
     */
    static searchObjects(array, query, fields) {
        if (!query) return array;
        
        const searchTerm = query.toLowerCase().trim();
        return array.filter(item => {
            return fields.some(field => {
                const value = this.getNestedProperty(item, field);
                return value && value.toString().toLowerCase().includes(searchTerm);
            });
        });
    }

    /**
     * Get nested property from object
     * @param {Object} obj - Object to search
     * @param {string} path - Property path (e.g., 'user.name')
     * @returns {any} Property value
     */
    static getNestedProperty(obj, path) {
        return path.split('.').reduce((current, prop) => current && current[prop], obj);
    }

    /**
     * Sort array of objects by field
     * @param {Array} array - Array to sort
     * @param {string} field - Field to sort by
     * @param {string} direction - Sort direction (asc/desc)
     * @returns {Array} Sorted array
     */
    static sortObjects(array, field, direction = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = this.getNestedProperty(a, field);
            const bVal = this.getNestedProperty(b, field);
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Convert grade to GPA points
     * @param {string} grade - Letter grade
     * @returns {number} GPA points
     */
    static gradeToGPA(grade) {
        const gradePoints = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'F': 0.0
        };
        return gradePoints[grade] || 0;
    }

    /**
     * Convert percentage to letter grade
     * @param {number} percentage - Percentage score
     * @returns {string} Letter grade
     */
    static percentageToGrade(percentage) {
        if (percentage >= 97) return 'A+';
        if (percentage >= 93) return 'A';
        if (percentage >= 90) return 'A-';
        if (percentage >= 87) return 'B+';
        if (percentage >= 83) return 'B';
        if (percentage >= 80) return 'B-';
        if (percentage >= 77) return 'C+';
        if (percentage >= 73) return 'C';
        if (percentage >= 70) return 'C-';
        if (percentage >= 67) return 'D+';
        if (percentage >= 60) return 'D';
        return 'F';
    }

    /**
     * Validate form data
     * @param {Object} data - Form data to validate
     * @param {Object} rules - Validation rules
     * @returns {Object} Validation result with errors
     */
    static validateForm(data, rules) {
        const errors = {};
        
        Object.keys(rules).forEach(field => {
            const value = data[field];
            const fieldRules = rules[field];
            
            // Required validation
            if (fieldRules.required && (!value || value.toString().trim() === '')) {
                errors[field] = `${fieldRules.label || field} is required`;
                return;
            }
            
            // Skip other validations if field is empty and not required
            if (!value) return;
            
            // Email validation
            if (fieldRules.email && !this.isValidEmail(value)) {
                errors[field] = `${fieldRules.label || field} must be a valid email`;
            }
            
            // Phone validation
            if (fieldRules.phone && !this.isValidPhone(value)) {
                errors[field] = `${fieldRules.label || field} must be a valid phone number`;
            }
            
            // Minimum length validation
            if (fieldRules.minLength && value.length < fieldRules.minLength) {
                errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
            }
            
            // Maximum length validation
            if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
                errors[field] = `${fieldRules.label || field} must be no more than ${fieldRules.maxLength} characters`;
            }
            
            // Pattern validation
            if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
                errors[field] = fieldRules.message || `${fieldRules.label || field} format is invalid`;
            }
        });
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Show loading state
     * @param {HTMLElement} element - Element to show loading on
     * @param {string} text - Loading text
     */
    static showLoading(element, text = 'Loading...') {
        const originalContent = element.innerHTML;
        element.dataset.originalContent = originalContent;
        element.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        element.disabled = true;
    }

    /**
     * Hide loading state
     * @param {HTMLElement} element - Element to hide loading from
     */
    static hideLoading(element) {
        if (element.dataset.originalContent) {
            element.innerHTML = element.dataset.originalContent;
            delete element.dataset.originalContent;
        }
        element.disabled = false;
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * Download data as file
     * @param {string} data - Data to download
     * @param {string} filename - File name
     * @param {string} type - MIME type
     */
    static downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Get current academic year
     * @returns {string} Academic year string
     */
    static getCurrentAcademicYear() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // Academic year typically starts in August/September
        if (currentMonth >= 7) { // August is month 7 (0-indexed)
            return `${currentYear}-${currentYear + 1}`;
        } else {
            return `${currentYear - 1}-${currentYear}`;
        }
    }

    /**
     * Get days in month
     * @param {number} year - Year
     * @param {number} month - Month (0-indexed)
     * @returns {number} Number of days in month
     */
    static getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    /**
     * Get week day name
     * @param {number} dayIndex - Day index (0 = Sunday)
     * @returns {string} Day name
     */
    static getDayName(dayIndex) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayIndex] || '';
    }

    /**
     * Get month name
     * @param {number} monthIndex - Month index (0-indexed)
     * @returns {string} Month name
     */
    static getMonthName(monthIndex) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthIndex] || '';
    }

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} Is in viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Smooth scroll to element
     * @param {HTMLElement} element - Element to scroll to
     * @param {number} offset - Offset from top
     */
    static scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Make Utils available globally
window.Utils = Utils;
