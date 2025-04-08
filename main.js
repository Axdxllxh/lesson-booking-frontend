new Vue({
  el: '#app',
  data: {
    lessons: [] 
  },
  created: function() {
    var self = this;
    // Fetch lessons from the back-end API
    fetch('http://localhost:3000/lessons')
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        self.lessons = data;
      })
      .catch(function(error) {
        console.error('Error fetching lessons:', error);
      });
  }
});
