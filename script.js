document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Load initial data
    fetchLeadsData();
    
    // Set up auto-refresh
    setupAutoRefresh();
    
    // Manual refresh button
    document.getElementById('manual-refresh').addEventListener('click', function() {
        fetchLeadsData();
        resetRefreshTimer();
    });
});

function fetchLeadsData() {
    fetch('https://ld-trake.vercel.app/api.php?action=get_leads')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                updateDashboard(data.data);
            } else {
                console.error('Error in response:', data.message);
                showError('Failed to load leads data: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error fetching leads data:', error);
            showError('Failed to load leads data. Please check your connection and try again.');
        });
}

function updateDashboard(data) {
    // Update counters
    document.getElementById('total-leads').textContent = data.total_leads.toLocaleString();
    document.getElementById('today-leads').textContent = data.today_leads.toLocaleString();
    
    // Update last updated time
    const now = new Date();
    document.getElementById('last-updated').textContent = now.toLocaleString();
    
    // Update recent leads table
    updateLeadsTable(data.recent_leads);
}

function updateLeadsTable(leads) {
    const tableBody = document.getElementById('leads-table-body');
    tableBody.innerHTML = '';
    
    if (leads.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="no-leads">No leads found</td>';
        tableBody.appendChild(row);
        return;
    }
    
    leads.forEach(lead => {
        const row = document.createElement('tr');
        row.classList.add('new-lead');
        
        // Format datetime for better readability
        const leadDate = new Date(lead.datetime);
        const formattedDate = leadDate.toLocaleString();
        
        row.innerHTML = `
            <td>${lead.offer_id || 'N/A'}</td>
            <td>${lead.offer_name || 'Unknown Offer'}</td>
            <td>${formattedDate}</td>
            <td>${lead.country || 'Unknown'}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function setupAutoRefresh() {
    let countdown = 10;
    const countdownElement = document.getElementById('refresh-countdown');
    
    const refreshInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            fetchLeadsData();
            resetRefreshTimer();
        }
    }, 1000);
    
    window.refreshInterval = refreshInterval;
}

function resetRefreshTimer() {
    clearInterval(window.refreshInterval);
    document.getElementById('refresh-countdown').textContent = '10';
    setupAutoRefresh();
}

function showError(message) {
    const tableBody = document.getElementById('leads-table-body');
    tableBody.innerHTML = `
        <tr>
            <td colspan="4" class="no-leads" style="color: var(--danger-color);">
                ${message}
            </td>
        </tr>
    `;
}
