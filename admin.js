// Admin Page Script
document.addEventListener('DOMContentLoaded', function() {
    const rsvpList = document.getElementById('rsvpList');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const exportBtn = document.getElementById('exportBtn');
    const noResults = document.getElementById('noResults');

    let currentFilter = 'all';
    let allRSVPs = [];

    // Load and display RSVPs
    function loadRSVPs() {
        allRSVPs = window.weddingRSVP ? window.weddingRSVP.getAllRSVPs() : getAllRSVPs();
        updateStats();
        displayRSVPs(allRSVPs);
    }

    // Fallback function if window.weddingRSVP is not available
    function getAllRSVPs() {
        return JSON.parse(localStorage.getItem('weddingRSVPs') || '[]');
    }

    // Update statistics
    function updateStats() {
        const total = allRSVPs.length;
        const attending = allRSVPs.filter(r => r.attendance === 'yes').length;
        const notAttending = allRSVPs.filter(r => r.attendance === 'no').length;
        const totalGuests = allRSVPs
            .filter(r => r.attendance === 'yes')
            .reduce((sum, r) => sum + parseInt(r.guestCount || 1), 0);

        document.getElementById('totalRSVPs').textContent = total;
        document.getElementById('attendingCount').textContent = attending;
        document.getElementById('notAttendingCount').textContent = notAttending;
        document.getElementById('totalGuests').textContent = totalGuests;
    }

    // Display RSVPs
    function displayRSVPs(rsvps) {
        if (rsvps.length === 0) {
            rsvpList.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        rsvpList.style.display = 'grid';
        noResults.style.display = 'none';

        // Sort by submission date (newest first)
        rsvps.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        rsvpList.innerHTML = rsvps.map(rsvp => createRSVPItem(rsvp)).join('');
    }

    // Create RSVP item HTML
    function createRSVPItem(rsvp) {
        const attendanceLabels = {
            'yes': 'Attending',
            'no': 'Not Attending',
            'maybe': 'Maybe'
        };

        const attendanceClass = rsvp.attendance === 'yes' ? 'attending' : 
                               rsvp.attendance === 'no' ? 'not-attending' : 'maybe';

        const submittedDate = new Date(rsvp.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="rsvp-item" data-attendance="${rsvp.attendance}">
                <div class="rsvp-header">
                    <div class="rsvp-name">${escapeHtml(rsvp.guestName)}</div>
                    <span class="rsvp-badge ${attendanceClass}">${attendanceLabels[rsvp.attendance]}</span>
                </div>
                <div class="rsvp-details">
                    <div class="rsvp-detail-item">
                        <span class="rsvp-detail-label">Email</span>
                        <span class="rsvp-detail-value">${escapeHtml(rsvp.email)}</span>
                    </div>
                    ${rsvp.phone ? `
                    <div class="rsvp-detail-item">
                        <span class="rsvp-detail-label">Phone</span>
                        <span class="rsvp-detail-value">${escapeHtml(rsvp.phone)}</span>
                    </div>
                    ` : ''}
                    ${rsvp.attendance === 'yes' && rsvp.guestCount ? `
                    <div class="rsvp-detail-item">
                        <span class="rsvp-detail-label">Guests</span>
                        <span class="rsvp-detail-value">${rsvp.guestCount}</span>
                    </div>
                    ` : ''}
                    <div class="rsvp-detail-item">
                        <span class="rsvp-detail-label">Submitted</span>
                        <span class="rsvp-detail-value">${submittedDate}</span>
                    </div>
                </div>
                ${rsvp.dietary ? `
                <div class="rsvp-message">
                    <div class="rsvp-message-label">Dietary Restrictions:</div>
                    <div class="rsvp-message-text">${escapeHtml(rsvp.dietary)}</div>
                </div>
                ` : ''}
                ${rsvp.message ? `
                <div class="rsvp-message">
                    <div class="rsvp-message-label">Message:</div>
                    <div class="rsvp-message-text">${escapeHtml(rsvp.message)}</div>
                </div>
                ` : ''}
            </div>
        `;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Filter RSVPs
    function filterRSVPs() {
        let filtered = allRSVPs;

        // Apply attendance filter
        if (currentFilter !== 'all') {
            filtered = filtered.filter(r => r.attendance === currentFilter);
        }

        // Apply search filter
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(r => 
                r.guestName.toLowerCase().includes(searchTerm) ||
                r.email.toLowerCase().includes(searchTerm)
            );
        }

        displayRSVPs(filtered);
    }

    // Event Listeners
    searchInput.addEventListener('input', filterRSVPs);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterRSVPs();
        });
    });

    // Export to CSV
    exportBtn.addEventListener('click', function() {
        const csv = convertToCSV(allRSVPs);
        downloadCSV(csv, 'wedding-rsvps.csv');
    });

    // Convert RSVPs to CSV
    function convertToCSV(rsvps) {
        const headers = ['Name', 'Email', 'Phone', 'Attendance', 'Guest Count', 'Dietary Restrictions', 'Message', 'Submitted At'];
        const rows = rsvps.map(rsvp => [
            rsvp.guestName,
            rsvp.email,
            rsvp.phone || '',
            rsvp.attendance,
            rsvp.guestCount || '',
            rsvp.dietary || '',
            rsvp.message || '',
            new Date(rsvp.submittedAt).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    // Download CSV file
    function downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Initial load
    loadRSVPs();

    // Refresh every 30 seconds to catch new RSVPs
    setInterval(loadRSVPs, 30000);
});
