
        let currentStarRating = 0;
        function setFeedbackStar(rating) {
            currentStarRating = rating;
            updateStars(rating);
        }
        function hoverStar(rating) {
            updateStars(rating, true);
        }
        function unhoverStar() {
            updateStars(currentStarRating);
        }
        function updateStars(rating, isHover = false) {
            const stars = document.querySelectorAll('.star-opt');
            stars.forEach((star, idx) => {
                if (idx < rating) {
                    star.classList.add(isHover ? 'hovered' : 'active');
                    if (!isHover) star.classList.remove('hovered');
                } else {
                    star.classList.remove('active', 'hovered');
                }
            });
        }

        function submitFeedback() {
            window.location.replace("./student-dashboard.html");
        }
    