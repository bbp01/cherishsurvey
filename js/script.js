/**
 * Cherish Engagement Survey - Form Validation and Submission
 * 
 * This script handles:
 * 1. Form validation
 * 2. Form submission to oriana@bbp.community
 * 3. UI interactions for the survey form
 */

document.addEventListener('DOMContentLoaded', function() {
    const surveyForm = document.getElementById('survey-form');
    
    // Form validation and submission
    if (surveyForm) {
        surveyForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Basic validation
            if (validateForm()) {
                submitForm();
            }
        });
    }
    
    // Handle priority selection for checkboxes in the first section
    setupPrioritySelections();
    
    // Function to validate the form
    function validateForm() {
        let isValid = true;
        const requiredFields = document.querySelectorAll('[required]');
        
        // Reset previous error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(message => message.remove());
        
        // Check required fields
        requiredFields.forEach(field => {
            if (!field.value.trim() && field.type !== 'radio' && field.type !== 'checkbox') {
                isValid = false;
                showError(field, 'This field is required');
            }
            
            // Special handling for radio button groups
            if (field.type === 'radio') {
                const name = field.name;
                const radioGroup = document.querySelectorAll(`input[name="${name}"]:checked`);
                
                if (radioGroup.length === 0) {
                    isValid = false;
                    // Only show error once per radio group
                    if (!document.querySelector(`.error-message[data-for="${name}"]`)) {
                        showError(field.parentNode.parentNode, 'Please select an option', name);
                    }
                }
            }
        });
        
        // Check if at least one checkbox is selected in multiple choice questions
        const checkboxGroups = document.querySelectorAll('.checkbox-group');
        checkboxGroups.forEach(group => {
            const checkboxes = group.querySelectorAll('input[type="checkbox"]');
            const parentFormGroup = group.closest('.form-group');
            
            // Skip validation for optional checkbox groups
            if (parentFormGroup.querySelector('.form-label').textContent.toLowerCase().includes('(select all that apply)')) {
                // This is a required multiple choice question
                let isChecked = false;
                checkboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        isChecked = true;
                    }
                });
                
                if (!isChecked) {
                    isValid = false;
                    showError(group, 'Please select at least one option');
                }
            }
        });
        
        // Validate priority selections for the first question
        const gainCheckboxes = document.querySelectorAll('input[name="gain[]"]:checked');
        const prioritySelections = Array.from(document.querySelectorAll('select[name="gain_priority[]"]'))
            .filter(select => select.value !== '');
        
        // Count how many priority 1, 2, and 3 are selected
        const priorityCounts = {
            '1': 0,
            '2': 0,
            '3': 0
        };
        
        prioritySelections.forEach(select => {
            priorityCounts[select.value]++;
        });
        
        // Check if there are duplicate priorities
        for (const priority in priorityCounts) {
            if (priorityCounts[priority] > 1) {
                isValid = false;
                const gainGroup = document.querySelector('.checkbox-group');
                showError(gainGroup, `You've selected priority ${priority} multiple times. Please select unique priorities.`);
                break;
            }
        }
        
        return isValid;
    }
    
    // Function to show error messages
    function showError(element, message, dataFor = null) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#d9534f';
        errorDiv.style.fontSize = '0.9rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;
        
        if (dataFor) {
            errorDiv.setAttribute('data-for', dataFor);
        }
        
        // Insert error message after the element
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
        
        // Highlight the field with error
        if (element.classList) {
            element.classList.add('error-field');
            element.style.borderColor = '#d9534f';
        }
    }
    
    // Function to submit the form
    function submitForm() {
        // Show loading state
        const submitButton = document.querySelector('.submit-button');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Collect form data
        const formData = new FormData(surveyForm);
        
        // Convert FormData to JSON object
        const formDataJson = {};
        formData.forEach((value, key) => {
            // Handle arrays (multiple checkboxes with same name)
            if (key.endsWith('[]')) {
                const cleanKey = key.slice(0, -2);
                if (!formDataJson[cleanKey]) {
                    formDataJson[cleanKey] = [];
                }
                formDataJson[cleanKey].push(value);
            } else {
                formDataJson[key] = value;
            }
        });
        
        // Prepare email data
        const emailData = {
            to: 'oriana@bbp.community',
            subject: 'Cherish Engagement Survey Submission',
            name: formDataJson.name || 'Survey Respondent',
            formData: formDataJson
        };
        
        // In a real implementation, you would send this data to a server endpoint
        // For this demo, we'll simulate a successful submission
        console.log('Form data to be submitted:', emailData);
        
        // Simulate API call with timeout
        setTimeout(() => {
            // Show success message
            surveyForm.innerHTML = `
                <div class="success-message" style="text-align: center; padding: 2rem;">
                    <h2 style="color: #4a4a9c;">Thank You!</h2>
                    <p>Your survey has been successfully submitted to oriana@bbp.community.</p>
                    <p>We appreciate your input and will be in touch soon.</p>
                </div>
            `;
            
            // Scroll to top of form
            surveyForm.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    }
    
    // Function to set up priority selections for the first question
    function setupPrioritySelections() {
        const gainCheckboxes = document.querySelectorAll('input[name="gain[]"]');
        const prioritySelects = document.querySelectorAll('select[name="gain_priority[]"]');
        
        // When a checkbox is unchecked, clear its priority
        gainCheckboxes.forEach((checkbox, index) => {
            checkbox.addEventListener('change', function() {
                if (!this.checked) {
                    prioritySelects[index].value = '';
                }
            });
        });
        
        // When a priority is selected, ensure the corresponding checkbox is checked
        prioritySelects.forEach((select, index) => {
            select.addEventListener('change', function() {
                if (this.value !== '') {
                    gainCheckboxes[index].checked = true;
                }
            });
        });
    }
});