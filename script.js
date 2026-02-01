document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed.");

    const rsvpForm = document.getElementById('rsvpForm');

    // Initialize Sidebar Navigation
    initSidebarNavigation();

    if (rsvpForm) {
        console.log("rsvpForm found, adding event listeners.");
        const successMessage = document.getElementById('successMessage');
        const guestCountGroup = document.getElementById('guestCountGroup');
        const attendanceRadios = document.querySelectorAll('input[name="attendance"]');

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

        rsvpForm.addEventListener('submit', function(e) {
            console.log("Form submission intercepted.");
            e.preventDefault();

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

            saveRSVP(formData);

            rsvpForm.style.display = 'none';
            successMessage.style.display = 'block';
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    } else {
        console.error("CRITICAL: rsvpForm NOT found on the page even after DOMContentLoaded.");
    }
});

function saveRSVP(rsvpData) {
    let rsvps = JSON.parse(localStorage.getItem('weddingRSVPs') || '[]');
    const existingIndex = rsvps.findIndex(r => r.email === rsvpData.email);
    
    if (existingIndex !== -1) {
        rsvps[existingIndex] = rsvpData;
    } else {
        rsvps.push(rsvpData);
    }
    
    localStorage.setItem('weddingRSVPs', JSON.stringify(rsvps));
    sendRSVPToServer(rsvpData);
}

const AIRTABLE_BASE_ID = typeof AIRTABLE_CONFIG !== 'undefined' ? AIRTABLE_CONFIG.BASE_ID : undefined;
const AIRTABLE_API_KEY = typeof AIRTABLE_CONFIG !== 'undefined' ? AIRTABLE_CONFIG.API_KEY : undefined;
const AIRTABLE_TABLE_NAME = typeof AIRTABLE_CONFIG !== 'undefined' ? AIRTABLE_CONFIG.TABLE_NAME : 'RSVPs';

async function sendRSVPToServer(rsvpData) {
    console.log("sendRSVPToServer function CALLED.");

    if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
        console.log('Airtable not configured. RSVP saved to localStorage only.');
        return;
    }

    console.log('Sending RSVP to Airtable with data:', rsvpData);

    const payload = {
        fields: {
            'Guest Name': rsvpData.guestName,
            'Email': rsvpData.email,
            'Phone': rsvpData.phone || '',
            'Attendance': rsvpData.attendance,
            'Guest Count': parseInt(rsvpData.guestCount, 10) || 0,
            'Dietary Restrictions': rsvpData.dietary || '',
            'Message': rsvpData.message || '',
            'Submitted At': rsvpData.submittedAt
        }
    };

    console.log('Final payload for Airtable:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
         {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('RSVP successfully saved to Airtable');
        } else {
            const errorData = await response.json();
            console.error('Airtable API error:', errorData);
        }
    } catch (error) {
        console.error('Error sending RSVP to Airtable (fetch failed):', error);
    }
}

function getAllRSVPs() {
    return JSON.parse(localStorage.getItem('weddingRSVPs') || '[]');
}

function initSidebarNavigation() {
    const sidebar = document.getElementById('detailsSidebar');
    if (!sidebar) return;

    const sidebarToggle = document.getElementById('sidebarToggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const detailSections = document.querySelectorAll('.detail-section');

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('hidden');
        sidebarToggle.querySelector('.toggle-icon').textContent = sidebar.classList.contains('hidden') ? '☰' : '✕';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = document.getElementById(this.getAttribute('data-section'));
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            if (targetSection) {
                window.scrollTo({ top: targetSection.offsetTop - 20, behavior: 'smooth' });
            }
            if (window.innerWidth <= 768) {
                sidebar.classList.add('hidden');
                sidebarToggle.querySelector('.toggle-icon').textContent = '☰';
            }
        });
    });

    const updateActiveNavLink = () => {
        const scrollPosition = window.pageYOffset + 100;
        detailSections.forEach(section => {
            if (scrollPosition >= section.offsetTop && scrollPosition < section.offsetTop + section.offsetHeight) {
                navLinks.forEach(l => l.classList.remove('active'));
                const correspondingLink = document.querySelector(`.nav-link[data-section="${section.id}"]`);
                if (correspondingLink) correspondingLink.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink();

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('hidden');
        } else {
            sidebar.classList.add('hidden');
        }
    });

    if (window.innerWidth <= 768) sidebar.classList.add('hidden');
}

if (typeof window !== 'undefined') {
    window.weddingRSVP = {
        saveRSVP,
        getAllRSVPs
    };
}
