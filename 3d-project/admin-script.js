// admin-script.js
let currentUser = null;
let users = [];

// Check admin authentication
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists && userDoc.data().role === 'admin') {
            currentUser = user;
            document.getElementById('admin-name').textContent = user.displayName;
            document.getElementById('admin-avatar').src = user.photoURL || 'https://via.placeholder.com/40';
            loadUsers();
            setupRealTimeUpdates();
        } else {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }
});

// Load users from Firestore
async function loadUsers() {
    try {
        const querySnapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
        users = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            users.push({ 
                id: doc.id, 
                ...data,
                // Format dates for display
                createdAt: data.createdAt ? data.createdAt.toDate() : null,
                lastLogin: data.lastLogin ? data.lastLogin.toDate() : null
            });
        });
        updateUserStats();
        renderUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error loading users', 'error');
    }
}

// Real-time updates
function setupRealTimeUpdates() {
    db.collection('users').onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' || change.type === 'modified') {
                loadUsers();
            }
        });
    });
}

// Update statistics
function updateUserStats() {
    const pending = users.filter(u => u.status === 'pending').length;
    const approved = users.filter(u => u.status === 'approved').length;
    const rejected = users.filter(u => u.status === 'rejected').length;
    const total = users.length;
    
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('approved-count').textContent = approved;
    document.getElementById('rejected-count').textContent = rejected;
    document.getElementById('total-count').textContent = total;
}

// Render users table
function renderUsers(userList) {
    const tbody = document.getElementById('users-table-body');
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    
    // Filter users
    let filteredUsers = userList.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                            user.email.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>
                <div class="user-cell">
                    <img src="${user.photoURL || 'https://via.placeholder.com/32'}" 
                         class="user-avatar-small" 
                         alt="${user.name}"
                         onerror="this.src='https://via.placeholder.com/32'">
                    <span>${user.name}</span>
                    ${user.isAdminEmail ? '<span style="color: #ff9800; font-size: 12px;">(Admin Email)</span>' : ''}
                </div>
            </td>
            <td>${user.email}</td>
            <td>
                <span class="status-badge status-${user.status}">
                    ${user.status}
                </span>
                ${user.role === 'admin' ? '<br><small style="color: #666;">Admin</small>' : ''}
            </td>
            <td>${formatDate(user.createdAt)}</td>
            <td>${user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
            <td>
                <div class="action-buttons">
                    ${user.status !== 'approved' && !user.isAdminEmail ? 
                        `<button onclick="updateUserStatus('${user.id}', 'approved')" 
                                class="btn btn-approve">Approve</button>` : ''}
                    ${user.status !== 'rejected' && !user.isAdminEmail ? 
                        `<button onclick="updateUserStatus('${user.id}', 'rejected')" 
                                class="btn btn-reject">Reject</button>` : ''}
                    ${user.role !== 'admin' && !user.isAdminEmail ? 
                        `<button onclick="deleteUser('${user.id}')" 
                                class="btn btn-delete">Delete</button>` : ''}
                    ${user.role === 'admin' ? '<span style="color: #666; font-size: 12px;">Admin Account</span>' : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Update user status
async function updateUserStatus(userId, status) {
    if (!confirm(`Are you sure you want to ${status} this user?`)) return;
    
    try {
        await db.collection('users').doc(userId).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            reviewedBy: currentUser.uid,
            reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast(`User ${status} successfully`, 'success');
        
        // If approving, you could send email notification here
        // sendApprovalEmail(userId);
        
    } catch (error) {
        console.error('Error updating user:', error);
        showToast('Error updating user', 'error');
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
        // Optional: Also delete from Firebase Auth
        // await auth.deleteUser(userId); // This requires Admin SDK on server
        
        await db.collection('users').doc(userId).delete();
        showToast('User deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Error deleting user', 'error');
    }
}

// Format date
function formatDate(date) {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Setup search and filter
document.getElementById('search-input').addEventListener('input', () => renderUsers(users));
document.getElementById('status-filter').addEventListener('change', () => renderUsers(users));

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}