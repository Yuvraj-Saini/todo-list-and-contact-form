class TodoApp {
  constructor() {
    this.todos = []
    this.todoIdCounter = 1

    
    this.todoForm = document.getElementById("todoForm")
    this.todoInput = document.getElementById("todoInput")
    this.todoList = document.getElementById("todoList")
    this.todoCount = document.getElementById("todoCount")
    this.emptyState = document.getElementById("emptyState")


    this.bindEvents()

 
    this.loadTodos()

 
    this.render()
  }

  bindEvents() {
    this.todoForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.addTodo()
    })
  }

  addTodo() {
    const text = this.todoInput.value.trim()

    if (text === "") {
      this.showInputError()
      return
    }

    const todo = {
      id: this.todoIdCounter++,
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    this.todos.push(todo)
    this.todoInput.value = ""
    this.saveTodos()
    this.render()


    this.showSuccessMessage()
  }

  deleteTodo(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`)

    if (todoElement) {
      todoElement.classList.add("removing")

      setTimeout(() => {
        this.todos = this.todos.filter((todo) => todo.id !== id)
        this.saveTodos()
        this.render()
      }, 300)
    }
  }

  toggleTodo(id) {
    const todo = this.todos.find((todo) => todo.id === id)
    if (todo) {
      todo.completed = !todo.completed
      this.saveTodos()
      this.render()
    }
  }

  render() {
    this.renderTodos()
    this.updateStats()
    this.toggleEmptyState()
  }

  renderTodos() {
    this.todoList.innerHTML = ""

    this.todos.forEach((todo) => {
      const todoElement = this.createTodoElement(todo)
      this.todoList.appendChild(todoElement)
    })
  }

  createTodoElement(todo) {
    const li = document.createElement("li")
    li.className = `todo-item ${todo.completed ? "completed" : ""}`
    li.setAttribute("data-id", todo.id)
    li.setAttribute("role", "listitem")

    li.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? "checked" : ""}
                aria-label="Mark as ${todo.completed ? "incomplete" : "complete"}"
            >
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <button class="delete-btn" aria-label="Delete todo item">
                Delete
            </button>
        `

    const checkbox = li.querySelector(".todo-checkbox")
    const deleteBtn = li.querySelector(".delete-btn")

    checkbox.addEventListener("change", () => {
      this.toggleTodo(todo.id)
    })

    deleteBtn.addEventListener("click", () => {
      this.deleteTodo(todo.id)
    })

    return li
  }

  updateStats() {
    const totalTodos = this.todos.length
    const completedTodos = this.todos.filter((todo) => todo.completed).length
    const remainingTodos = totalTodos - completedTodos

    let statsText = ""
    if (totalTodos === 0) {
      statsText = "0 tasks remaining"
    } else if (remainingTodos === 0) {
      statsText = `All ${totalTodos} tasks completed! 🎉`
    } else {
      statsText = `${remainingTodos} of ${totalTodos} tasks remaining`
    }

    this.todoCount.textContent = statsText
  }

  toggleEmptyState() {
    if (this.todos.length === 0) {
      this.emptyState.classList.remove("hidden")
      this.todoList.style.display = "none"
    } else {
      this.emptyState.classList.add("hidden")
      this.todoList.style.display = "block"
    }
  }

  showInputError() {
    this.todoInput.style.borderColor = "#dc3545"
    this.todoInput.style.boxShadow = "0 0 0 3px rgba(220, 53, 69, 0.1)"

    setTimeout(() => {
      this.todoInput.style.borderColor = "#e1e5e9"
      this.todoInput.style.boxShadow = "none"
    }, 2000)
  }

  showSuccessMessage() {
    const addBtn = document.querySelector(".add-btn")
    const originalContent = addBtn.innerHTML

    addBtn.innerHTML = "<span>✓</span>"
    addBtn.style.background = "#28a745"

    setTimeout(() => {
      addBtn.innerHTML = originalContent
      addBtn.style.background = ""
    }, 1000)
  }

  saveTodos() {
    try {
      localStorage.setItem("todos", JSON.stringify(this.todos))
      localStorage.setItem("todoIdCounter", this.todoIdCounter.toString())
    } catch (error) {
      console.warn("Could not save todos to localStorage:", error)
    }
  }

  loadTodos() {
    try {
      const savedTodos = localStorage.getItem("todos")
      const savedCounter = localStorage.getItem("todoIdCounter")

      if (savedTodos) {
        this.todos = JSON.parse(savedTodos)
      }

      if (savedCounter) {
        this.todoIdCounter = Number.parseInt(savedCounter, 10)
      }
    } catch (error) {
      console.warn("Could not load todos from localStorage:", error)
      this.todos = []
      this.todoIdCounter = 1
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

class FormValidator {
  constructor() {
    this.form = document.getElementById("contactForm")

   
    if (!this.form) {
      console.error("Contact form not found!")
      return
    }

    this.fields = {
      fullName: document.getElementById("fullName"),
      email: document.getElementById("email"),
      phone: document.getElementById("phone"),
      subject: document.getElementById("subject"),
      message: document.getElementById("message"),
      terms: document.getElementById("terms"),
    }

    this.submitBtn = this.form.querySelector(".submit-btn")
    this.successMessage = document.getElementById("successMessage")
    this.charCount = document.getElementById("charCount")

    this.validationRules = {
      fullName: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: /^[a-zA-Z\s'-]+$/,
        message: "Please enter a valid full name (letters, spaces, hyphens, and apostrophes only)",
      },
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address (e.g., user@example.com)",
      },
      phone: {
        required: false,
        pattern: /^[+]?[(]?[\d\s\-()]{10,}$/,
        message: "Please enter a valid phone number (at least 10 digits)",
      },
      subject: {
        required: true,
        message: "Please select a subject for your message",
      },
      message: {
        required: true,
        minLength: 10,
        maxLength: 500,
        message: "Message must be between 10 and 500 characters",
      },
      terms: {
        required: true,
        message: "You must agree to the Terms of Service and Privacy Policy",
      },
    }

    this.debounceTimers = {}
    this.bindEvents()
    this.initializeCharacterCounter()
  }

  bindEvents() {
   
    this.form.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleSubmit()
    })

  
    Object.keys(this.fields).forEach((fieldName) => {
      const field = this.fields[fieldName]

      if (!field) {
        console.warn(`Field ${fieldName} not found`)
        return
      }

     
      field.addEventListener("blur", () => {
        this.validateField(fieldName)
      })

      
      field.addEventListener("input", () => {
        this.clearFieldError(fieldName)

   
        if (this.debounceTimers[fieldName]) {
          clearTimeout(this.debounceTimers[fieldName])
        }

   
        this.debounceTimers[fieldName] = setTimeout(() => {
          this.validateField(fieldName, true)
        }, 800)
      })


      if (field.type === "checkbox") {
        field.addEventListener("change", () => {
          this.validateField(fieldName)
        })
      }
    })


    if (this.fields.message) {
      this.fields.message.addEventListener("input", () => {
        this.updateCharacterCounter()
      })
    }
  }

  initializeCharacterCounter() {
    this.updateCharacterCounter()
  }

  updateCharacterCounter() {
    if (!this.fields.message || !this.charCount) return

    const message = this.fields.message.value
    const count = message.length
    const maxLength = this.validationRules.message.maxLength

    this.charCount.textContent = count

    const counterElement = this.charCount.parentElement
    counterElement.classList.remove("warning", "danger")

    if (count > maxLength * 0.8) {
      counterElement.classList.add("warning")
    }
    if (count > maxLength * 0.95) {
      counterElement.classList.add("danger")
    }
  }

  validateField(fieldName, isRealTime = false) {
    const field = this.fields[fieldName]
    const rule = this.validationRules[fieldName]

    if (!field || !rule) return true

    const value = field.type === "checkbox" ? field.checked : field.value.trim()
    const formGroup = field.closest(".form-group")
    const errorElement = document.getElementById(`${fieldName}-error`)

    let isValid = true
    let errorMessage = ""

 
    if (rule.required) {
      if (field.type === "checkbox" && !value) {
        isValid = false
        errorMessage = rule.message
      } else if (field.type !== "checkbox" && !value) {
        isValid = false
        errorMessage = `${this.getFieldLabel(fieldName)} is required`
      }
    }


    if (!rule.required && !value) {
      isValid = true
    }
   
    else if (value && rule.pattern && field.type !== "checkbox" && !rule.pattern.test(value)) {
      isValid = false
      errorMessage = rule.message
    }
  
    else if (value && rule.minLength && field.type !== "checkbox" && value.length < rule.minLength) {
      isValid = false
      errorMessage = `${this.getFieldLabel(fieldName)} must be at least ${rule.minLength} characters`
    } else if (value && rule.maxLength && field.type !== "checkbox" && value.length > rule.maxLength) {
      isValid = false
      errorMessage = `${this.getFieldLabel(fieldName)} must not exceed ${rule.maxLength} characters`
    }

  
    if (isValid) {
      if (formGroup) formGroup.classList.remove("error")
      if ((value && !isRealTime) || field.type === "checkbox") {
        if (formGroup) formGroup.classList.add("success")
      }
      if (errorElement) {
        errorElement.textContent = ""
        errorElement.classList.remove("show")
      }
    } else {
      if (formGroup) {
        formGroup.classList.remove("success")
        formGroup.classList.add("error")
      }
      if (errorElement) {
        errorElement.textContent = errorMessage
        errorElement.classList.add("show")
      }

    
      if (!isRealTime) {
        field.focus()
      }
    }

    return isValid
  }

  clearFieldError(fieldName) {
    const field = this.fields[fieldName]
    if (!field) return

    const formGroup = field.closest(".form-group")
    const errorElement = document.getElementById(`${fieldName}-error`)

    if (formGroup) formGroup.classList.remove("error")
    if (errorElement) errorElement.classList.remove("show")
  }

  validateForm() {
    let isFormValid = true
    let firstInvalidField = null

    Object.keys(this.fields).forEach((fieldName) => {
      const isFieldValid = this.validateField(fieldName)
      if (!isFieldValid) {
        isFormValid = false
        if (!firstInvalidField) {
          firstInvalidField = this.fields[fieldName]
        }
      }
    })


    if (firstInvalidField) {
      firstInvalidField.focus()
      firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" })
    }

    return isFormValid
  }

  async handleSubmit() {
    console.log("Form submitted!")


    if (this.successMessage) {
      this.successMessage.classList.remove("show")
    }

  
    const isValid = this.validateForm()

    if (!isValid) {
      this.showSubmitError("Please fix the errors above and try again.")
      return
    }

 
    this.setLoadingState(true)

    try {
 
      await this.simulateSubmission()

  
      this.showSuccess()

     
      setTimeout(() => {
        this.resetForm()
      }, 3000)
    } catch (error) {
      this.showSubmitError("Submission failed. Please try again.")
    } finally {
      this.setLoadingState(false)
    }
  }

  async simulateSubmission() {
 
    return new Promise((resolve, reject) => {
      const btnLoading = this.submitBtn?.querySelector(".btn-loading")

      setTimeout(() => {
        if (btnLoading) {
          btnLoading.innerHTML = `
            <span class="spinner"></span>
            Processing...
          `
        }
      }, 500)

      setTimeout(() => {
        if (btnLoading) {
          btnLoading.innerHTML = `
            <span class="spinner"></span>
            Sending message...
          `
        }
      }, 1500)

      setTimeout(() => {
      
        if (Math.random() > 0.02) {
          resolve()
        } else {
          reject(new Error("Network error"))
        }
      }, 2500)
    })
  }

  setLoadingState(isLoading) {
    if (!this.submitBtn) return

    const btnText = this.submitBtn.querySelector(".btn-text")
    const btnLoading = this.submitBtn.querySelector(".btn-loading")

    if (isLoading) {
      if (btnText) btnText.style.display = "none"
      if (btnLoading) btnLoading.style.display = "flex"
      this.submitBtn.disabled = true
    } else {
      if (btnText) btnText.style.display = "block"
      if (btnLoading) btnLoading.style.display = "none"
      this.submitBtn.disabled = false
    }
  }

  showSuccess() {
    if (!this.successMessage) return

  
    const fullName = this.fields.fullName?.value.trim() || "there"
    const email = this.fields.email?.value.trim() || "your email"

  
    const successContent = this.successMessage.querySelector(".success-content")
    if (successContent) {
      successContent.innerHTML = `
        <h3>Message received successfully!</h3>
        <p>Thank you ${fullName}! Your message has been received and we'll respond to ${email} within 24 hours.</p>
      `
    }

    this.successMessage.classList.add("show")

   
    setTimeout(() => {
      if (this.successMessage) {
        this.successMessage.classList.remove("show")
      }
    }, 8000)

  
    this.successMessage.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  showSubmitError(message = "Please fix the errors above and try again.") {
   
    const existingError = this.form?.querySelector(".form-error")
    if (existingError) {
      existingError.remove()
    }

    if (!this.submitBtn) return

   
    const errorDiv = document.createElement("div")
    errorDiv.className = "form-error"
    errorDiv.style.cssText = `
      background: linear-gradient(135deg, #f8d7da, #f5c6cb);
      color: #721c24;
      padding: 15px 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      border: 2px solid #f5c6cb;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideIn 0.3s ease;
    `
    errorDiv.innerHTML = `<span style="font-size: 1.2rem;">⚠️</span> ${message}`

    this.submitBtn.parentNode.insertBefore(errorDiv, this.submitBtn)

  
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.style.animation = "slideOut 0.3s ease forwards"
        setTimeout(() => errorDiv.remove(), 300)
      }
    }, 6000)

 
    errorDiv.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  resetForm() {
    if (!this.form) return

    this.form.reset()


    Object.keys(this.fields).forEach((fieldName) => {
      const field = this.fields[fieldName]
      if (!field) return

      const formGroup = field.closest(".form-group")
      const errorElement = document.getElementById(`${fieldName}-error`)

      if (formGroup) {
        formGroup.classList.remove("error", "success")
      }
      if (errorElement) {
        errorElement.textContent = ""
        errorElement.classList.remove("show")
      }
    })


    this.updateCharacterCounter()


    Object.keys(this.debounceTimers).forEach((key) => {
      if (this.debounceTimers[key]) {
        clearTimeout(this.debounceTimers[key])
      }
    })
  }

  getFieldLabel(fieldName) {
    const labels = {
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      subject: "Subject",
      message: "Message",
      terms: "Terms Agreement",
    }
    return labels[fieldName] || fieldName
  }
}


document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing form validator...")
  new FormValidator()
})


document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault()
    const submitBtn = document.querySelector(".submit-btn")
    if (submitBtn && !submitBtn.disabled) {
      submitBtn.click()
    }
  }
})
