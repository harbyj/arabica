/* jshint esversion: 6 */
$(function() {
  // Handle form submission
  $("#contactForm").on("submit", function(e) {
    e.preventDefault(); // Prevent the default form submission

    // For demo: randomly choose success or error (replace with your own logic)
    const isSuccess = Math.random() > 0.5;
    const $feedback = $("#feedback");

    // Show feedback container
    $feedback.show();

    if (isSuccess) {
      $feedback
        .text("تم الإرسال بنجاح!")
        .removeClass("error")
        .addClass("success");
    } else {
      $feedback
        .text("فشل في إرسال الرسالة!")
        .removeClass("success")
        .addClass("error");
    }

    // Optionally hide the feedback after 3 seconds
    setTimeout(function() {
      $feedback.fadeOut();
    }, 3000);
  });
});

