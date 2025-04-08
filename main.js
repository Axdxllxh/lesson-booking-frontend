new Vue({
  el: '#app',
  data: {
    lessons: [],         // Lessons are fetched from the back-end and now include subject, location, price, rating, and quantity.
    searchQuery: '',
    sortBy: 'subject',   // Default sort field.
    sortOrder: 'asc',    // Default sort order.
    cart: []             // Introduced basic cart structure.
  },
  created: function() {
    var self = this;
    // Fetch lessons from the back-end API.
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
    // Filter lessons based on search query matching subject or location.
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
    },
    // Add a lesson to the cart and decrease the lesson's available quantity.
    addToCart: function(lesson) {
      const cartItem = this.cart.find(item => item.id === lesson.id);
      if (cartItem) {
        cartItem.qty++;
      } else {
        // Add lesson to cart with selected details and initial quantity of 1.
        this.cart.push({
          id: lesson.id,
          subject: lesson.subject,
          location: lesson.location,
          price: lesson.price,
          qty: 1
        });
      }
      lesson.quantity--;
    }
  }
});
