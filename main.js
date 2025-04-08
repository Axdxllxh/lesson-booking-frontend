import { lessons } from './data.js';

new Vue({
  el: '#app',
  data: {
    view: 'store',
    lessons,  
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
  computed: {
    filteredLessons() {
      const q = this.searchQuery.toLowerCase();
      return this.lessons.filter(l =>
        l.subject.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q)
      );
    },
    sortedLessons() {
      const sorted = [...this.filteredLessons];
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
    addToCart(lesson) {
      const item = this.cart.find(i => i.id === lesson.id);
      if (item) {
        item.qty++;
      } else {
        this.cart.push({ ...lesson, qty: 1 });
      }
      lesson.space--;  // decrease available quantity
    },
    removeOne(item) {
      item.qty--;
      const lesson = this.lessons.find(l => l.id === item.id);
      if (lesson) lesson.space++; // restore the available quantity
      if (item.qty === 0) {
        this.cart = this.cart.filter(i => i.id !== item.id);
      }
    },
    submitOrder() {
      if (this.isFormValid) {
        // Build order object from form data and cart items.
        const order = {
          name: this.form.name,
          phone: this.form.phone,
          items: this.cart.map(item => ({ id: item.id, quantity: item.qty }))
        };

        // Send POST request to the back-end /order endpoint.
        fetch('http://localhost:3000/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        })
          .then(response => response.json())
          .then(data => {
            alert(`Thanks ${this.form.name}, your order has been placed!`);
            // Reset cart and form after a successful order submission.
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
    'form.name'(val) {
      this.nameError = /\d/.test(val) ? 'Name must not contain numbers' : '';
    },
    'form.phone'(val) {
      this.phoneError = /\D/.test(val) ? 'Phone must contain only digits' : '';
    }
  }
});