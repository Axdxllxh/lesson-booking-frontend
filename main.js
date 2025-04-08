new Vue({
  el: '#app',
  data: {
    // Lessons data is fetched from the back-end.
    lessons: [],
    // New search query field for filtering lessons.
    searchQuery: '',
    // Sorting fields.
    sortBy: 'subject',
    sortOrder: 'asc'
  },
  created: function() {
    var self = this;
    // Fetch lessons from the back-end API. Expected objects include subject, location, price, quantity, and rating.
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
  },
  computed: {
    // Filter lessons based on the search query matching lesson subject or location.
    filteredLessons: function() {
      var q = this.searchQuery.toLowerCase();
      return this.lessons.filter(function(lesson) {
        return lesson.subject.toLowerCase().includes(q) ||
               lesson.location.toLowerCase().includes(q);
      });
    },
    // Sort the filtered lessons using the selected field and order.
    sortedLessons: function() {
      var sorted = this.filteredLessons.slice();
      sorted.sort(function(a, b) {
        var valA = a[this.sortBy];
        var valB = b[this.sortBy];
        if (typeof valA === 'string') { valA = valA.toLowerCase(); }
        if (typeof valB === 'string') { valB = valB.toLowerCase(); }
        return this.sortOrder === 'asc'
          ? (valA > valB ? 1 : -1)
          : (valA < valB ? 1 : -1);
      }.bind(this));
      return sorted;
    }
  },
  methods: {
    // Toggle sort order between ascending and descending.
    toggleSort: function() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    }
  }
});
