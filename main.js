new Vue({
  el: '#app',
  data: {
    view: 'landing',
    lessons: [],
    cart: [],
    searchQuery: '',
    sortBy: 'subject',
    sortOrder: 'asc',
    form: {
      name: '',
      phone: ''
    },
    nameError: '',
    phoneError: ''
  },
  created: function() {
    const self = this;
    // Using Render backend URL instead of localhost
    fetch('https://lesson-booking-backend-zlxp.onrender.com/lessons')
      .then(response => response.json())
      .then(data => {
        data.forEach(lesson => {
          switch (lesson.id) {
            case 1:
              lesson.image = "./images/Art.webp"; break;
            case 2:
              lesson.image = "./images/Chess.webp"; break;
            case 3:
              lesson.image = "./images/Cooking.webp"; break;
            case 4:
              lesson.image = "./images/Drama.webp"; break;
            case 5:
              lesson.image = "./images/Football.webp"; break;
            case 6:
              lesson.image = "./images/Math.webp"; break;
            case 7:
              lesson.image = "./images/Music.webp"; break;
            case 8:
              lesson.image = "./images/Programming.webp"; break;
            case 9:
              lesson.image = "./images/Science.webp"; break;
            case 10:
              lesson.image = "./images/Yoga.webp"; break;
            default:
              lesson.image = "";
          }
        });
        self.lessons = data;
      })
      .catch(error => {
        console.error('Error fetching lessons:', error);
      });
  },
  computed: {
    filteredLessons() {
      const q = this.searchQuery.toLowerCase();
      return this.lessons.filter(lesson =>
        lesson.subject.toLowerCase().includes(q) ||
        lesson.location.toLowerCase().includes(q)
      );
    },
    sortedLessons() {
      const sorted = this.filteredLessons.slice();
      sorted.sort((a, b) => {
        let valA = a[this.sortBy];
        let valB = b[this.sortBy];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        return this.sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
      return sorted;
    },
    totalCost() {
      return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    },
    isFormValid() {
      return !this.nameError && !this.phoneError && this.form.name && this.form.phone;
    }
  },
  methods: {
    toggleSort() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    continueToStore() {
      this.view = 'store';
    },
    addToCart(lesson) {
      const item = this.cart.find(i => i.id === lesson.id);
      if (item) {
        item.qty++;
      } else {
        this.cart.push(Object.assign({}, lesson, { qty: 1 }));
      }
      lesson.quantity--;
    },
    removeOne(item) {
      item.qty--;
      const lesson = this.lessons.find(l => l.id === item.id);
      if (lesson) lesson.quantity++;
      if (item.qty === 0) {
        this.cart = this.cart.filter(i => i.id !== item.id);
      }
    },
    submitOrder() {
      if (this.isFormValid) {
        const order = {
          name: this.form.name,
          phone: this.form.phone,
          items: this.cart.map(item => ({ id: item.id, quantity: item.qty }))
        };
        fetch('https://lesson-booking-backend-zlxp.onrender.com/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        })
          .then(response => response.json())
          .then(data => {
            alert('Thanks ' + order.name + ', your order has been placed!');
            this.cart.forEach(item => {
              const lesson = this.lessons.find(l => l.id === item.id);
              if (lesson && lesson._id) {
                fetch(`https://lesson-booking-backend-zlxp.onrender.com/lessons/${lesson._id}`, {
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
    'form.name': function(val) {
      this.nameError = /\d/.test(val) ? 'Name must not contain numbers' : '';
    },
    'form.phone': function(val) {
      this.phoneError = /\D/.test(val) ? 'Phone must contain only digits' : '';
    }
  }
});
