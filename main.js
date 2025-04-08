new Vue({
  el: '#app',
  data: {
    view: 'store',
    lessons: [], // Lessons will be loaded from the backend via fetch
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
  created() {
    // Fetch lesson data from the backend (MongoDB)
    fetch('http://localhost:3000/lessons')
      .then(response => response.json())
      .then(data => {
        this.lessons = data;
      })
      .catch(error => {
        console.error('Error fetching lessons:', error);
      });
  },
  computed: {
    filteredLessons() {
      // Filter lessons based on search query against subject and location
      const q = this.searchQuery.toLowerCase();
      return this.lessons.filter(lesson =>
        lesson.subject.toLowerCase().includes(q) ||
        lesson.location.toLowerCase().includes(q)
      );
    },
    sortedLessons() {
      // Sort the filtered lessons by the selected attribute and order
      const sorted = [...this.filteredLessons];
      sorted.sort((a, b) => {
        let valA = a[this.sortBy];
        let valB = b[this.sortBy];
        if (typeof valA === 'string') { valA = valA.toLowerCase(); }
        if (typeof valB === 'string') { valB = valB.toLowerCase(); }
        return this.sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
      return sorted;
    },
    totalCost() {
      // Calculate the total cost of items in the cart
      return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    },
    isFormValid() {
      // Form is valid if no error messages and both name and phone are not empty
      return (
        !this.nameError &&
        !this.phoneError &&
        this.form.name.trim() &&
        this.form.phone.trim()
      );
    }
  },
  methods: {
    toggleSort() {
      // Toggle sort order between ascending and descending
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    addToCart(lesson) {
      // Add the lesson to the cart and update available quantity
      const item = this.cart.find(i => i.id === lesson.id);
      if (item) {
        item.qty++;
      } else {
        this.cart.push({ ...lesson, qty: 1 });
      }
      // Decrement available quantity, ensuring it doesn't go negative
      lesson.space = lesson.space > 0 ? lesson.space - 1 : 0;
    },
    removeOne(item) {
      // Remove one unit from the cart and restore available quantity
      item.qty--;
      const lesson = this.lessons.find(l => l.id === item.id);
      if (lesson) {
        lesson.space++;
      }
      // If quantity reaches zero, remove the item from the cart
      if (item.qty === 0) {
        this.cart = this.cart.filter(i => i.id !== item.id);
      }
    },
    submitOrder() {
      // Submit the order if the form is valid
      if (!this.isFormValid) return;
      const order = {
        name: this.form.name.trim(),
        phone: this.form.phone.trim(),
        items: this.cart.map(item => ({ id: item.id, quantity: item.qty }))
      };
      // Send a POST request to submit the order
      fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      })
        .then(response => response.json())
        .then(data => {
          alert(`Thank you, ${order.name}! Your order has been placed.`);
          this.cart = [];
          this.form = { name: '', phone: '' };
          this.view = 'store';
        })
        .catch(error => {
          console.error('Order submission error:', error);
          alert('Failed to submit order. Please try again.');
        });
    }
  },
  watch: {
    'form.name'(newVal) {
      // Validate that the name does not contain any numbers
      this.nameError = /\d/.test(newVal) ? 'Name must not contain numbers' : '';
    },
    'form.phone'(newVal) {
      // Validate that the phone contains digits only
      this.phoneError = /\D/.test(newVal) ? 'Phone must contain only digits' : '';
    }
  }
});
