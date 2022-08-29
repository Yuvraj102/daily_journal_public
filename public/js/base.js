if (window.location.search.includes("refresh")) {
  window.location.href = "/";
}

const followButton = document.querySelector(".profile__button");
const profileEmail = document.querySelector(".profile__email");
const loggedInEmail = document.querySelector(".profile__loggedInEmail");
const pencilButton = document.querySelector(".pencil__button");
const profileTextarea = document.querySelector(".profile__description");
const profileSaveButton = document.querySelector(".pencil__save");
const postSubmitButton = document.querySelector(".singInPopup__main__link");

const heartIcon = document.querySelector(".heart__icon");
const createForm = document.querySelector(".create__form");
// createForm?.addEventListener("load", function () {
//   postSubmitButton.disabled = false;
// });
// postSubmitButton?.addEventListener("click", function () {
//   postSubmitButton.disabled = true;
// });

const createFormFileInput = document.querySelector(
  ".create__form__input__file"
);

createFormFileInput?.addEventListener("change", function () {
  if (this.files.length > 4) {
    alert("Cannot add more than 4 images");
    postSubmitButton.disabled = true;
  } else {
    postSubmitButton.disabled = false;
  }
});

heartIcon?.addEventListener("click", async function (event) {
  if (heartIcon.style.fill === "crimson") {
    return;
  }
  heartIcon.style.fill = "crimson";
  const postIdArr = window.location.href.split("/");

  const response = await fetch(
    `/post/like/${postIdArr[postIdArr.length - 1]}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );
  const responseObj = await response.json();
  console.log(responseObj);
});

followButton.addEventListener("click", async (event) => {
  // check if the user wants to follow or unfollow

  if (profileEmail.innerText === loggedInEmail.innerText) {
    alert("tryna follow yourself huh !!");
    return;
  } else if (event.target.innerText === "FOLLOW") {
    const response = await fetch(`/profile/follow/${profileEmail.innerText}`, {
      method: "POST",
    });
    const responseObj = await response.json(); //parses the json into js object
    if (responseObj.status.includes("success")) {
      window.location.reload();
    } else if (responseObj.status.includes("fail")) {
      alert("Error occured contact developer");
      console.log(responseObj.error);
    }
    console.log("total obj>>", responseObj);
    // send a follow request
  } else {
    // send an unfollow request >> BUILD THIS
    const response = await fetch(
      `/profile/unfollow/${profileEmail.innerText}`,
      {
        method: "POST",
      }
    );
    const responseObj = await response.json(); //parses the json into js object
    if (responseObj.status.includes("success")) {
      window.location.reload();
    } else if (responseObj.status.includes("fail")) {
      alert("Error occured contact developer");
      console.log(responseObj.error);
    }
    console.log("total obj>>", responseObj);
  }
});

pencilButton.addEventListener("click", () => {
  if (profileTextarea.readOnly) {
    // remove readonly
    profileTextarea.removeAttribute("readonly");
    profileSaveButton.style.display = "inherit";
  } else {
    profileSaveButton.style.display = "none";
    profileTextarea.setAttribute("readonly", "true");
  }
});

profileSaveButton.addEventListener("click", async (event) => {
  // send update request /user/bio
  // console.log("Hello people", );

  const response = await fetch("/user/bio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bioText: profileTextarea.value }),
  });
  const responseObj = await response.json();
  // console.log(">>", responseObj);
  if (responseObj.status.includes("fail")) {
    alert("failed to update");
    window.location.reload();
    // hide button
  } else {
    // hide button
    window.location.reload();
  }
});
