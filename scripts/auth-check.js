auth.onAuthStateChanged(async (user) => {

    // NOT LOGGED IN → redirect to login page inside /login/
    if (!user) {
        window.location.href = "../login.html";
        return;
    }

    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
        await auth.signOut();
        window.location.href = "../login.html";
        return;
    }

    const data = userDoc.data();

    // ONLY APPROVED USERS CAN ACCESS
    if (data.status !== "approved") {
        alert(`Your account is ${data.status}. Contact admin.`);
        await auth.signOut();
        window.location.href = "../login.html";
        return;
    }

    console.log("User is approved ✔");
});
