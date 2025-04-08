// Create a new Vue instance bound to the element with id "app"
new Vue({
  el: '#app',
  data: {
    lessons: []  // This will store lessons fetched from the back-end
  },
  created: function() {
    var self = this;
    // Fetch lessons from the back-end API (GET /lessons)
    fetch('http://localhost:3000/lessons')
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        self.lessons = data; // Set the lessons array with the fetched data
      })
      .catch(function(error) {
        console.error('Error fetching lessons:', error);
      });
  }
});
