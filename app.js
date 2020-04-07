document.addEventListener("DOMContentLoaded", () => {
  console.log("%cDOM Content Loaded and Parsed!", "color: magenta")

  //Fetching the existing data and sending it to the the createUserCard function.
  function getExistingUserData() {
    fetch("http://localhost:3000/users")
      .then((response) => response.json())
      .then((users) =>
        users.forEach((user) => {
          createUserCard(user)
        })
      )
  }

  getExistingUserData()

  //Global variable declarations
  const newUserForm = document.querySelector("#add-new-user")
  const formSection = document.querySelector("#forms-section")
  const userCardContainer = document.querySelector("#user-card-container")

  //Making the Add User Form in our HTML functional, so that it sends data to
  //the backend.
  newUserForm.addEventListener("submit", (event) => {
    event.preventDefault()
    const formData = new FormData(newUserForm)
    const name = formData.get("name")
    const username = formData.get("username")
    const email = formData.get("email")
    const password = formData.get("password")
    const newUser = {
      user: {
        name: name,
        username: username,
        email: email,
        password: password,
      },
    }
    createUserCard(newUser.user)

    fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
      .then((response) => response.json())
      .then((result) => handleUserResponse(result, newUserForm, true))
  })

  //This is the function that creates new user cards.
  function createUserCard(user) {
    const userCard = document.createElement("div")
    userCard.className = "user-card"
    userCard.id = user.id
    const name = document.createElement("h3")
    const username = document.createElement("p")
    const email = document.createElement("p")
    const editButton = document.createElement("button")

    name.innerText = user.name
    name.id = `user${user.id}-name`
    username.innerText = user.username
    username.id = `user${user.id}-username`
    email.innerText = user.email
    email.id = `user${user.id}-email`
    editButton.innerText = "Edit User"

    userCard.append(name, username, email, editButton, createDeleteButton(user))
    userCardContainer.append(userCard)
    editButton.addEventListener("click", () => {
      event.preventDefault()
      editUserCard(user)
    })
  }

  function createDeleteButton(user, event) {
    const deleteButton = document.createElement("button")
    deleteButton.innerText = "Delete"
    deleteButton.addEventListener("click", () => {
      deleteUser(user)
    })
    return deleteButton
  }

  function deleteUser(user) {
    // console.log(user)

    const userCard = document.getElementById(user.id)
    userCard.remove()

    fetch(`http://localhost:3000/users/${user.id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((result) => console.log(result))
  }

  //Function to edit existing user cards.
  function editUserCard(user) {
    const editUserForm = document.createElement("form")
    const nameInput = document.createElement("input")
    const usernameInput = document.createElement("input")
    const emailInput = document.createElement("input")
    const passwordInput = document.createElement("input")
    const submitButton = document.createElement("button")

    nameInput.name = "name"
    nameInput.value = user.name

    usernameInput.name = "username"
    usernameInput.value = user.username

    emailInput.name = "email"
    emailInput.value = user.email

    passwordInput.name = "password"
    passwordInput.placeholder = "password"
    passwordInput.type = "password"

    submitButton.innerText = "Update"
    submitButton.type = "submit"

    editUserForm.append(
      nameInput,
      usernameInput,
      emailInput,
      passwordInput,
      submitButton
    )

    formSection.appendChild(editUserForm)

    submitButton.addEventListener("click", () => {
      event.preventDefault()
      patchUserInfo(user, editUserForm)
    })
  }

  function patchUserInfo(user, form) {
    const formData = new FormData(form)
    const name = formData.get("name")
    const username = formData.get("username")
    const email = formData.get("email")
    const password = formData.get("password")
    const updatedUser = {
      user: {
        name: name,
        username: username,
        email: email,
        password: password,
      },
    }

    updateUserCard(updatedUser.user, user.id)

    fetch(`http://localhost:3000/users/${user.id}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    })
      .then((response) => response.json())
      .then((result) => handleUserResponse(result, newUserForm, false))
  }

  function updateUserCard(user, id) {
    // console.log(userCard)
    // console.log(user)
    // console.log(id)
    event.preventDefault()
    const name = document.querySelector(`#user${id}-name`)
    name.innerText = user.name

    const username = document.querySelector(`#user${id}-username`)
    username.innerText = user.username

    const email = document.querySelector(`#user${id}-email`)
    email.innerText = user.email
  }

  function handleUserResponse(response, form, newUser) {
    const errorMessage = document.getElementById("response-error-message")
    if (errorMessage) {
      newUserForm.removeChild(errorMessage)
    }
    if (response.user && newUser) {
      createUserCard(response.user)
      form.reset()
    } else {
      const responseKeys = Obect.keys(response)
      const responseMessage = document.createElement("ul")

      responseMessage.id = "response-error-message"
      responseMessage.innerText =
        "We were unable to create this user instance for the following reasons:"
      responseKeys.forEach((responseKey) => {
        const li = document.createElement("li")
        li.innerText = response[responseKey]
        responseMessage.append(li)
      })
      newUserForm.append(responseMessage)
    }
  }
})
