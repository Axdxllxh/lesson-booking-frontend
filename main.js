// Create a Vue instance 
new Vue({
  el: '#app',
  data: {
    view: 'landing',     // Start with landing page; switch to 'store' after landing
    lessons: [],         // Array of lessons fetched from the backend
    cart: [],            // Shopping cart items
    searchQuery: '',     // Search query for filtering lessons
    sortBy: 'subject',   // Attribute to sort lessons by
    sortOrder: 'asc',    // Sort order: 'asc' or 'desc'
    form: {              // Checkout form data
      name: '',
      phone: ''
    },
    nameError: '',
    phoneError: ''
  },
  created: function() {
    var self = this;
    // Fetch lessons data from the backend API
    fetch('http://localhost:3000/lessons')
      .then(function(response) { return response.json(); })
      .then(function(data) {
        // Map each lesson to a local image based on its id
        data.forEach(lesson => {
          switch (lesson.id) {
            case 1:
              lesson.image = "./images/Art.webp";
              break;
            case 2:
              lesson.image = "./images/Chess.webp";
              break;
            case 3:
              lesson.image = "./images/Cooking.webp";
              break;
            case 4:
              lesson.image = "./images/Drama.webp";
              break;
            case 5:
              lesson.image = "./images/Football.webp";
              break;
            case 6:
              lesson.image = "./images/Math.webp";
              break;
            case 7:
              lesson.image = "./images/Music.webp";
              break;
            case 8:
              lesson.image = "./images/Programming.webp";
              break;
            case 9:
              lesson.image = "./images/Science.webp";
              break;
            case 10:
              lesson.image = "./images/Yoga.webp";
              break;
            default:
              lesson.image = "";
          }
        });
        self.lessons = data;
      })
      .catch(function(error) {
        console.error('Error fetching lessons:', error);
      });
  },
  computed: {
    // Filter lessons based on the search query (checks subject and location)
    filteredLessons: function() {
      var q = this.searchQuery.toLowerCase();
      return this.lessons.filter(function(lesson) {
        return lesson.subject.toLowerCase().indexOf(q) !== -1 ||
               lesson.location.toLowerCase().indexOf(q) !== -1;
      });
    },
    // Sort the filtered lessons based on the selected attribute and order
    sortedLessons: function() {
      var sorted = this.filteredLessons.slice();
      sorted.sort(function(a, b) {
        var valA = a[this.sortBy];
        var valB = b[this.sortBy];
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
        }
        if (typeof valB === 'string') {
          valB = valB.toLowerCase();
        }
        return this.sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      }.bind(this));
      return sorted;
    },
    // Calculate the total cost of items in the cart
    totalCost: function() {
      return this.cart.reduce(function(sum, item) {
        return sum + item.price * item.qty;
      }, 0);
    },
    // Check that the checkout form is valid
    isFormValid: function() {
      return !this.nameError && !this.phoneError && this.form.name && this.form.phone;
    }
  },
  methods: {
    // Toggle sort order between ascending and descending
    toggleSort: function() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    // Switch view from landing to store
    continueToStore: function() {
      this.view = 'store';
    },
    // Add a lesson to the shopping cart
    addToCart: function(lesson) {
      var item = this.cart.find(function(i) {
        return i.id === lesson.id;
      });
      if (item) {
        item.qty++;
      } else {
        this.cart.push(Object.assign({}, lesson, { qty: 1 }));
      }
      // Decrement available quantity locally
      lesson.quantity--;
    },
    // Remove one unit of an item from the cart
    removeOne: function(item) {
      item.qty--;
      var lesson = this.lessons.find(function(l) {
        return l.id === item.id;
      });
      if (lesson) {
        lesson.quantity++;
      }
      if (item.qty === 0) {
        this.cart = this.cart.filter(function(i) {
          return i.id !== item.id;
        });
      }
    },
    // Submit the order to the backend, then update lesson quantities via PUT
    submitOrder: function() {
      if (this.isFormValid) {
        var order = {
          name: this.form.name,
          phone: this.form.phone,
          items: this.cart.map(function(item) {
            return { id: item.id, quantity: item.qty };
          })
        };
        fetch('http://localhost:3000/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        })
          .then(response => response.json())
          .then(data => {
            alert('Thanks ' + order.name + ', your order has been placed!');
            // For each item in the cart, update the lesson's available quantity on the backend
            this.cart.forEach(item => {
              let lesson = this.lessons.find(l => l.id === item.id);
              if (lesson && lesson._id) {
                fetch(`http://localhost:3000/lessons/${lesson._id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ quantity: lesson.quantity })
                })
                  .then(res => res.json())
                  .then(updateRes => {
                    console.log(`Updated lesson ${lesson.id}:`, updateRes);
                  })
                  .catch(err => console.error(`Error updating lesson ${lesson.id}:`, err));
              }
            });
            // Clear the cart and reset form fields; return to store view
            this.cart = [];
            this.form = { name: '', phone: '' };
            this.view = 'store';
          })
          .catch(error => {
            console.error('Error placing order:', error);
          });
      }
    }
  },
  watch: {
    // Watch the name field for digits (invalid input)
    'form.name': function(val) {
      this.nameError = (/\d/.test(val)) ? 'Name must not contain numbers' : '';
    },
    // Watch the phone field for non-digits (invalid input)
    'form.phone': function(val) {
      this.phoneError = (/\D/.test(val)) ? 'Phone must contain only digits' : '';
    }
  }
});
