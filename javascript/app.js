import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider,
    signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc, addDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
const firebaseConfig = {
 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();
const profilePicture = document.getElementById("profilePicture")
let spiner = document.getElementById("spiner")

let showPassword = document.getElementById("showPassword")
let passwordToggle = false;
showPassword && showPassword.addEventListener("click", () => {
    let password = document.getElementById("password")
    if (passwordToggle) {
        passwordToggle = false;
        showPassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" 
    width="32" height="32" viewBox="0 0 15 15"><path fill="currentColor"
     d="M7.5 9C5.186 9 3.561 7.848 2.497 6.666a9.368 9.368 0 0 1-1.449-2.164a5.065 5.065 0 0 1-.08-.18l-.004-.007v-.001L.5 4.5l-.464.186v.002l.003.004a2.107 2.107 0 0 0 .026.063l.078.173a10.367 10.367 0 0 0 1.61 2.406C2.94 8.652 4.814 10 7.5 10V9Zm7-4.5a68.887 68.887 0 0 1-.464-.186l-.003.008l-.015.035l-.066.145a9.37 9.37 0 0 1-1.449 2.164C11.44 7.848 9.814 9 7.5 9v1c2.686 0 4.561-1.348 5.747-2.666a10.365 10.365 0 0 0 1.61-2.406a6.164 6.164 0 0 0 .104-.236l.002-.004v-.001h.001L14.5 4.5ZM8 12V9.5H7V12h1Zm-6.646-1.646l2-2l-.708-.708l-2 2l.708.708Zm10.292-2l2 2l.708-.708l-2-2l-.708.708Z"/>
     </svg>`
        password.type = "password"

    }
    else {
        showPassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
        viewBox="0 0 20 20">
        <path fill="currentColor"
            d="M10 4.4C3.439 4.4 0 9.232 0 10c0 .766 3.439 5.6 10 5.6c6.56 0 10-4.834 10-5.6c0-.768-3.44-5.6-10-5.6zm0 9.907c-2.455 0-4.445-1.928-4.445-4.307c0-2.379 1.99-4.309 4.445-4.309s4.444 1.93 4.444 4.309c0 2.379-1.989 4.307-4.444 4.307zM10 10c-.407-.447.663-2.154 0-2.154c-1.228 0-2.223.965-2.223 2.154s.995 2.154 2.223 2.154c1.227 0 2.223-.965 2.223-2.154c0-.547-1.877.379-2.223 0z" />
    </svg>`
        passwordToggle = true;
        password.type = "text"
    }
})

const uploadFile = (file) => {

    return new Promise((resolve, reject) => {
        const mountainsRef = ref(storage, `images/${file.name}`);
        const uploadTask = uploadBytesResumable(mountainsRef, file);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        spiner.style.display = "none";
                        break;
                    case 'running':
                        spiner.style.display = "flex";
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                spiner.style.display = "none";
                reject(error)
            },
            () => {
                spiner.style.display = "none";
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    })
}



let getUserData = async (uid) => {
    spiner.style.display = "flex";
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            let email = document.getElementById("email")
            let fullName = document.getElementById("fullName")
            localStorage.setItem("fullName", docSnap.data().fullName);
            localStorage.setItem("picture", docSnap.data().picture);

            if (location.pathname === "/profile.html") {
                fullName.value = docSnap.data().fullName
                email.value = docSnap.data().email
                if (docSnap.data().picture) {
                    profilePicture.src = docSnap.data().picture
                }

            } else {
                fullName.innerHTML = docSnap.data().fullName
            }
            spiner.style.display = "none";

        } else {
            spiner.style.display = "none";
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `No show Data`,
            });;
        }

    } catch (err) {
        spiner.style.display = "none";
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `${err}`,
        });
        console.log(err)
    }
}

onAuthStateChanged(auth, (user) => {
    const uid = localStorage.getItem("uid")
    if (user && uid) {
        const uid = user.uid;
        getUserData(uid)

        if (location.pathname !== '/profile.html' && location.pathname !== "/blog.html" && location.pathname !== "/user.html" && location.pathname !== "/allblog.html") {
            location.href = "blog.html"
        }
    } else {
        if (location.pathname !== "/index.html" && location.pathname !== "/signup.html" && location.pathname !== "/start.html")
            location.href = "start.html"

    }
});

const loginBtn = document.getElementById("signInBtn")

loginBtn && loginBtn.addEventListener("click", () => {
    let email = document.getElementById("email")
    let password = document.getElementById("password")
    spiner.style.display = "flex";
    signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem("email", user.email);
            localStorage.setItem("uid", user.uid)
            spiner.style.display = "none";
            location.href = "blog.html"
            email.value = ""
            password.value = ""

        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            spiner.style.display = "none";
            Swal.fire({
                icon: "error",
                title: "ERROR !",
                text: errorMessage,
            });
            email.value = ""
            password.value = ""
        });

})


const signupBtn = document.getElementById("signupBtn")
signupBtn && signupBtn.addEventListener("click", () => {
    let fullName = document.getElementById("fullName")
    let email = document.getElementById("email")
    let password = document.getElementById("password")
    let phoneNo = document.getElementById("phone")
    spiner.style.display = "flex";
    if (fullName.value.trim() === "" || phoneNo.value.trim() === "") {
        spiner.style.display = "none";
        Swal.fire({
            icon: "error",
            title: "ERROR !",
            text: "Fill the form correctly.",
        });
    } else {
        createUserWithEmailAndPassword(auth, email.value, password.value)
            .then(async (userInfo) => {
                const user = userInfo.user;
                await setDoc(doc(db, "users", user.uid), {
                    fullName: fullName.value,
                    email: email.value,
                    phone: phoneNo.value,
                    password: password.value,
                });
                localStorage.setItem("email", user.email);
                localStorage.setItem("uid", user.uid)
                spiner.style.display = "none";
                fullName.value = ""
                email.value = ""
                password.value = ""
                phoneNo.value = ""
                console.log(user);
                await Swal.fire({
                    icon: "success",
                    title: "Welcome !",
                    text: user.email,
                });
                location.href = "blog.html"

            })
            .catch((err) => {
                let errorMessage;
                if (err.message.includes("invalid-email")) {
                    errorMessage = "Please enter a valid email";
                } else if (err.message.includes("wrong-password")) {
                    errorMessage = "Please enter correct password";
                } else if (err.message.includes("user-not-found")) {
                    errorMessage = "Please enter a registered email";
                } else if (err.message.includes("email-already-in-use")) {
                    errorMessage = "Please enter a new email";
                } else if (err.message.includes("weak-password")) {
                    errorMessage = "Please enter a password of minimum 6 characters";
                } else if (err.message.includes("network-request-failed")) {
                    errorMessage = "Please check your internet connection";
                }
                spiner.style.display = "none";
                console.log(err);
                Swal.fire({
                    icon: "error",
                    title: "ERROR !",
                    text: errorMessage || err.message,
                });
            });
    }
})

const LogOut = document.getElementById("Logout")

LogOut && LogOut.addEventListener("click", () => {

    signOut(auth).then(() => {
        location.href = "blog.html"
        console.log("logOut user done")
        localStorage.clear()
    }).catch((error) => {
        console.log("logOut====>", error)
    });
})

const fileInput = document.getElementById("fileInput")

fileInput && fileInput.addEventListener("change", () => {
    console.log(fileInput.files[0])
    profilePicture.src = URL.createObjectURL(fileInput.files[0])

})
let updatepage = document.getElementById("profilego")

updatepage && updatepage.addEventListener("click", () => {
    location.pathname = "/profile.html"
})
const cameraPro = document.getElementById("cameraPro")
const updateBtn = document.getElementById("updateBtn")
let updateBolean = false;
updateBtn && updateBtn.addEventListener("click", async () => {
    let email = document.getElementById("email")
    let fullName = document.getElementById("fullName")


    if (updateBolean) {
        let uid = localStorage.getItem("uid")
        email.disabled = true;
        fullName.disabled = true
        updateBolean = false;
        const imageUrl = await uploadFile(fileInput.files[0])
        spiner.style.display = "flex";
        const currentuserRef = doc(db, "users", uid);
        console.log(currentuserRef)
        await updateDoc(currentuserRef, {
            email: email.value,
            fullName: fullName.value,
            picture: imageUrl,
        });
        console.log("updated")
        spiner.style.display = "none";
        updateBtn.innerHTML = "Update profile";
        cameraPro.style.display = "none"


    } else {
        updateBolean = true;
        email.disabled = false;
        fullName.disabled = false
        updateBtn.innerHTML = "Updated Now";
        cameraPro.style.display = "flex"

    }
})
let googleBtn = document.getElementById("google-s")
googleBtn && googleBtn.addEventListener("click", () => {
    spiner.style.display = "flex";
    signInWithPopup(auth, provider)
        .then(async (result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            try {
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    uid: user.uid,
                    fullName: user.displayName,
                    picture: user.photoURL,

                });
                localStorage.setItem("uid", user.uid);
                localStorage.setItem("email", user.email);
                localStorage.setItem("uid", user.uid)
                spiner.style.display = "none";
                await Swal.fire({
                    icon: "success",
                    title: "Welcome !",
                    text: user.email,
                });
                location.href = "blog.html"

            } catch (err) {
                spiner.style.display = "none";
                console.log("Error", err);
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: `${err}`,
                });
            }
        })
        .catch((error) => {
            spiner.style.display = "none";
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            const errorCode = error.code;
            const errorMessage = error.message;
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `${errorCode}`,
            });
        });
})

const postBlog = document.getElementById("postBlog")

postBlog && postBlog.addEventListener("click", async () => {

    let title = document.getElementById("title")
    let body = document.getElementById("textarea")
    let email = localStorage.getItem("email")
    let uid = localStorage.getItem("uid")
    let fullName = localStorage.getItem("fullName")
    let picture = localStorage.getItem("picture")
    if (title.value.trim() === "" && body.value.trim() === "") {
        Swal.fire({
            icon: "error",
            title: "ERROR !",
            text: "Fill the form correctly.",
        });
    } else {
        try {
            const docRef = await addDoc(collection(db, "blog"), {
                fullName: fullName,
                email: email,
                useruid: uid,
                picture: picture,
                title: title.value,
                body: body.value,
                timestamp: serverTimestamp(),

            });
            console.log("blog save");
            title.value = ""
            body.value = ""
        } catch (err) {
            console.log("blog save", err)
        }
    }
})

// my blogs 

let getMyBlog = async () => {
    const uid = localStorage.getItem("uid")
    const q = query(collection(db, "blog"), where("useruid", "==", uid));
    const blogArea = document.getElementById("my-blogs")
    let currentUserId = localStorage.getItem("uid")
    const unsubscribe = onSnapshot(q, (querySnapshot) => {

        blogArea.innerHTML = "";
        querySnapshot.forEach(async (doc) => {
            console.log("doc.data().picture", typeof doc.data().picture)
            let date = new Date(doc.data().timestamp.seconds)
            blogArea.innerHTML += `
            <div class="mt-2 mb-2">
            <div class="head-blog mt-2">
                <div class="card border border-secondary-subtle rounded py-2">
                    <div class="card-header d-flex gap-4">
                        <img class="blog-avatar m-0"
                            src="${doc.data().picture && doc.data().picture !== "undefined" ? doc.data().picture : "asset/user-circle.jpg"}"
                            alt="">
                        <span class="d-flex flex-column justify-content-end">
                            <h5 class="card-title mb-3">${doc.data().title}</h5>
                            <h6 class="card-subtitle text-body-secondary">${doc.data().fullName} - ${date.toLocaleString()}</h6>
                        </span>
                    </div>
                    <div class="card-body">
                        <p class="card-text"> ${doc.data().body}</p>
                        <a href="javascript:void(0)" class="card-link seeAll" onclick="deleteBlog('${doc.id}')">Delete</a>
                        <a href="javascript:void(0)" class="card-link seeAll">Edit</a>
                    </div>
                </div>
            </div>
        </div>
         `
        });

    });
}

const deleteBlog = async (id) => {
    await deleteDoc(doc(db, "blog", id));
}

let getAllBlog = async () => {
   
    const q = query(collection(db, "blog"));
    const blogArea = document.getElementById("AllBlogsContainer")
    let currentUserId = localStorage.getItem("uid")
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        blogArea.innerHTML = "";
        querySnapshot.forEach(async (doc) => {
            let date = new Date(doc.data().timestamp.seconds)
            blogArea.innerHTML += `
            <div class="mt-2 mb-2">
            <div class="head-blog mt-2">
                <div class="card border border-secondary-subtle rounded py-2">
                    <div class="card-header d-flex gap-4">
                        <img class="blog-avatar m-0"
                            src="${doc.data().picture && doc.data().picture !== "undefined" ? doc.data().picture : "asset/user-circle.jpg"}"
                            alt="">
                        <span class="d-flex flex-column justify-content-end">
                            <h5 class="card-title mb-3">${doc.data().title}</h5>
                            <h6 class="card-subtitle text-body-secondary">${doc.data().fullName} - ${date.toLocaleString()}</h6>
                        </span>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${doc.data().body}</p>
                        <a href="user.html?uid=${doc.data().useruid
                }" class="card-link text-decoration-none">See all from this user</a>
                    </div>
                </div>
            </div>
    </div>
         `
        });

    });

}

const showSelectedUserBlogs = (selectedUid) => {
    let blogArea = document.getElementById("user-blog-add");
    let profileArea = document.getElementById("profile")
    const q = query(collection(db, "blog"), where("useruid", "==", selectedUid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        console.log(querySnapshot)
        blogArea.innerHTML = "";
        querySnapshot.forEach((doc) => {
            let date = new Date(doc.data().timestamp.seconds);
            profileArea.innerHTML=`
            <div class="card">
            <img width="10px"
                src="${doc.data().picture && doc.data().picture !== "undefined" ? doc.data().picture : "asset/user-circle.jpg"}"
                class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${doc.data().fullName}</h5>
                <p class="email">${doc.data().email}</p>
            </div>
        </div>
            
            `
            blogArea.innerHTML += `
          <section class="blog-display-area w-100 mt-4 d-flex flex-column gap-3">
          <div class="card border border-secondary-subtle rounded py-2">
              <div class="card-header d-flex gap-4">
                  <img class="blog-avatar m-0"
                      src="${doc.data().picture && doc.data().picture !== "undefined" ? doc.data().picture : "asset/user-circle.jpg"}"
                      alt="">
                  <span class="d-flex flex-column justify-content-end">
                      <h5 class="card-title mb-3">${doc.data().title}</h5>
                      <h6 class="card-subtitle mb-2 text-body-secondary">${doc.data().fullName} - ${date.toLocaleString()}</h6>
                  </span>
              </div>
              <div class="card-body">
                  <p class="card-text">${doc.data().body}</p>
                  <a href="javascript:void(0)" class="card-link text-decoration-none seeAll">See all from this
                      user</a>
              </div>
          </div>
      </section>
`
        });
    });
};

if (window.location.pathname == "/user.html") {
    const queryString = window.location.search;
    console.log(queryString)
    const urlParams = new URLSearchParams(queryString);
    const selectedUid = urlParams.get("uid");
    console.log(selectedUid)
    showSelectedUserBlogs(selectedUid);
}



window.location.pathname == "/blog.html" && getMyBlog()
window.location.pathname == "/index.html" && getAllBlog()
window.location.pathname == "/allblog.html" && getAllBlog()
window.deleteBlog = deleteBlog;
