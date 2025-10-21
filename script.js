// Supabase initialization
const SUPABASE_URL = "https://tvhunlkpuekapgkkgtkf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aHVubGtwdWVrYXBna2tndGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NjU5NTcsImV4cCI6MjA3NjU0MTk1N30.cYBUGbWPosqKl7ecg2MwDOxsRSh3JGbo_7cCJ1ErRAQ";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', function() {
    // Form data object to store all user inputs
    let formData = {
        personal: {},
        hardware: {},
        internet: {}
    };

    // Placeholder styling for selects: gray when placeholder is selected
    const formFactorSelect = document.getElementById('computerFormFactor');
    const osSelect = document.getElementById('operatingSystem');
    const successModal = document.getElementById('success-modal');
    const closeSuccessModalBtn = document.getElementById('close-success-modal');

    function refreshSelectPlaceholderStyle(selectEl) {
        if (!selectEl) return;
        const isPlaceholder = selectEl.value === '';
        selectEl.classList.toggle('placeholder-selected', isPlaceholder);
    }

    // Initialize and bind change listeners
    refreshSelectPlaceholderStyle(formFactorSelect);
    refreshSelectPlaceholderStyle(osSelect);
    if (formFactorSelect) {
        formFactorSelect.addEventListener('change', () => refreshSelectPlaceholderStyle(formFactorSelect));
    }
    if (osSelect) {
        osSelect.addEventListener('change', () => refreshSelectPlaceholderStyle(osSelect));
    }

    // Success modal close handler
    if (closeSuccessModalBtn && successModal) {
        closeSuccessModalBtn.addEventListener('click', function() {
            successModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        });
        // Optional: close when clicking backdrop
        successModal.addEventListener('click', function(e) {
            if (e.target === successModal) {
                successModal.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });
    }

    // Step navigation
    const steps = document.querySelectorAll('.step');
    const stepForms = document.querySelectorAll('.step-form');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const editButtons = document.querySelectorAll('.edit-section');
    const submitButton = document.getElementById('submit-assessment');
    
    // Current step tracker
    let currentStep = 1;

    // Initialize conditional fields
    const hardwareIssuesRadios = document.querySelectorAll('input[name="hardwareIssues"]');
    const hardwareIssuesDescription = document.getElementById('hardwareIssuesDescription');
    
    const backupPowerRadios = document.querySelectorAll('input[name="backupPower"]');
    const backupPowerDescription = document.getElementById('backupPowerDescription');
    
    const backupInternetRadios = document.querySelectorAll('input[name="backupInternet"]');
    const backupInternetDescription = document.getElementById('backupInternetDescription');
    
    const backupLocationRadios = document.querySelectorAll('input[name="backupLocation"]');
    const backupLocationDescription = document.getElementById('backupLocationDescription');

    // Handle conditional fields visibility and required toggling
    hardwareIssuesRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const show = this.value === 'yes';
            hardwareIssuesDescription.classList.toggle('hidden', !show);
            const issuesInput = document.getElementById('issuesDescription');
            if (issuesInput) issuesInput.required = show;
        });
    });

    backupPowerRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const show = this.value === 'yes';
            backupPowerDescription.classList.toggle('hidden', !show);
            const powerInput = document.getElementById('powerDescription');
            if (powerInput) powerInput.required = show;
        });
    });

    backupInternetRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const show = this.value === 'yes';
            backupInternetDescription.classList.toggle('hidden', !show);
            const internetBackupInput = document.getElementById('internetBackupDescription');
            if (internetBackupInput) internetBackupInput.required = show;
        });
    });

    backupLocationRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const show = this.value === 'yes';
            backupLocationDescription.classList.toggle('hidden', !show);
            const locationBackupInput = document.getElementById('locationBackupDescription');
            if (locationBackupInput) locationBackupInput.required = show;
        });
    });

    // Next step button click handlers
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Validate current step
            if (validateStep(currentStep)) {
                // Save data from current step
                saveStepData(currentStep);

                // Determine and move to next step
                if (currentStep < 4) {
                    const nextStep = currentStep + 1;
                    goToStep(nextStep);
                    // Populate summary when arriving at step 4
                    if (nextStep === 4) {
                        populateSummary();
                    }
                }
            }
        });
    });

    // Previous step button click handlers
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    });

    // Edit section button click handlers
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stepToEdit = parseInt(this.getAttribute('data-step'));
            goToStep(stepToEdit);
        });
    });

    // Submit button click handler
    submitButton.addEventListener('click', async function() {
        // Validate before final submit
        if (!validateStep(3)) {
            return;
        }
        
        // Save the latest data for summary
        saveStepData(1);
        saveStepData(2);
        saveStepData(3);

        // Show loading state
        this.disabled = true;
        this.innerHTML = 'Submitting...';

        // Prepare payload for Supabase with exact field mapping
        const payload = {
            full_name: formData.personal.fullName || '',
            email: formData.personal.email || '',
            assessment_date: formData.personal.assessmentDate || null,
            hardware_issues: formData.hardware.hardwareIssues || '',
            form_factor: formData.hardware.computerFormFactor || '',
            operating_system: formData.hardware.operatingSystem || '',
            processor: formData.hardware.processor || '',
            ram: formData.hardware.ramMemory || '',
            backup_device: formData.hardware.backupDevice || '',
            backup_power: formData.hardware.backupPower || '',
            second_monitor: formData.hardware.secondMonitor || '',
            internet_provider: formData.internet.internetProvider || '',
            internet_speed: formData.internet.internetSpeed || '',
            connection_type: formData.internet.connectionType || '',
            backup_internet: formData.internet.backupInternet || '',
            backup_internet_description: formData.internet.internetBackupDescription || '',
            backup_location: formData.internet.backupLocation || '',
            backup_location_description: formData.internet.locationBackupDescription || '',
            processor_screenshot_url: formData.hardware.processorScreenshot || '',
            speedtest_screenshot_url: formData.internet.speedtestUpload || ''
        };

        try {
            // Check if email already exists
            const { data: existing, error: existingError } = await supabase
                .from('assessments')
                .select('email')
                .eq('email', payload.email);

            if (existingError) {
                console.error('Email duplicate check failed:', existingError);
                alert('Submission is currently blocked by server security policy. Please try again later or contact support.');
                this.disabled = false;
                this.innerHTML = 'Submit Assessment';
                return;
            }

            if (existing && existing.length > 0) {
                alert("You have already submitted an IT Assessment.");
                this.disabled = false;
                this.innerHTML = 'Submit Assessment';
                return;
            }

            // Insert new assessment
            const { data, error } = await supabase.from('assessments').insert([payload]).select();
            if (error) throw error;

            // Hide form and show success modal pop-out
            document.getElementById('summary-form').classList.add('hidden');
            if (successModal) {
                successModal.classList.remove('hidden');
                document.body.classList.add('overflow-hidden');
            }

            console.log('Supabase insert success:', data);

            // Keep button blocked after submission
            this.disabled = true;
            this.innerHTML = 'Submitted';
        } catch (err) {
            console.error('Supabase insert error:', err);
            alert('There was an error submitting your assessment. Please try again.');
            this.disabled = false;
            this.innerHTML = 'Submit Assessment';
        }
    });

    // Function to validate each step
    function validateStep(step) {
        let errors = [];

        if (step === 1) {
            // Validate Personal Information
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const assessmentDate = document.getElementById('assessmentDate').value;

            if (!fullName) errors.push('Full Name is required');
            if (!email) {
                errors.push('Email Address is required');
            } else if (!validateEmail(email)) {
                errors.push('Email Address is invalid');
            }
            if (!assessmentDate) errors.push('Assessment Date is required');
        } else if (step === 2) {
            // Validate Hardware Assessment
            const hardwareIssuesEl = document.querySelector('input[name="hardwareIssues"]:checked');
            const computerFormFactor = document.getElementById('computerFormFactor').value.trim();
            const operatingSystem = document.getElementById('operatingSystem').value.trim();
            const processor = document.getElementById('processor').value.trim();
            const processorScreenshot = document.getElementById('processorScreenshot');
            const ramMemory = document.getElementById('ramMemory').value.trim();
            const backupDeviceEl = document.querySelector('input[name="backupDevice"]:checked');
            const backupPowerEl = document.querySelector('input[name="backupPower"]:checked');
            const powerDescription = document.getElementById('powerDescription').value.trim();
            const secondMonitorEl = document.querySelector('input[name="secondMonitor"]:checked');

            if (!hardwareIssuesEl) {
                errors.push('Please select if you have hardware issues');
            } else if (hardwareIssuesEl.value === 'yes') {
                const issuesDescription = document.getElementById('issuesDescription').value.trim();
                if (!issuesDescription) errors.push('Please describe your hardware issues');
            }

            if (!computerFormFactor) errors.push('Computer Form Factor is required');
            if (!operatingSystem) errors.push('Operating System is required');
            if (!processor) errors.push('Processor is required');
            if (!processorScreenshot || processorScreenshot.files.length === 0) {
                errors.push('Processor info screenshot upload is required');
            }
            if (!ramMemory) errors.push('RAM Memory is required');

            if (!backupDeviceEl) errors.push('Please select if you have a backup device');

            if (!backupPowerEl) {
                errors.push('Please select if you have a backup power source');
            } else if (backupPowerEl.value === 'yes') {
                if (!powerDescription) errors.push('Please describe your backup power source');
            }

            if (!secondMonitorEl) errors.push('Please select if you have a second monitor');
        } else if (step === 3) {
            // Validate Internet Assessment
            const internetProvider = document.getElementById('internetProvider').value.trim();
            const internetSpeed = document.getElementById('internetSpeed').value.trim();
            const connectionTypeEl = document.querySelector('input[name="connectionType"]:checked');
            const backupInternetEl = document.querySelector('input[name="backupInternet"]:checked');
            const internetBackupDescription = document.getElementById('internetBackupDescription').value.trim();
            const backupLocationEl = document.querySelector('input[name="backupLocation"]:checked');
            const locationBackupDescription = document.getElementById('locationBackupDescription').value.trim();
            const speedtestUpload = document.getElementById('speedtestUpload');

            if (!internetProvider) errors.push('Main Internet Service Provider is required');
            if (!internetSpeed) errors.push('Internet Speed Test Result is required');
            if (!connectionTypeEl) errors.push('Connection Type is required');
            if (!speedtestUpload || speedtestUpload.files.length === 0) {
                errors.push('Speedtest screenshot upload is required');
            }

            if (!backupInternetEl) {
                errors.push('Please select if you have backup internet');
            } else if (backupInternetEl.value === 'yes') {
                if (!internetBackupDescription) errors.push('Please describe your backup internet');
            }

            if (!backupLocationEl) {
                errors.push('Please select if you have a backup location');
            } else if (backupLocationEl.value === 'yes') {
                if (!locationBackupDescription) errors.push('Please specify your backup location');
            }
        }

        if (errors.length > 0) {
            alert('Please complete the following required fields:\n\n' + errors.map(e => '- ' + e).join('\n'));
            return false;
        }
        return true;
    }

    // Email validation helper
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Function to save data from each step
    function saveStepData(step) {
        if (step === 1) {
            // Save Personal Information
            formData.personal = {
                fullName: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                assessmentDate: document.getElementById('assessmentDate').value
            };
        } else if (step === 2) {
            // Save Hardware Assessment
            const hardwareIssues = document.querySelector('input[name="hardwareIssues"]:checked')?.value || '';
            
            formData.hardware = {
                hardwareIssues: hardwareIssues,
                issuesDescription: hardwareIssues === 'yes' ? document.getElementById('issuesDescription').value.trim() : '',
                computerFormFactor: document.getElementById('computerFormFactor').value.trim(),
                operatingSystem: document.getElementById('operatingSystem').value.trim(),
                processor: document.getElementById('processor').value.trim(),
                // We don't save the actual file here, just note that it was uploaded
                processorScreenshot: document.getElementById('processorScreenshot').files.length > 0 ? 'Uploaded' : 'Not uploaded',
                ramMemory: document.getElementById('ramMemory').value.trim(),
                backupDevice: document.querySelector('input[name="backupDevice"]:checked')?.value || '',
                backupPower: document.querySelector('input[name="backupPower"]:checked')?.value || '',
                powerDescription: document.getElementById('powerDescription').value.trim(),
                secondMonitor: document.querySelector('input[name="secondMonitor"]:checked')?.value || ''
            };
        } else if (step === 3) {
            // Save Internet Assessment
            const backupInternet = document.querySelector('input[name="backupInternet"]:checked')?.value || '';
            const backupLocation = document.querySelector('input[name="backupLocation"]:checked')?.value || '';
            
            formData.internet = {
                internetProvider: document.getElementById('internetProvider').value.trim(),
                internetSpeed: document.getElementById('internetSpeed').value.trim(),
                connectionType: document.querySelector('input[name="connectionType"]:checked')?.value || '',
                backupInternet: backupInternet,
                internetBackupDescription: backupInternet === 'yes' ? document.getElementById('internetBackupDescription').value.trim() : '',
                backupLocation: backupLocation,
                locationBackupDescription: backupLocation === 'yes' ? document.getElementById('locationBackupDescription').value.trim() : ''
            };
        }
    }

    // Function to populate the summary page
    function populateSummary() {
        // Personal Information Summary
        const personalSummary = document.getElementById('personal-info-summary');
        personalSummary.innerHTML = `
            <div class="summary-item">
                <div class="summary-label">Full Name:</div>
                <div class="summary-value">${formData.personal.fullName || ''}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Email Address:</div>
                <div class="summary-value">${formData.personal.email || ''}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Assessment Date:</div>
                <div class="summary-value">${formData.personal.assessmentDate || ''}</div>
            </div>
        `;
        
        // Hardware Summary
        const hardwareSummary = document.getElementById('hardware-summary');
        hardwareSummary.innerHTML = `
            <div class="summary-item">
                <div class="summary-label">Hardware Issues:</div>
                <div class="summary-value">${formData.hardware.hardwareIssues === 'yes' ? 'Yes' : 'No'}</div>
            </div>
            ${formData.hardware.hardwareIssues === 'yes' ? `
                <div class="summary-item">
                    <div class="summary-label">Issues Description:</div>
                    <div class="summary-value">${formData.hardware.issuesDescription || ''}</div>
                </div>
            ` : ''}
            <div class="summary-item">
                <div class="summary-label">Computer Form Factor:</div>
                <div class="summary-value">${formData.hardware.computerFormFactor || ''}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Operating System:</div>
                <div class="summary-value">${formData.hardware.operatingSystem || ''}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Processor:</div>
                <div class="summary-value">${formData.hardware.processor || ''}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Processor Screenshot:</div>
                <div class="summary-value">${formData.hardware.processorScreenshot || ''}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">RAM Memory:</div>
                <div class="summary-value">${formData.hardware.ramMemory || ''}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Backup Device:</div>
                <div class="summary-value">${formData.hardware.backupDevice === 'yes' ? 'Yes' : 'No'}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Backup Power Source:</div>
                <div class="summary-value">${formData.hardware.backupPower === 'yes' ? 'Yes' : 'No'}</div>
            </div>
            ${formData.hardware.backupPower === 'yes' ? `
                <div class="summary-item">
                    <div class="summary-label">Power Source Description:</div>
                    <div class="summary-value">${formData.hardware.powerDescription || ''}</div>
                </div>
            ` : ''}
            <div class="summary-item">
                <div class="summary-label">Second Monitor:</div>
                <div class="summary-value">${formData.hardware.secondMonitor === 'yes' ? 'Yes' : 'No'}</div>
            </div>
        `;
        
        // Internet Summary
        const internetSummary = document.getElementById('internet-summary');
        internetSummary.innerHTML = `
            <div class="summary-item">
                <div class="summary-label">Internet Provider:</div>
                <div class="summary-value">${formData.internet.internetProvider || ''}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Internet Speed:</div>
                <div class="summary-value">${formData.internet.internetSpeed || ''}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Connection Type:</div>
                <div class="summary-value">${formData.internet.connectionType === 'wifi' ? 'Wi-Fi only' : 'Wired (LAN/Ethernet)'}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Backup Internet:</div>
                <div class="summary-value">${formData.internet.backupInternet === 'yes' ? 'Yes' : 'No'}</div>
            </div>
            ${formData.internet.backupInternet === 'yes' ? `
                <div class="summary-item">
                    <div class="summary-label">Backup Internet Description:</div>
                    <div class="summary-value">${formData.internet.internetBackupDescription || ''}</div>
                </div>
            ` : ''}
            <div class="summary-item">
                <div class="summary-label">Backup Location:</div>
                <div class="summary-value">${formData.internet.backupLocation === 'yes' ? 'Yes' : 'No'}</div>
            </div>
            ${formData.internet.backupLocation === 'yes' ? `
                <div class="summary-item">
                    <div class="summary-label">Backup Location Description:</div>
                    <div class="summary-value">${formData.internet.locationBackupDescription || ''}</div>
                </div>
            ` : ''}
        `;
    }

    // Function to navigate between steps
    function goToStep(step) {
        // Update current step
        currentStep = step;
        
        // Update step indicators
        steps.forEach((stepEl, index) => {
            const stepNum = index + 1;
            
            if (stepNum < currentStep) {
                stepEl.classList.add('completed');
                stepEl.classList.remove('active');
            } else if (stepNum === currentStep) {
                stepEl.classList.add('active');
                stepEl.classList.remove('completed');
            } else {
                stepEl.classList.remove('active', 'completed');
            }
        });
        
        // Show current form, hide others
        stepForms.forEach((formEl, index) => {
            const formStep = index + 1;
            
            if (formStep === currentStep) {
                formEl.classList.add('active');
                formEl.classList.remove('hidden');
            } else {
                formEl.classList.remove('active');
                formEl.classList.add('hidden');
            }
        });
    }

    // Initialize the form
    goToStep(1);
});