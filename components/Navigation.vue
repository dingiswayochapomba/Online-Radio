<template>
  <nav class="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 fixed top-0 left-0 right-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink 
          to="/" 
          class="flex items-center gap-2 text-[#F6B17A] font-bold text-xl"
        >
          <span>🎵</span>
          TuneRadio
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center gap-4">
          <NuxtLink 
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="px-3 py-2 text-gray-400 hover:text-[#F6B17A] transition-colors relative group"
          >
            {{ link.text }}
            <span 
              class="absolute left-0 right-0 bottom-0 h-0.5 bg-[#F6B17A] scale-x-0 group-hover:scale-x-100 transition-transform origin-center"
            ></span>
          </NuxtLink>
        </div>

        <!-- Mobile Navigation -->
        <MobileNav />
      </div>
    </div>
  </nav>

  <!-- Spacer to prevent content from hiding under fixed nav -->
  <div class="h-16"></div>
</template>

<script setup>
const links = [
  { to: '/', text: 'Home' },
  { to: '/news_stations', text: 'News' },
  { to: '/gospel_stations', text: 'Gospel' },
  { to: '/malawi_stations', text: 'Malawi' },
  { to: '/top_jazz', text: 'Jazz' },
  { to: '/hip_hop_stations', text: 'Hip Hop' }
]
</script>

<style scoped>
.container {
  max-width: 1400px;
}

/* Active link styles */
.router-link-active {
  color: #F6B17A;
}

/* Transition for mobile menu */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 