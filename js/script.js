/**
 * Cherish Engagement Survey - Form Validation and Submission
 * 
 * This script handles:
 * 1. Form validation
 * 2. Form submission to oriana@bbp.community
 * 3. UI interactions for the survey form
 */

/**
 * Cherish Engagement Survey - Form Validation and Submission
 * Uses EmailJS to send form data to info@youradvantage.life
 * 
 * EmailJS config:
 *   Public Key: hIeYf6X5fChUP4qTE
 *   Service ID: cherish_survey
 *   Template ID: template_survey_response
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS
    emailjs.init('hIeYf6X5fChUP4qTE');

    const surveyForm = document.getElementById('survey-form');

    if (surveyForm) {
        surveyForm.addEventListener('submit', function(event) {
            event.preventDefault();

            if (validateForm()) {
                submitForm();
            }
        });
    }

    setupPrioritySelections();

    function validateForm() {
        let isValid = true;
        const requiredFields = document.querySelectorAll('[required]');

        // Remove previous error messages
        document.querySelectorAll('.error-message').forEach(msg => msg.remove());

        // Validate required fields
        requiredFields.forEach(field => {
            if (!field.value.trim() && field.type !== 'radio' && field.type !== 'checkbox') {
                isValid = false;
                showError(field, 'This field is required');
            }
            if (field.type === 'radio') {
                const name = field.name;
                const checked = document.querySelectorAll(`input[name="${name}"]:checked`);
                if (checked.length === 0) {
                    isValid = false;
                    if (!document.querySelector(`.error-message[data-for="${name}"]`)) {
                        showError(field.parentNode.parentNode, 'Please select an option', name);
                    }
                }
            }
        });

        // Validate at least one checkbox is checked in required groups
        document.querySelectorAll('.checkbox-group').forEach(group => {
            const checkboxes = group.querySelectorAll('input[type="checkbox"]');
            const parentFormGroup = group.closest('.form-group');
            if (parentFormGroup && parentFormGroup.querySelector('.form-label') &&
                parentFormGroup.querySelector('.form-label').textContent.toLowerCase().includes('(select all that apply)')
            ) {
                let isChecked = false;
                checkboxes.forEach(checkbox => { if (checkbox.checked) isChecked = true; });
                if (!isChecked) {
                    isValid = false;
                    showError(group, 'Please select at least one option');
                }
            }
        });

        // Validate unique priorities for the first question
        const prioritySelections = Array.from(document.querySelectorAll('select[name="gain_priority[]"]')).filter(select => select.value !== '');
        const priorityCounts = { '1': 0, '2': 0, '3': 0 };
        prioritySelections.forEach(select => { priorityCounts[select.value]++; });
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

    function showError(element, message, dataFor = null) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#d9534f';
        errorDiv.style.fontSize = '0.9rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;
        if (dataFor) errorDiv.setAttribute('data-for', dataFor);
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
        if (element.classList) {
            element.classList.add('error-field');
            element.style.borderColor = '#d9534f';
        }
    }

    function submitForm() {
        const submitButton = document.querySelector('.submit-button');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        const formData = new FormData(surveyForm);
        const formDataObj = {};
        formData.forEach((value, key) => {
            if (key.endsWith('[]')) {
                const cleanKey = key.slice(0, -2);
                if (!formDataObj[cleanKey]) formDataObj[cleanKey] = [];
                formDataObj[cleanKey].push(value);
            } else {
                formDataObj[key] = value;
            }
        });

        // Format the email body
        let emailBody = "Cherish Engagement Survey Submission\n\n";
        for (const [key, value] of Object.entries(formDataObj)) {
            if (Array.isArray(value)) {
                emailBody += `${key}: ${value.join(', ')}\n`;
            } else {
                emailBody += `${key}: ${value}\n`;
            }
        }

        // EmailJS template parameters
        const templateParams = {
            to_email: 'info@youradvantage.life',
            from_name: formDataObj.name || 'Survey Respondent',
            subject: 'Cherish Engagement Survey Submission',
            message: emailBody,
            reply_to: formDataObj.email || 'noreply@example.com'
        };

        emailjs.send('cherish_survey', 'template_survey_response', templateParams)
            .then(function(response) {
                surveyForm.innerHTML = `
                    <div style="text-align: center; padding: 2rem; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 0.375rem; color: #155724;">
                        <h2>Thank you!</h2>
                        <p>Your survey has been submitted successfully. We appreciate your feedback!</p>
                        <p>You should receive a confirmation email shortly at info@youradvantage.life</p>
                    </div>
                `;
                surveyForm.scrollIntoView({ behavior: 'smooth' });
            })
            .catch(function(error) {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = 'background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 1rem; border-radius: 0.375rem; margin-top: 1rem;';
                errorDiv.innerHTML = `
                    <h4>Submission Failed</h4>
                    <p>There was an error submitting your survey. Please try again or contact support.</p>
                `;
                surveyForm.appendChild(errorDiv);
            });
    }

    function setupPrioritySelections() {
        const gainCheckboxes = document.querySelectorAll('input[name="gain[]"]');
        const prioritySelects = document.querySelectorAll('select[name="gain_priority[]"]');
        gainCheckboxes.forEach((checkbox, index) => {
            checkbox.addEventListener('change', function() {
                if (!this.checked) {
                    prioritySelects[index].value = '';
                }
            });
        });
        prioritySelects.forEach((select, index) => {
            select.addEventListener('change', function() {
                if (this.value !== '') {
                    gainCheckboxes[index].checked = true;
                }
            });
        });
    }
});
