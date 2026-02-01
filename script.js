// RSVP Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const rsvpForm = document.getElementById('rsvpForm');
    const successMessage = document.getElementById('successMessage');
    const guestCountGroup = document.getElementById('guestCountGroup');
    const attendanceRadios = document.querySelectorAll('input[name="attendance"]');

    // Initialize Sidebar Navigation
    initSidebarNavigation();

    // Show/hide guest count based on attendance
    attendanceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                guestCountGroup.style.display = 'block';
                document.getElementById('guestCount').required = true;
            } else {
                guestCountGroup.style.display = 'none';
                document.getElementById('guestCount').required = false;
            }
        });
    });

    // Handle form submission
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            id: Date.now().toString(),
            guestName: document.getElementById('guestName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            attendance: document.querySelector('input[name="attendance"]:checked').value,
            guestCount: document.getElementById('guestCount').value || '0',
            dietary: document.getElementById('dietary').value.trim(),
            message: document.getElementById('message').value.trim(),
            submittedAt: new Date().toISOString()
        };

        // Save RSVP to localStorage
        saveRSVP(formData);

        // Hide form and show success message
        rsvpForm.style.display = 'none';
        successMessage.style.display = 'block';

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Reset form after 3 seconds (optional)
        setTimeout(() => {
            rsvpForm.reset();
            rsvpForm.style.display = 'block';
            successMessage.style.display = 'none';
            guestCountGroup.style.display = 'none';
        }, 5000);
    });
});

// Save RSVP to localStorage
function saveRSVP(rsvpData) {
    let rsvps = JSON.parse(localStorage.getItem('weddingRSVPs') || '[]');
    
    // Check if email already exists
    const existingIndex = rsvps.findIndex(r => r.email === rsvpData.email);
    
    if (existingIndex !== -1) {
        // Update existing RSVP
        rsvps[existingIndex] = rsvpData;
    } else {
        // Add new RSVP
        rsvps.push(rsvpData);
    }
    
    localStorage.setItem('weddingRSVPs', JSON.stringify(rsvps));
    
    // Also try to send to server if endpoint exists (for production)
    sendRSVPToServer(rsvpData);
}

// Airtable Configuration
// Credentials are loaded from config.js (which is in .gitignore)
// If config.js doesn't exist, these will be undefined and Airtable integration will be skipped
const AIRTABLE_BASE_ID = typeof AIRTABLE_CONFIG !== 'undefined' ? AIRTABLE_CONFIG.BASE_ID : undefined;
const AIRTABLE_API_KEY = typeof AIRTABLE_CONFIG !== 'undefined' ? AIRTABLE_CONFIG.API_KEY : undefined;
const AIRTABLE_TABLE_NAME = typeof AIRTABLE_CONFIG !== 'undefined' ? AIRTABLE_CONFIG.TABLE_NAME : 'RSVPs';

// Send RSVP to Airtable
async function sendRSVPToServer(rsvpData) {
    // Skip if credentials are not configured
    if (AIRTABLE_BASE_ID === 'YOUR_AIRTABLE_BASE_ID' || AIRTABLE_API_KEY === 'YOUR_AIRTABLE_API_KEY') {
        console.log('Airtable not configured. RSVP saved to localStorage only.');
        return;
    }

    try {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    'Guest Name': rsvpData.guestName,
                    'Email': rsvpData.email,
                    'Phone': rsvpData.phone || '',
                    'Attendance': rsvpData.attendance,
                    'Guest Count': rsvpData.guestCount || '0',
                    'Dietary Restrictions': rsvpData.dietary || '',
                    'Message': rsvpData.message || '',
                    'Submitted At': rsvpData.submittedAt
                }
            })
        });

        if (response.ok) {
            console.log('RSVP successfully saved to Airtable');
        } else {
            const errorData = await response.json();
            console.error('Airtable API error:', errorData);
        }
    } catch (error) {
        console.error('Error sending RSVP to Airtable:', error);
        // Data is still saved in localStorage as backup
    }
}

// Get all RSVPs from localStorage
function getAllRSVPs() {
    return JSON.parse(localStorage.getItem('weddingRSVPs') || '[]');
}

// Sidebar Navigation Handler
function initSidebarNavigation() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('detailsSidebar');
    const navLinks = document.querySelectorAll('.nav-link');
    const detailSections = document.querySelectorAll('.detail-section');

    // Toggle sidebar on mobile
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('hidden');
            const isHidden = sidebar.classList.contains('hidden');
            const toggleIcon = sidebarToggle.querySelector('.toggle-icon');
            if (toggleIcon) {
                toggleIcon.textContent = isHidden ? '☰' : '✕';
            }
        });
    }

    // Handle navigation link clicks - scroll to sections
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to target section smoothly
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                // Calculate offset for sticky sidebar
                const offset = 20;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }

            // Hide sidebar on mobile after selection
            if (window.innerWidth <= 768 && sidebar && sidebarToggle) {
                sidebar.classList.add('hidden');
                const toggleIcon = sidebarToggle.querySelector('.toggle-icon');
                if (toggleIcon) {
                    toggleIcon.textContent = '☰';
                }
            }
        });
    });

    // Update active nav link based on scroll position
    function updateActiveNavLink() {
        const scrollPosition = window.pageYOffset + 100; // Offset for better detection

        detailSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active from all links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Add active to corresponding link
                const correspondingLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    // Update active nav on scroll
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Initial check
    updateActiveNavLink();

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Show sidebar on desktop, hide on mobile by default
            if (window.innerWidth > 768 && sidebar) {
                sidebar.classList.remove('hidden');
            } else if (window.innerWidth <= 768 && sidebar) {
                sidebar.classList.add('hidden');
            }
        }, 250);
    });

    // Initial check for mobile
    if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.add('hidden');
    }
}

// Export for use in admin page
if (typeof window !== 'undefined') {
    window.weddingRSVP = {
        saveRSVP,
        getAllRSVPs
    };
}
