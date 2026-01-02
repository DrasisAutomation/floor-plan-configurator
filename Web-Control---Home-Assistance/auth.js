// auth.js
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Check if user exists in Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create new user document with pending status
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL,
                status: 'pending', // pending, approved, rejected
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'user', // user, admin
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Show pending approval message
            showMessage('Your account is pending approval by an administrator.');
            await auth.signOut();
            return;
        }
        
        // Check if user is approved
        const userData = userDoc.data();
        if (userData.status !== 'approved') {
            showMessage(`Account is ${userData.status}. Please contact administrator.`);
            await auth.signOut();
            return;
        }
        
        // Update last login
        await db.collection('users').doc(user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Redirect to main page
        window.location.href = '/index-floor.html';
        
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        showMessage('Authentication failed: ' + error.message);
    }
}

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
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(messageDiv);
    }
    messageDiv.textContent = message;
    messageDiv.style.background = message.includes('pending') ? '#ff9800' : '#f44336';
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}