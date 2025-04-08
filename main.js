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
      lesson.space--;
    },
    // Commit 8: Implement removeOne method (for removing items from cart)
    removeOne(item) {
      // Decrement the quantity for the cart item
      item.qty--;
      // Find the corresponding lesson in the lessons array and restore one space
      const lesson = this.lessons.find(l => l.id === item.id);
      if (lesson) {
        lesson.space++;
      }
      // If the item quantity is now 0, remove it from the cart
      if (item.qty === 0) {
        this.cart = this.cart.filter(i => i.id !== item.id);
      }
    },
    submitOrder() {
      if (this.isFormValid) {
        alert(`Thanks ${this.form.name}, your order has been placed!`);
        this.cart = [];
        this.form = { name: '', phone: '' };
        this.view = 'store';
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
