/* jshint esversion: 6 */
// Handle form submission
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent the default form submission

  // For demo: randomly choose success or error (replace with your own logic)
  const isSuccess = Math.random() > 0.5;
  const feedbackEl = document.getElementById("feedback");

  // Show feedback container
  feedbackEl.style.display = "block";

  if (isSuccess) {
    feedbackEl.textContent = "تم الإرسال بنجاح!";
    feedbackEl.classList.remove("error");
    feedbackEl.classList.add("success");
  } else {
    feedbackEl.textContent = "فشل في إرسال الرسالة!";
    feedbackEl.classList.remove("success");
    feedbackEl.classList.add("error");
  }

  // Optionally hide the feedback after 3 seconds
  setTimeout(() => {
    feedbackEl.style.display = "none";
  }, 3000);
});
