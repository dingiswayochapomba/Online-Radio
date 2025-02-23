<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">About Us</h1>
    <div 
      :class="[theme === 'dark' ? 'bg-gray-800' : 'bg-[#2C2D27]']"
      class="rounded-lg shadow-md p-6"
    >
      <p class="text-gray-300 mb-4">
        Welcome to our Radio Streaming Platform! We provide a curated selection of radio stations
        from various genres for your listening pleasure.
      </p>
      <p class="text-gray-300">
        Our mission is to make quality radio content accessible to everyone, anywhere, anytime.
        Whether you're a fan of jazz, classical, or rock music, we've got something for you.
      </p>
    </div>
  </div>
</template>

<script setup>
const theme = useState('theme');
</script> 