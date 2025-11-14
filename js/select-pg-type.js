document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".blog-lang-btn");
  const dropdown = document.querySelector(".blog-lang-dropdown-content");
  const arrow = btn.querySelector(".fa-caret-down");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
    arrow.style.transform = dropdown.classList.contains("show")
      ? "rotate(180deg)"
      : "rotate(0)";
  });

  // Close dropdown if clicked outside
  window.addEventListener("click", () => {
    dropdown.classList.remove("show");
    arrow.style.transform = "rotate(0)";
  });

  // Add ripple effect to button
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 0.6s linear;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
    `;
    
    btn.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);