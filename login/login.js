// login.js - Add this to your login.html
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Check user status
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData.status === 'approved') {
                    window.location.href = '../index.html';
                } else {
                    showMessage(`Your account is ${userData.status}. Please contact administrator.`);
                    await auth.signOut();
                }
            }
        }
    });

    // Google Sign-in
    document.getElementById("googleBtn").onclick = async function () {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            
            // Check if user exists in Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Determine if user is admin
                const isAdmin = ADMIN_EMAILS.includes(user.email);
                
                // Create new user document
                await db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                    photoURL: user.photoURL,
                    status: isAdmin ? 'approved' : 'pending',
                    role: isAdmin ? 'admin' : 'user',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    isAdminEmail: isAdmin
                });
                
                if (!isAdmin) {
                    showMessage('Your account is pending approval by an administrator. You will receive an email when approved.');
                    await auth.signOut();
                    return;
                }
            } else {
                // Update last login
                await db.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                const userData = userDoc.data();
                if (userData.status !== 'approved') {
                    showMessage(`Account is ${userData.status}. Please contact administrator.`);
                    await auth.signOut();
                    return;
                }
            }
            
            // Redirect based on role
            const userData = userDoc.exists ? userDoc.data() : { role: isAdmin ? 'admin' : 'user' };
            
            if (userData.role === 'admin') {
                window.location.href = 'index.html';
            } else {
                window.location.href = 'index.html';
            }
            
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            showMessage('Authentication failed: ' + error.message);
        }
    };
});

function showMessage(message) {
    // Create or show message element
    let messageDiv = document.getElementById('auth-message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'auth-message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff9800;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        document.body.appendChild(messageDiv);
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    messageDiv.textContent = message;
    messageDiv.style.background = message.includes('pending') ? '#ff9800' : 
                                 message.includes('approved') ? '#4CAF50' : '#f44336';
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}