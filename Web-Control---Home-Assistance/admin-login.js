// admin-login.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Check if user is admin
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists && userDoc.data().role === 'admin' && userDoc.data().status === 'approved') {
                window.location.href = 'admin-panel.html';
            } else {
                showMessage('Access denied. Admin privileges required.');
                await auth.signOut();
            }
        }
    });

    // Google Sign-in for admin
    document.getElementById("adminGoogleBtn").onclick = async function () {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            
            // Check if user exists in Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Check if user is in admin emails list
                const isAdmin = ADMIN_EMAILS.includes(user.email);
                
                if (!isAdmin) {
                    showMessage('Only administrators can access this panel. Please use regular login.');
                    await auth.signOut();
                    return;
                }
                
                // Create new admin user
                await db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                    photoURL: user.photoURL,
                    status: 'approved',
                    role: 'admin',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    isAdminEmail: true
                });
                
                // Redirect to admin panel
                window.location.href = 'admin-panel.html';
                
            } else {
                // Update last login
                await db.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                const userData = userDoc.data();
                
                // Check if user is admin and approved
                if (userData.role === 'admin' && userData.status === 'approved') {
                    window.location.href = 'admin-panel.html';
                } else {
                    showMessage('Access denied. Admin privileges required.');
                    await auth.signOut();
                }
            }
            
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            showMessage('Authentication failed: ' + error.message);
        }
    };
});

function showMessage(message) {
    let messageDiv = document.getElementById('auth-message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'auth-message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = message;
    messageDiv.style.background = message.includes('pending') ? '#ff9800' : 
                                 message.includes('approved') ? '#4CAF50' : '#f44336';
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}