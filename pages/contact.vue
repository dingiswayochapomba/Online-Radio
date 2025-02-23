<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Contact Us</h1>
    <div 
      :class="[theme === 'dark' ? 'bg-gray-800' : 'bg-[#2C2D27]']"
      class="rounded-lg shadow-md p-6"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block text-gray-300 mb-2">Name</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            :class="[theme === 'dark' ? 'bg-gray-700' : 'bg-[#4C4D47]']"
            class="w-full px-4 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          >
        </div>
        <div>
          <label for="email" class="block text-gray-300 mb-2">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            :class="[theme === 'dark' ? 'bg-gray-700' : 'bg-[#4C4D47]']"
            class="w-full px-4 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          >
        </div>
        <div>
          <label for="message" class="block text-gray-300 mb-2">Message</label>
          <textarea
            id="message"
            v-model="form.message"
            rows="4"
            :class="[theme === 'dark' ? 'bg-gray-700' : 'bg-[#4C4D47]']"
            class="w-full px-4 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          ></textarea>
        </div>
        <button
          type="submit"
          class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Send Message
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
const theme = useState('theme');

const form = reactive({
  name: '',
  email: '',
  message: ''
});

const handleSubmit = () => {
  console.log('Form submitted:', form);
  form.name = '';
  form.email = '';
  form.message = '';
};
</script> 