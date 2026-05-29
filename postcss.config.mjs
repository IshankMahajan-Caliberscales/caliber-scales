// Tailwind CSS v4 via PostCSS. We use the PostCSS plugin rather than
// @tailwindcss/vite because Astro 6 bundles rolldown-vite, whose resolve
// binding is incompatible with the Tailwind Vite plugin's oxc resolver.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
